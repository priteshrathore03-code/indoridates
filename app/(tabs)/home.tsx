import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { useUserProfile } from "../../data/userProfile";
import { auth, db } from "../../firebaseConfig";
import { getDistance } from "../../utils/distance";

import IndoreBackground from "../components/IndoreBackground";
import MatchModal from "../components/MatchModal";
import SwipeStack from "../components/SwipeStack";

export interface SwipeUser {
  id: string;
  name: string;
  age: number;
  bio: string;
  media: string[];
  distance?: number;
  latitude?: number;
  longitude?: number;
  gender?: string;
}

type SwipeAction = "like" | "dislike" | "superlike";

export default function Home() {
  const router = useRouter();
  const { user: myProfile } = useUserProfile();

  const [users, setUsers] = useState<SwipeUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [matchPair, setMatchPair] = useState<{
    currentUser: SwipeUser;
    matchedUser: SwipeUser;
  } | null>(null);

  const historyRef = useRef<SwipeUser[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        setLoading(false);
        return;
      }

      const userSnap = await getDoc(doc(db, "users", currentUid));
      const userData = userSnap.data();

      const liked = userData?.liked || [];
      const disliked = userData?.disliked || [];
      const superliked = userData?.superliked || [];

      const snap = await getDocs(collection(db, "users"));
      const list: SwipeUser[] = [];

      snap.forEach((docSnap) => {
        if (docSnap.id === currentUid) return;
        if (
          liked.includes(docSnap.id) ||
          disliked.includes(docSnap.id) ||
          superliked.includes(docSnap.id)
        )
          return;

        const data = docSnap.data();

        const photos = Array.isArray(data.photos)
          ? data.photos.filter((p: string) => p && p.trim() !== "")
          : [];

        const media = [
          ...photos,
          ...(data.video && data.video.trim() !== "" ? [data.video] : []),
        ];

        if (media.length === 0) return;

        let distance;

        if (
          myProfile?.latitude &&
          myProfile?.longitude &&
          data.latitude &&
          data.longitude
        ) {
          distance = Math.round(
            getDistance(
              myProfile.latitude,
              myProfile.longitude,
              data.latitude,
              data.longitude
            )
          );
        }

        list.push({
          id: docSnap.id,
          name: data.name || "User",
          age: data.age || 18,
          bio: data.bio || "",
          media,
          distance,
          latitude: data.latitude,
          longitude: data.longitude,
          gender: data.gender,
        });
      });

      setUsers(list);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }, [myProfile]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSwipe = useCallback(
    async (action: SwipeAction) => {
      const target = users[currentIndex];
      const myUid = auth.currentUser?.uid;

      if (!target || !myUid) return;

      try {
        historyRef.current.push(target);

        if (action === "like" || action === "superlike") {
          await updateDoc(doc(db, "users", myUid), {
            [action === "superlike" ? "superliked" : "liked"]: arrayUnion(
              target.id
            ),
          });

          await addDoc(collection(db, "likes"), {
            from: myUid,
            to: target.id,
            type: action,
          });

          const q = query(
            collection(db, "likes"),
            where("from", "==", target.id),
            where("to", "==", myUid)
          );

          const snap = await getDocs(q);

          if (!snap.empty) {
            const roomId = [myUid, target.id].sort().join("_");

            await setDoc(doc(db, "chatRooms", roomId), {
              users: [myUid, target.id],
              createdAt: Date.now(),
            });

            setMatchPair({
              currentUser: target,
              matchedUser: target,
            });
          }
        }

        if (action === "dislike") {
          await updateDoc(doc(db, "users", myUid), {
            disliked: arrayUnion(target.id),
          });
        }

        setCurrentIndex((prev) => prev + 1);
      } catch (error) {
        console.error("Swipe error:", error);
      }
    },
    [users, currentIndex]
  );

  const handleUndo = () => {
    if (historyRef.current.length > 0) {
      historyRef.current.pop();
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  };

  if (loading) {
    return (
      <IndoreBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#ff4d6d" />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      </IndoreBackground>
    );
  }

  const currentUser = users[currentIndex];

  if (!currentUser) {
    return (
      <IndoreBackground>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No more profiles 😅</Text>
          <Text style={styles.emptySubtext}>
            Check back later for new matches!
          </Text>
        </View>
      </IndoreBackground>
    );
  }

  return (
    <IndoreBackground>
      <View style={styles.container}>
        <SwipeStack
          users={users.slice(currentIndex, currentIndex + 3)}
          onSwipe={handleSwipe}
          onCardPress={() => router.push(`/user/${currentUser.id}`)}
          onUndo={handleUndo}
        />

        {matchPair && (
          <MatchModal
            currentUser={matchPair.currentUser}
            matchedUser={matchPair.matchedUser}
            onChat={() => {}}
            onContinue={() => setMatchPair(null)}
          />
        )}
      </View>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  emptyText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  emptySubtext: {
    color: "#aaa",
    fontSize: 14,
  },
});