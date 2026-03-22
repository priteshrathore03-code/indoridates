import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { useUserProfile } from "../../data/userProfile";
import { auth, db } from "../../firebaseConfig";

import IndoreBackground from "../components/IndoreBackground";

export default function Home() {
  const router = useRouter();
  const { viewUser } = useLocalSearchParams();
  const { user: currentUser } = useUserProfile();

  const [users, setUsers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      const currentUid = auth.currentUser?.uid;
      if (!currentUid || !currentUser) return;

      const snap = await getDocs(collection(db, "users"));

      const list: any[] = [];

      snap.forEach((docSnap) => {
        if (docSnap.id === currentUid) return;

        const data = docSnap.data();

        const photos = Array.isArray(data.photos)
          ? data.photos.filter((p: string) => p && p.trim() !== "")
          : [];

        const media = [
          ...photos,
          ...(data.video && data.video.trim() !== "" ? [data.video] : []),
        ];

        if (media.length === 0) return;

        list.push({
          id: docSnap.id,
          name: data.name || "Indori",
          age: data.age || 18,
          bio: data.bio || "",
          media,
        });
      });

      setUsers(list);
      setLoading(false);
    };

    loadUsers();
  }, [currentUser]);

  // 🔥 correct user (view profile + normal)
  const user = viewUser
    ? users.find((u) => u.id === viewUser)
    : users[currentIndex];

  const nextUser = () => {
    if (viewUser) return;
    setCurrentIndex((prev) => prev + 1);
    setMediaIndex(0);
  };

  // 🔥 LIKE + MATCH + CHAT (RESTORED)
  const handleLike = async () => {
    const target = user;
    const myUid = auth.currentUser?.uid;
    if (!target || !myUid) return;

    // save like
    await addDoc(collection(db, "likes"), {
      from: myUid,
      to: target.id,
    });

    // check match
    const q = query(
      collection(db, "likes"),
      where("from", "==", target.id),
      where("to", "==", myUid),
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      const roomId = [myUid, target.id].sort().join("_");

      await setDoc(doc(db, "chatRooms", roomId), {
        users: [myUid, target.id],
        createdAt: Date.now(),
      });

      Alert.alert("🎉 It's a Match!", "Start chatting now!", [
        {
          text: "Open Chat",
          onPress: () => router.push("/chat/" + roomId),
        },
      ]);
    }

    nextUser();
  };

  const handleDislike = () => {
    nextUser();
  };

  if (loading) {
    return (
      <IndoreBackground>
        <ActivityIndicator style={{ flex: 1 }} color="#ff4d6d" />
      </IndoreBackground>
    );
  }

  if (!user) {
    return (
      <IndoreBackground>
        <View style={styles.center}>
          <Text style={{ color: "white" }}>No more profiles 😅</Text>
        </View>
      </IndoreBackground>
    );
  }

  const media = user.media || [];
  const currentMedia = media[mediaIndex];

  const isVideo =
    typeof currentMedia === "string" && currentMedia.includes(".mp4");

  return (
    <IndoreBackground>
      <View style={styles.container}>
        <View key={user.id + "-" + mediaIndex} style={styles.card}>
          <View style={{ flex: 1 }}>
            {isVideo ? (
              <Video
                key={currentMedia}
                source={{ uri: currentMedia }}
                style={StyleSheet.absoluteFillObject}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
              />
            ) : (
              <Image
                key={currentMedia}
                source={{ uri: currentMedia }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                contentPosition="center"
                cachePolicy="memory-disk"
                priority="high"
              />
            )}

            {/* tap left/right */}
            <View style={styles.tapContainer}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  if (mediaIndex > 0) setMediaIndex(mediaIndex - 1);
                }}
              />
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  if (mediaIndex < media.length - 1)
                    setMediaIndex(mediaIndex + 1);
                }}
              />
            </View>

            {/* top bars */}
            <View style={styles.dots}>
              {media.map((_: any, i: number) => (
                <View
                  key={i}
                  style={[styles.dot, { opacity: i === mediaIndex ? 1 : 0.3 }]}
                />
              ))}
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>
              {user.name}, {user.age}
            </Text>
            <Text style={styles.bio}>{user.bio}</Text>
            <Text style={{ color: "white" }}>📍 Nearby</Text>
          </View>
        </View>

        {/* 🔥 buttons always visible */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={handleDislike}>
            <Text style={{ fontSize: 30 }}>❌</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={handleLike}>
            <Text style={{ fontSize: 30 }}>❤️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  card: {
    height: 500,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111",
  },

  tapContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },

  dots: {
    position: "absolute",
    top: 10,
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 5,
  },

  dot: {
    flex: 1,
    height: 3,
    marginHorizontal: 2,
    backgroundColor: "white",
    borderRadius: 2,
  },

  info: {
    position: "absolute",
    bottom: 0,
    padding: 20,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  bio: {
    color: "white",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },

  btn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
