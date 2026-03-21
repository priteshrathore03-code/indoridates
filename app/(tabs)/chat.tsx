import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../../firebaseConfig";

// 🔥 ADD THESE
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function ChatTab() {
  const router = useRouter();

  const [likes, setLikes] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;

    const qLikes = query(collection(db, "likes"), where("to", "==", myUid));

    const unsubLikes = onSnapshot(qLikes, async (snap) => {
      const arr: any[] = [];

      for (const d of snap.docs) {
        const data = d.data();

        const userDoc = await getDoc(doc(db, "users", data.from));

        if (userDoc.exists()) {
          const u = userDoc.data();

          arr.push({
            id: data.from,
            name: u.name,
            photo: u.photos?.[0] || "",
          });
        }
      }

      setLikes(arr);
    });

    const qChats = query(
      collection(db, "chatRooms"),
      where("users", "array-contains", myUid),
    );

    const unsubChats = onSnapshot(qChats, async (snap) => {
      const arr: any[] = [];

      for (const d of snap.docs) {
        const data = d.data();

        const otherUser = data.users.find((p: string) => p !== myUid);

        const userDoc = await getDoc(doc(db, "users", otherUser));

        if (userDoc.exists()) {
          const u = userDoc.data();

          arr.push({
            id: d.id,
            name: u.name,
            photo: u.photos?.[0] || "",
          });
        }
      }

      setChats(arr);
    });

    return () => {
      unsubLikes();
      unsubChats();
    };
  }, []);

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView style={styles.container}>
          {/* 💖 Likes */}
          <Text style={styles.title}>💖 Likes You</Text>

          {likes.map((u, index) => (
            <View key={u.id + "_" + index} style={styles.card}>
              <Image source={{ uri: u.photo }} style={styles.photo} />

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.name}</Text>

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/home",
                      params: { viewUser: u.id },
                    })
                  }
                >
                  <Text style={styles.view}>View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* 💬 Matches */}
          <Text style={[styles.title, { marginTop: 30 }]}>💬 Matches</Text>

          {chats.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              onPress={() => router.push("/chat/" + c.id)}
            >
              <Image source={{ uri: c.photo }} style={styles.photo} />

              <Text style={styles.name}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  title: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },

  photo: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginRight: 12,
  },

  name: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  view: {
    color: "#4da6ff",
    marginTop: 4,
  },
});
