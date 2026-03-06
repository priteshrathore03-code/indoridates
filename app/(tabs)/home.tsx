import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

const { width } = Dimensions.get("window");

type UserProfile = {
  id: string;
  name: string;
  age?: number;
  bio?: string;
  photos?: string[];
};

export default function Home() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const currentUid = auth.currentUser?.uid;
      const fetched: UserProfile[] = [];

      snapshot.forEach((docSnap) => {
        if (docSnap.id === currentUid) return;
        const data = docSnap.data();
        const photos = Array.isArray(data.photos)
          ? data.photos.filter((p: string) => p && p.trim() !== "")
          : [];

        if (photos.length >= 1) {
          fetched.push({
            id: docSnap.id,
            name: data.name || "Indori",
            age: data.age || 18,
            bio: data.bio || "Bhiya kaise ho!",
            photos: photos,
          });
        }
      });
      setUsers(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
          <Text style={styles.noMoreText}>Sab khatam! 😅</Text>
        </View>
      </IndoreBackground>
    );

  // ✅ YAHAN DEKH: URI ko clean kar rahe hain
  const imageUri =
    Array.isArray(user.photos) && user.photos.length > 0
      ? user.photos[0]
      : null;

  return (
    <IndoreBackground>
      <FadeWrapper>
        <View style={styles.container}>
          <View style={styles.card}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  key={imageUri}
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                  onLoadStart={() => console.log("Trying to load:", imageUri)}
                  onError={(e) =>
                    console.log(
                      "Load Failed for:",
                      imageUri,
                      e.nativeEvent.error,
                    )
                  }
                />
              </View>
            ) : (
              <View
                style={[
                  styles.image,
                  {
                    backgroundColor: "#222",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text style={{ color: "white" }}>No Photo URL</Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.name}>
                {user.name}, {user.age}
              </Text>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setCurrentIndex((p) => p + 1)}
            >
              <Text style={{ fontSize: 30 }}>❌</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#ff4d6d" }]}
              onPress={() => setCurrentIndex((p) => p + 1)}
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
  container: { flex: 1, padding: 15, justifyContent: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  noMoreText: { color: "white", fontSize: 18 },
  card: {
    height: 450,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111", // Black background agar photo na load ho
    position: "relative",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
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
  name: { fontSize: 24, fontWeight: "bold", color: "white" },
  bio: { color: "white", marginTop: 5 },
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
  actionText: { fontSize: 25 },
});
