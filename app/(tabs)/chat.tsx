import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";
import { useChatRooms } from "../../hooks/useChatRooms";
import IndoreBackground from "../components/IndoreBackground";

export default function ChatListScreen() {
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid || "";

  const { rooms } = useChatRooms(currentUserId);

  return (
    <IndoreBackground>
      <View style={styles.container}>
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const otherUserId = item.users.find(
              (id: string) => id !== currentUserId,
            );

            return (
              <TouchableOpacity
                style={styles.room}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <Text style={styles.name}>{otherUserId}</Text>

                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage?.text || "Start chatting..."}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  room: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  lastMessage: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 4,
  },
});
