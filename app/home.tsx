import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function Home() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>WELCOME TO HOME 🎉</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#ff4d6d",
    padding: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
