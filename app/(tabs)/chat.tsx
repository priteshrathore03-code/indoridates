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
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { auth, db } from "../../firebaseConfig";

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
      const uniqueUsers = new Set();

      for (const d of snap.docs) {
        const data = d.data();
        if (uniqueUsers.has(data.from)) {
          continue;
        }

        uniqueUsers.add(data.from);

        const roomQuery = query(
          collection(db, "chatRooms"),
          where("users", "array-contains", myUid),
        );

        const roomSnap = await getDocs(roomQuery);

        const alreadyMatched = roomSnap.docs.some((room) => {
          const users = room.data().users || [];
          return users.includes(data.from);
        });

        if (alreadyMatched) {
          continue;
        }

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

          // Get last message from the room
          const lastMsg = data.lastMessage;

          arr.push({
            id: d.id,
            name: u.name,
            photo: u.photos?.[0] || "",
            message: lastMsg?.text || "Start chatting",
            time: lastMsg?.createdAt
              ? new Date(lastMsg.createdAt.toDate()).toLocaleString()
              : "",
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

  const handleDeleteLike = async (likeDocId: string) => {
    try {
      await deleteDoc(doc(db, "likes", likeDocId));
    } catch (e) {
      console.log("Delete Like Error:", e);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView style={styles.container}>
          {/* Likes Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>💖 Likes You</Text>

            {likes.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {likes.map((u, index) => (
            <LinearGradient
              key={u.id + "_" + index}
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
              style={styles.card}
            >
              <TouchableOpacity
                onPress={() => router.push(`/home?focusUser=${u.id}`)}
              >
                <Image source={{ uri: u.photo }} style={styles.photo} />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{u.name}</Text>

                <Text style={styles.sub}>{u.bio || "No bio yet"}</Text>

                <TouchableOpacity
                  style={styles.profileBtn}
                  onPress={() => router.push(`/home?focusUser=${u.id}`)}
                >
                  <Text style={styles.profileText}>View Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteLike(u.likeDocId)}
                >
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>

              <Feather name="heart" size={20} color="#ff2d95" />
            </LinearGradient>
          ))}

          {/* Matches Section */}
          <Text style={[styles.title, { marginTop: 25 }]}>💬 Matches</Text>

          {chats.map((c) => (
            <LinearGradient
              key={c.id}
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
              style={styles.card}
            >
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push("/chat/" + c.id)}
              >
                <Image source={{ uri: c.photo }} style={styles.photo} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.name}</Text>

                  <Text style={styles.message}>{c.message}</Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.time}>{c.time}</Text>
                  <Feather name="heart" size={18} color="#ff2d95" />
                </View>
              </TouchableOpacity>
            </LinearGradient>
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

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },

  seeAll: {
    color: "#ddd",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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

  message: {
    color: "#ccc",
    marginTop: 3,
  },

  time: {
    color: "#bbb",
    fontSize: 12,
    marginBottom: 5,
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
  deleteBtn: {
    marginTop: 6,
    backgroundColor: "#ff4d6d",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  deleteText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
