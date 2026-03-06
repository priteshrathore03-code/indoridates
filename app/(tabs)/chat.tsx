import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";
import { useChatRooms } from "../../hooks/useChatRooms";
import IndoreBackground from "../components/IndoreBackground";

type UserMap = {
  [key: string]: {
    name?: string;
  };
};

export default function ChatListScreen() {
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid ?? "";

  const { rooms } = useChatRooms(currentUserId);
  const [usersMap, setUsersMap] = useState<UserMap>({});

  useEffect(() => {
    const fetchUsers = async () => {
      const map: UserMap = {};

      for (const room of rooms) {
        const otherUserId = room.users.find(
          (id: string) => id !== currentUserId,
        );

        if (otherUserId && !map[otherUserId]) {
          const snap = await getDoc(doc(db, "users", otherUserId));
          if (snap.exists()) {
            map[otherUserId] = snap.data() as { name?: string };
          }
        }
      }

      setUsersMap(map);
    };

    if (rooms.length > 0) {
      fetchUsers();
    }
  }, [rooms, currentUserId]);

  return (
    <IndoreBackground>
      <View style={styles.container}>
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const otherUserId = item.users.find(
              (id: string) => id !== currentUserId,
            );

            const otherUser =
              otherUserId && usersMap[otherUserId]
                ? usersMap[otherUserId]
                : null;

            return (
              <TouchableOpacity
                style={styles.room}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <Text style={styles.name}>{otherUser?.name ?? "User"}</Text>

                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage?.text ?? "Start chatting..."}
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
