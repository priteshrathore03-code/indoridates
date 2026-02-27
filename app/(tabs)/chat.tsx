import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import IndoreBackground from "../components/IndoreBackground";

export default function Chat() {
  const { roomId } = useLocalSearchParams();

  return (
    <IndoreBackground>
      <View style={styles.container}>
        <Text style={styles.title}>💬 Chat</Text>

        {roomId ? (
          <Text style={styles.subtitle}>Room ID: {roomId}</Text>
        ) : (
          <Text style={styles.subtitle}>No Room Selected</Text>
        )}
      </View>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#ddd",
  },
});
