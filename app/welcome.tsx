import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import IndoreBackground from "./components/IndoreBackground";

export default function Welcome() {
  const router = useRouter();

  return (
    <IndoreBackground>
      <View style={styles.center}>
        <Text style={styles.title}>IndoriDates 💕</Text>
        <Text style={styles.subtitle}>Find your vibe in Indore</Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.buttonText}>GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#eee",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#ff4d6d",
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 50,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
