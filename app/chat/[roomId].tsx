import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../firebaseConfig";
import { useMessages } from "../../hooks/useMessages";
import { markMessagesAsSeen, sendMessage } from "../../services/chatService";

export default function PersonalChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const currentUserId = auth.currentUser?.uid || "";
  const insets = useSafeAreaInsets();

  const { messages } = useMessages(roomId || "");
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Mark messages as seen
  useEffect(() => {
    if (roomId && currentUserId) {
      markMessagesAsSeen(roomId, currentUserId);
    }
  }, [roomId, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!roomId) return;

    await sendMessage(roomId, currentUserId, input.trim());
    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isMine = item.senderId === currentUserId;

            return (
              <View
                style={[
                  styles.message,
                  isMine ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text style={{ color: isMine ? "white" : "black" }}>
                  {item.text}
                </Text>

                {isMine && item.seenBy?.length > 1 && (
                  <Text style={styles.seen}>✓✓</Text>
                )}
              </View>
            );
          }}
        />

        <View
          style={[
            styles.inputRow,
            {
              paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
            },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            style={styles.input}
          />

          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Text style={{ color: "white", fontWeight: "600" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  message: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: "75%",
  },

  myMessage: {
    backgroundColor: "#4f46e5",
    alignSelf: "flex-end",
  },

  otherMessage: {
    backgroundColor: "#eee",
    alignSelf: "flex-start",
  },

  seen: {
    fontSize: 10,
    marginTop: 4,
    color: "#ccc",
    alignSelf: "flex-end",
  },

  inputRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#222",
    backgroundColor: "#111",
  },

  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "white",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#4f46e5",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 20,
  },
});
