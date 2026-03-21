import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Image } from "expo-image";
import { useRouter } from "expo-router";

import { addDoc, collection, getDocs } from "firebase/firestore";

import { useUserProfile } from "../../data/userProfile";
import { auth, db } from "../../firebaseConfig";

import IndoreBackground from "../components/IndoreBackground";

const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const { user: currentUser } = useUserProfile();

  const [users, setUsers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
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

        if (!data.photos || data.photos.length === 0) return;

        list.push({
          id: docSnap.id,
          name: data.name || "Indori",
          age: data.age || 18,
          bio: data.bio || "",
          photos: data.photos,
        });
      });

      setUsers(list);
      setLoading(false);
    };

    loadUsers();
  }, [currentUser]);

  const nextUser = () => {
    setCurrentIndex((prev) => prev + 1);
    setPhotoIndex(0);
  };

  const nextPhoto = () => {
    const user = users[currentIndex];
    if (!user) return;

    const photos = user.photos || [];

    if (photoIndex < photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    }
  };

  const handleLike = async () => {
    const target = users[currentIndex];
    const myUid = auth.currentUser?.uid;
    if (!target || !myUid) return;

    await addDoc(collection(db, "likes"), {
      from: myUid,
      to: target.id,
    });

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

  const user = users[currentIndex];

  if (!user) {
    return (
      <IndoreBackground>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "white" }}>No more profiles 😅</Text>
        </View>
      </IndoreBackground>
    );
  }

  const imageUri = user.photos[photoIndex];

  return (
    <IndoreBackground>
      <View style={styles.card}>
        <TouchableOpacity style={{ flex: 1 }} onPress={nextPhoto}>
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.name}>
            {user.name}, {user.age}
          </Text>
          <Text style={styles.bio}>{user.bio}</Text>
          <Text style={{ color: "white" }}>📍 Nearby</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btn} onPress={handleDislike}>
          <Text style={{ fontSize: 30 }}>❌</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={handleLike}>
          <Text style={{ fontSize: 30 }}>❤️</Text>
        </TouchableOpacity>
      </View>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#111",
  },

  info: {
    position: "absolute",
    bottom: 0,
    padding: 20,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
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
    marginBottom: 30,
  },

  btn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
});
