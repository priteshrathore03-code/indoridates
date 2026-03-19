import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { useUserProfile } from "../../data/userProfile";
import { auth, db } from "../../firebaseConfig";

import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

const { width } = Dimensions.get("window");

type UserProfile = {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  gender?: string;
  photos?: string[];
};

export default function Home() {
  const router = useRouter();
  const { viewUser } = useLocalSearchParams();
  const { user: currentUser } = useUserProfile();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (viewUser) {
      const loadUser = async () => {
        const docRef = await getDoc(doc(db, "users", String(viewUser)));

        if (docRef.exists()) {
          const data = docRef.data();

          setUsers([
            {
              id: docRef.id,
              name: data.name || "Indori",
              age: data.age || 18,
              bio: data.bio || "Hello Indore!",
              gender: data.gender,
              photos: data.photos || [],
            },
          ]);

          setCurrentIndex(0);
          setPhotoIndex(0);
          setLoading(false);
        }
      };

      loadUser();
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const currentUid = auth.currentUser?.uid;
      const fetched: UserProfile[] = [];

      snapshot.forEach((docSnap) => {
        if (docSnap.id === currentUid) return;

        const data = docSnap.data();

        if (currentUser && data.gender === currentUser.gender) return;

        const photos = Array.isArray(data.photos)
          ? data.photos.filter((p: string) => p && p.trim() !== "")
          : [];

        if (photos.length > 0) {
          fetched.push({
            id: docSnap.id,
            name: data.name || "Indori",
            age: data.age || 18,
            bio: data.bio || "Hello Indore!",
            gender: data.gender,
            photos,
          });
        }
      });

      setUsers(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, viewUser]);

  const nextUser = () => {
    if (viewUser) {
      router.replace("/(tabs)/chat");
      return;
    }

    setCurrentIndex((p) => p + 1);
    setPhotoIndex(0);
  };

  const nextPhoto = () => {
    const user = users[currentIndex];
    if (!user) return;

    const photos = user.photos || [];

    if (photos.length <= 1) return;

    setPhotoIndex((prev) => (prev + 1 >= photos.length ? 0 : prev + 1));
  };

  const handleLike = async () => {
    const target = users[currentIndex];
    if (!target) return;

    const myUid = auth.currentUser?.uid;
    if (!myUid) return;

    // save like
    await addDoc(collection(db, "likes"), {
      from: myUid,
      to: target.id,
    });

    const q = query(
      collection(db, "likes"),
      where("from", "==", target.id),
      where("to", "==", myUid),
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      const roomId = [myUid, target.id].sort().join("_");

      // create chat room (unique)
      await setDoc(doc(db, "chatRooms", roomId), {
        users: [myUid, target.id],
        createdAt: Date.now(),
      });

      // remove likes from list
      snap.forEach(async (d) => {
        await deleteDoc(d.ref);
      });

      Alert.alert("🎉 It's a Match!", "Start chatting now!", [
        {
          text: "Open Chat",
          onPress: () => router.push("/chat/" + roomId),
        },
      ]);
    }

    if (viewUser) {
      setCurrentIndex((p) => p + 1);
      router.replace("/(tabs)/chat");
      return;
    }

    nextUser();
  };

  if (loading)
    return (
      <IndoreBackground>
        <ActivityIndicator style={{ flex: 1 }} color="#ff4d6d" />
      </IndoreBackground>
    );

  const user = users[currentIndex];

  if (!user)
    return (
      <IndoreBackground>
        <View style={styles.loader}>
          <Text style={styles.noMoreText}>No more profiles 😅</Text>
        </View>
      </IndoreBackground>
    );

  const photos = user.photos || [];
  const imageUri = photos?.[photoIndex] || "";

  return (
    <IndoreBackground>
      <FadeWrapper>
        <View style={styles.container}>
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={nextPhoto}
              style={styles.imageContainer}
            >
              <Image
                key={user.id + "-" + photoIndex}
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
              />
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.name}>
                {user.name}, {user.age}
              </Text>

              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={nextUser}>
              <Text style={{ fontSize: 30 }}>❌</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#ff4d6d" }]}
              onPress={handleLike}
            >
              <Text style={{ fontSize: 30 }}>❤️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  noMoreText: {
    color: "white",
    fontSize: 18,
  },

  card: {
    height: 480,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111",
  },

  imageContainer: {
    width: "100%",
    height: "100%",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  infoBox: {
    position: "absolute",
    bottom: 0,
    padding: 20,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  bio: {
    color: "white",
    marginTop: 5,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  actionBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
});
