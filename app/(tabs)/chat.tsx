import { StyleSheet, Text, View } from "react-native";
import IndoreBackground from "../components/IndoreBackground";

export default function Chat() {
  return (
    <IndoreBackground>
      <View style={styles.container}>
        <Text style={styles.title}>💬 Chat</Text>
        <Text style={styles.subtitle}>Start your vibe</Text>
      </View>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
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
