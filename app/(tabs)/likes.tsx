import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../firebaseConfig";

import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function LikesTab() {
  const router = useRouter();

  const [likes, setLikes] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  useEffect(() => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;

    const qLikes = query(collection(db, "likes"), where("to", "==", myUid));

    const unsubLikes = onSnapshot(qLikes, async (snap) => {
      const arr: any[] = [];
      const uniqueUsers = new Set();

      for (const d of snap.docs) {
        const data = d.data();

        if (uniqueUsers.has(data.from)) continue;
        uniqueUsers.add(data.from);

        const userDoc = await getDoc(doc(db, "users", data.from));

        if (userDoc.exists()) {
          const u = userDoc.data();

          arr.push({
            id: data.from,
            likeDocId: d.id,
            name: u.name,
            age: u.age,
            bio: u.bio,
            photo: u.photos?.[0] || "",
          });
        }
      }

      setLikes(arr);
    });

    return () => unsubLikes();
  }, []);
  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>💖 Likes You</Text>
          {likes.map((u, index) => (
            <LinearGradient
              key={u.id + "_" + index}
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
              style={styles.card}
            >
              <Image source={{ uri: u.photo }} style={styles.photo} />

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.name}</Text>

                <Text style={styles.sub}>{u.bio || "No bio yet"}</Text>

                <TouchableOpacity
                  style={styles.profileBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/home",
                      params: {
                        focusUser: u.id,
                      },
                    })
                  }
                >
                  <Text style={styles.profileText}>View Profile</Text>
                </TouchableOpacity>
              </View>

              <Feather name="heart" size={20} color="#ff2d95" />
            </LinearGradient>
          ))}
        </ScrollView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
  },

  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  sub: {
    color: "#ddd",
    fontSize: 13,
    marginTop: 2,
  },

  profileBtn: {
    marginTop: 6,
    backgroundColor: "#3b82f6",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  profileText: {
    color: "white",
    fontSize: 12,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 55,
  },

  title: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
});
