import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

type UserProfile = {
  id: string;
  name: string;
  age: number;
  bio?: string;
  gender?: string;
  photos?: string[];
};

export default function Home() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const currentUid = auth.currentUser?.uid;

      const fetchedUsers: UserProfile[] = [];

      snapshot.forEach((docSnap) => {
        if (docSnap.id !== currentUid) {
          const data = docSnap.data();
          fetchedUsers.push({
            id: docSnap.id,
            name: data.name || "Indori",
            age: data.age || 18,
            bio: data.bio || "Rajwada pe coffee? 😎",
            gender: data.gender,
            photos: data.photos || [],
          });
        }
      });

      setUsers(fetchedUsers);
    } catch (error) {
      console.log("FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const currentUser = auth.currentUser;
    const likedUser = users[currentIndex];

    if (!currentUser || !likedUser) return;

    // 🔥 Save Like
    await setDoc(doc(db, "likes", `${currentUser.uid}_${likedUser.id}`), {
      from: currentUser.uid,
      to: likedUser.id,
      createdAt: serverTimestamp(),
    });

    setCurrentIndex((prev) => prev + 1);
  };

  const handleDislike = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return (
      <IndoreBackground>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#ff4d6d" />
        </View>
      </IndoreBackground>
    );
  }

  const user = users[currentIndex];

  if (!user) {
    return (
      <IndoreBackground>
        <View style={styles.loader}>
          <Text style={styles.noMoreText}>
            Aaj ke liye bas itne hi Indori mile 😅
          </Text>
        </View>
      </IndoreBackground>
    );
  }

  return (
    <IndoreBackground>
      <FadeWrapper>
        <View style={styles.container}>
          <View style={styles.card}>
            <Image
              source={{
                uri:
                  user.photos && user.photos.length > 0
                    ? user.photos[0]
                    : "https://via.placeholder.com/400",
              }}
              style={styles.image}
            />

            <View style={styles.overlay} />

            <View style={styles.infoBox}>
              <Text style={styles.name}>
                {user.name}, {user.age}
              </Text>

              <Text numberOfLines={2} style={styles.bio}>
                {user.bio}
              </Text>

              <Text style={styles.city}>📍 Indore • Rajwada Vibes</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.dislike]}
              onPress={handleDislike}
            >
              <Text style={styles.actionText}>❌</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.like]}
              onPress={handleLike}
            >
              <Text style={styles.actionText}>❤️</Text>
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
    padding: 20,
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
    fontWeight: "bold",
  },
  card: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  image: {
    width: "100%",
    height: 420,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  infoBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  bio: {
    marginTop: 6,
    color: "white",
    opacity: 0.9,
  },
  city: {
    marginTop: 8,
    color: "#ff4d6d",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 25,
  },
  actionBtn: {
    width: 75,
    height: 75,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  like: {
    backgroundColor: "#ff4d6d",
  },
  dislike: {
    backgroundColor: "#444",
  },
  actionText: {
    fontSize: 30,
  },
});
