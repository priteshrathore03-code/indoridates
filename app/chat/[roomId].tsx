import { useEffect, useState } from "react";
import {
  FlatList,
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
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "../../firebaseConfig";

export default function ChatRoom() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  const myUid = auth.currentUser?.uid;

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
        arr.push({
          id: d.id,
          ...d.data(),
        });
      });

      setMessages(arr);
    });

    return () => unsub();
  }, [roomId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    if (!myUid) return;

    await addDoc(collection(db, "messages"), {
      roomId: String(roomId),
      senderId: myUid,
      text,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/chat")}>
            <Text style={{ color: "white", fontSize: 16 }}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* MESSAGES */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.msg,
                item.senderId === myUid ? styles.myMsg : styles.otherMsg,
              ]}
            >
              <Text style={{ color: "white" }}>{item.text}</Text>
            </View>
          )}
        />

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type message..."
            placeholderTextColor="#aaa"
            style={styles.input}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={{ color: "white" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#333",
  },

  msg: {
    padding: 10,
    margin: 8,
    borderRadius: 10,
    maxWidth: "70%",
  },

  myMsg: {
    backgroundColor: "#ff4d6d",
    alignSelf: "flex-end",
  },

  otherMsg: {
    backgroundColor: "#333",
    alignSelf: "flex-start",
  },

  inputRow: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderColor: "#333",
    backgroundColor: "#000",
  },

  input: {
    flex: 1,
    backgroundColor: "#111",
    color: "white",
    padding: 12,
    borderRadius: 10,
  },

  sendBtn: {
    backgroundColor: "#ff4d6d",
    paddingHorizontal: 18,
    justifyContent: "center",
    marginLeft: 8,
    borderRadius: 10,
  },
});
