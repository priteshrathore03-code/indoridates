import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { sendPersonalNotification } from "../../services/notificationService";

import { useFocusEffect, useRouter } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  startAfter,
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
  const { focusUser } = useLocalSearchParams();
  const focusUserId = Array.isArray(focusUser) ? focusUser[0] : focusUser;

  const [users, setUsers] = useState<SwipeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const [matchPair, setMatchPair] = useState<{
    currentUser: SwipeUser;
    matchedUser: SwipeUser;
  } | null>(null);

  const historyRef = useRef<SwipeUser[]>([]);
  // ✅ UPDATE FUNCTION LOGIC:
  const loadUsers = useCallback(async () => {
    try {
      // const cached = await AsyncStorage.getItem("home_profiles");

      // if (cached) {
      //   const parsed = JSON.parse(cached);

      //   if (parsed?.length > 0) {
      //     console.log("USING CACHE:", parsed.length);

      //     setUsers(parsed);
      //     setLoading(false);
      //   }
      // }
      setLoading(true);
      const currentUid = auth.currentUser?.uid;
      if (!currentUid) {
        setLoading(false);
        return;
      }

      const userSnap = await getDoc(doc(db, "users", currentUid));
      const userData = userSnap.data();

      const today = new Date().toISOString().split("T")[0];

      if (userData?.dailyViewsDate !== today) {
        await updateDoc(doc(db, "users", currentUid), {
          dailyViews: 0,
          dailyViewsDate: today,
        });

        if (userData) {
          userData.dailyViews = 0;
        }
      }

      if ((userData?.dailyViews || 0) >= 20) {
        setLimitReached(true);
        setLoading(false);
        return;
      }

      const liked = userData?.liked || [];
      const disliked = userData?.disliked || [];
      const superliked = userData?.superliked || [];

      // 1. Ekdum pehle jaisi normal aur sidhi query bina kisi firebase filter ke
      const myGender = myProfile?.gender?.toLowerCase();

      const targetGender = myGender === "male" ? "female" : "male";

      const getBatch = async (lastDoc?: any) => {
        const q = lastDoc
          ? query(
              collection(db, "users"),
              where("gender", "==", targetGender),
              startAfter(lastDoc),
              limit(20),
            )
          : query(
              collection(db, "users"),
              where("gender", "==", targetGender),
              limit(20),
            );

        return await getDocs(q);
      };

      let snap = await getBatch();

      const list: SwipeUser[] = [];

      let lastDoc: any = undefined;
      let hasMore = true;

      while (hasMore && list.length < 20) {
        const snap = await getBatch(lastDoc);

        if (snap.empty) {
          hasMore = false;
          break;
        }

        lastDoc = snap.docs[snap.docs.length - 1];

        for (const docSnap of snap.docs) {
          if (docSnap.id === currentUid) continue;

          const isFocusedUser = docSnap.id === focusUserId;

          if (
            !isFocusedUser &&
            (liked.includes(docSnap.id) ||
              disliked.includes(docSnap.id) ||
              superliked.includes(docSnap.id))
          ) {
            continue;
          }

          const data = docSnap.data();

          const photos = Array.isArray(data.photos)
            ? data.photos.filter((p: string) => p && p.trim() !== "")
            : [];

          const media = [
            ...photos,
            ...(data.video && data.video.trim() !== "" ? [data.video] : []),
          ];

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
                data.longitude,
              ),
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

          if (list.length >= 20) {
            break;
          }
        }
      }

      // Images prefetch background me
      // Images prefetch
      list.forEach((user) => {
        user.media.forEach((url) => {
          if (url && url.startsWith("http")) {
            Image.prefetch(url).catch(() => {});
          }
        });
      });

      // 🔥 Likes se profile open hui hai
      if (focusUserId) {
        const focusedSnap = await getDoc(doc(db, "users", focusUserId));

        if (focusedSnap.exists()) {
          const data = focusedSnap.data();

          const photos = Array.isArray(data.photos)
            ? data.photos.filter((p: string) => p && p.trim() !== "")
            : [];

          const media = [
            ...photos,
            ...(data.video && data.video.trim() !== "" ? [data.video] : []),
          ];

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
                data.longitude,
              ),
            );
          }

          setUsers([
            {
              id: focusedSnap.id,
              name: data.name || "User",
              age: data.age || 18,
              bio: data.bio || "",
              media,
              distance,
              latitude: data.latitude,
              longitude: data.longitude,
              gender: data.gender,
            },
          ]);

          setLoading(false);
          return;
        }
      }

      console.log("TOTAL LOADED USERS:", list.length);

      const finalList = list.slice(0, 20);
      console.log("TOTAL LOADED USERS:", finalList.length);
      setUsers(finalList);
      if (finalList.length === 0) {
        console.log("NO MORE FRESH USERS FOUND");
      }

      // await AsyncStorage.setItem("home_profiles", JSON.stringify(finalList));
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }, [myProfile?.gender, focusUserId]);

  // 🔥 EDIT YAHAN HAI: [loadUsers] ko hata kar khali [] kar diya hai
  useEffect(() => {
    if (!myProfile?.gender) return;

    loadUsers();
  }, [myProfile?.gender, focusUserId]);
  useEffect(() => {
    if (!limitReached) return;

    const interval = setInterval(() => {
      const now = new Date();

      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [limitReached]); // 👈 Isse data sirf ek baar screen khulne par load hoga, har swipe par nahi
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  const handleSwipe = useCallback(
    async (action: SwipeAction) => {
      let target: SwipeUser | null = null;

      setUsers((prev) => {
        if (prev.length === 0) return prev;

        target = prev[0];

        const updated = prev.slice(1);
        AsyncStorage.setItem("home_profiles", JSON.stringify(updated)).catch(
          () => {},
        );

        // 🔥 Focused user swipe hone ke baad normal home pe wapas
        if (focusUserId && target?.id === focusUserId) {
          setTimeout(() => {
            router.replace("/home");
          }, 100);
        }

        return updated;
      });

      // ... baaki ka setTimeout wala code same rahega

      // 2. Choti si deri (0ms) ke sath database ko background mein update hone do
      setTimeout(async () => {
        const myUid = auth.currentUser?.uid;

        if (!myUid) return;

        await updateDoc(doc(db, "users", myUid), {
          dailyViews: increment(1),
        });
        const remainingUsers = users.length - 1;

        if (remainingUsers <= 0) {
          loadUsers();
        }
        const userSnap = await getDoc(doc(db, "users", myUid));
        const userData = userSnap.data();

        if ((userData?.dailyViews || 0) >= 20) {
          setLimitReached(true);
        }
        if (!target || !myUid) return;

        try {
          historyRef.current.push(target);

          if (action === "like" || action === "superlike") {
            // Database Update
            await updateDoc(doc(db, "users", myUid), {
              [action === "superlike" ? "superliked" : "liked"]: arrayUnion(
                target.id,
              ),
            });

            await addDoc(collection(db, "likes"), {
              from: myUid,
              to: target.id,
              type: action,
              createdAt: Date.now(),
            });

            // Send Notification
            await sendPersonalNotification(
              target.id,
              action === "superlike"
                ? "Super Like! ⭐"
                : "Someone Likes You! ❤️",
              `${myProfile?.name || "Someone"} ${action === "superlike" ? "super-liked" : "liked"} your profile!`,
            );

            // Check for Match
            const q = query(
              collection(db, "likes"),
              where("from", "==", target.id),
              where("to", "==", myUid),
            );

            const snap = await getDocs(q);
            console.log("SNAP SIZE:", snap.size);

            if (!snap.empty) {
              const roomId = [myUid, target.id].sort().join("_");

              await setDoc(doc(db, "chatRooms", roomId), {
                users: [myUid, target.id],
                createdAt: Date.now(),
              });

              // 🔥 Match hone ke baad LikesYou se remove
              const likesQuery = query(
                collection(db, "likes"),
                where("from", "==", target.id),
                where("to", "==", myUid),
              );

              const likesSnap = await getDocs(likesQuery);

              likesSnap.forEach(async (d) => {
                await deleteDoc(doc(db, "likes", d.id));
              });

              await sendPersonalNotification(
                target.id,
                "It's a Match! 🔥",
                `You and ${myProfile?.name} have matched! Start chatting now.`,
              );

              setMatchPair({
                currentUser: {
                  id: myUid,
                  name: myProfile?.name || "You",
                  age: myProfile?.age || 18,
                  bio: myProfile?.bio || "",
                  media: myProfile?.photos || [],
                },
                matchedUser: target,
              });
            }
            // 🔥 Match hone ke baad LikesYou se hatao
          }

          if (action === "dislike") {
            await updateDoc(doc(db, "users", myUid), {
              disliked: arrayUnion(target.id),
            });

            // 🔥 LikesYou se bhi hatao
            const dislikeLikeQuery = query(
              collection(db, "likes"),
              where("from", "==", target.id),
              where("to", "==", myUid),
            );

            const dislikeSnap = await getDocs(dislikeLikeQuery);

            dislikeSnap.forEach(async (d) => {
              await deleteDoc(doc(db, "likes", d.id));
            });
          }
        } catch (error) {
          console.error("Swipe error in background:", error);
        }
      }, 0);
    },
    [myProfile?.gender, focusUserId], // 👈 Isme se 'users' hata diya hai taaki purane data ka conflict na ho
  );

  const handleUndo = () => {
    if (historyRef.current.length > 0) {
      const lastUser = historyRef.current.pop();

      if (lastUser) {
        setUsers((prev) => [lastUser, ...prev]);
      }
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

  const currentUser = users[0];
  if (limitReached) {
    return (
      <IndoreBackground>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Daily Limit Reached 🚀</Text>

          <Text style={styles.emptySubtext}>Next 20 profiles available in</Text>

          <Text
            style={{
              color: "#ff4d6d",
              fontSize: 24,
              fontWeight: "bold",
              marginTop: 10,
            }}
          >
            {timeLeft}
          </Text>
        </View>
      </IndoreBackground>
    );
  }
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
          users={users}
          onSwipe={handleSwipe}
          onCardPress={() => router.push(`/user/${currentUser.id}`)}
          onUndo={handleUndo}
        />

        {matchPair && (
          <MatchModal
            currentUser={matchPair.currentUser}
            matchedUser={matchPair.matchedUser}
            onChat={() => {
              const myUid = auth.currentUser?.uid;
              const otherId = matchPair.matchedUser.id;

              const roomId = [myUid, otherId].sort().join("_");

              setMatchPair(null); // modal close
              router.push(`/chat/${roomId}`); // 🔥 chat open
            }}
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
