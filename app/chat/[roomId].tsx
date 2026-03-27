import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function ChatRoom() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [blocked, setBlocked] = useState(false);

  const myUid = auth.currentUser?.uid;

  // 🔥 LOAD USER
  useEffect(() => {
    const loadUser = async () => {
      if (!roomId || !myUid) return;

      const roomSnap = await getDoc(doc(db, "chatRooms", String(roomId)));
      if (!roomSnap.exists()) return;

      const data = roomSnap.data();
      const otherUid = data.users.find((u: string) => u !== myUid);

      const userSnap = await getDoc(doc(db, "users", otherUid));
      if (userSnap.exists()) {
        setOtherUser({ ...userSnap.data(), uid: otherUid });
      }
    };

    loadUser();
  }, [roomId]);

  // 🔥 CHECK BLOCK (REAL GLOBAL)
  useEffect(() => {
    const checkBlock = async () => {
      if (!myUid || !otherUser) return;

      const q1 = query(
        collection(db, "blocks"),
        where("blockedBy", "==", myUid),
        where("blockedUser", "==", otherUser.uid),
      );

      const q2 = query(
        collection(db, "blocks"),
        where("blockedBy", "==", otherUser.uid),
        where("blockedUser", "==", myUid),
      );

      const snap1 = await getDocs(q1);
      const snap2 = await getDocs(q2);

      if (!snap1.empty || !snap2.empty) {
        setBlocked(true);
      } else {
        setBlocked(false);
      }
    };

    checkBlock();
  }, [otherUser]);

  // 🔥 MESSAGES
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "messages"),
      where("roomId", "==", String(roomId)),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((d) => {
        arr.push({ id: d.id, ...d.data() });
      });
      setMessages(arr);
    });

    return () => unsub();
  }, [roomId]);

  const sendMessage = async () => {
    if (!text.trim() || blocked) return;

    await addDoc(collection(db, "messages"), {
      roomId: String(roomId),
      senderId: myUid,
      text,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  // 🔥 OPTIONS (BLOCK / UNBLOCK / REPORT)
  const handleOptions = async () => {
    if (!myUid || !otherUser) return;

    const q = query(
      collection(db, "blocks"),
      where("blockedBy", "==", myUid),
      where("blockedUser", "==", otherUser.uid),
    );

    const snap = await getDocs(q);
    const alreadyBlocked = !snap.empty;

    if (alreadyBlocked) {
      Alert.alert("Options", "Choose action", [
        {
          text: "Unblock",
          onPress: async () => {
            snap.forEach(async (d) => {
              await deleteDoc(doc(db, "blocks", d.id));
            });

            setBlocked(false);
            Alert.alert("Unblocked ✅");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      Alert.alert("Options", "Choose action", [
        { text: "Cancel", style: "cancel" },

        {
          text: "Report",
          onPress: async () => {
            await addDoc(collection(db, "reports"), {
              roomId: String(roomId),
              reportedBy: myUid,
              createdAt: Date.now(),
            });

            Alert.alert("Reported 🚨");
          },
        },

        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            await addDoc(collection(db, "blocks"), {
              blockedBy: myUid,
              blockedUser: otherUser.uid,
              createdAt: Date.now(),
            });

            setBlocked(true);
            Alert.alert("User Blocked 🚫");
          },
        },
      ]);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={30}
          >
            {/* 🔥 HEADER */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.replace("/(tabs)/chat")}>
                <Text style={{ color: "white", fontSize: 18 }}>←</Text>
              </TouchableOpacity>

              {otherUser && (
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                  onPress={() => router.push(`/user/${otherUser.uid}`)}
                >
                  <Image
                    source={{ uri: otherUser.photos?.[0] }}
                    style={styles.avatar}
                  />
                  <Text style={styles.headerName}>{otherUser.name}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{ marginLeft: "auto" }}
                onPress={handleOptions}
              >
                <Text style={{ color: "white", fontSize: 22 }}>⋮</Text>
              </TouchableOpacity>
            </View>

            {/* 🔥 BLOCKED TEXT */}
            {blocked && (
              <Text style={styles.blockedText}>
                You cannot chat with this user 🚫
              </Text>
            )}

            {/* 🔥 MESSAGES */}
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
              renderItem={({ item }) => {
                const isMe = item.senderId === myUid;

                return (
                  <View
                    style={[styles.msg, isMe ? styles.myMsg : styles.otherMsg]}
                  >
                    <Text style={{ color: "white" }}>{item.text}</Text>
                  </View>
                );
              }}
            />

            {/* 🔥 INPUT */}
            <View style={styles.inputRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={blocked ? "User blocked" : "Type message..."}
                placeholderTextColor="#aaa"
                style={styles.input}
                editable={!blocked}
              />

              <TouchableOpacity
                style={styles.sendBtn}
                onPress={sendMessage}
                disabled={blocked}
              >
                <Text style={{ color: "white" }}>Send</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginLeft: 10,
  },
  headerName: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },

  msg: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: "70%",
  },
  myMsg: {
    backgroundColor: "#6a0dad",
    alignSelf: "flex-end",
  },
  otherMsg: {
    backgroundColor: "#444",
    alignSelf: "flex-start",
  },

  blockedText: {
    color: "red",
    textAlign: "center",
    margin: 10,
  },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  input: {
    flex: 1,
    backgroundColor: "#333",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "purple",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 10,
  },
});
