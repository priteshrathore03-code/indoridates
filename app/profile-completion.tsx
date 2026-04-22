import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebaseConfig";
import { useUserProfile } from "../data/userProfile";
import FadeWrapper from "./components/FadeWrapper";
import IndoreBackground from "./components/IndoreBackground";

export default function ProfileCompletion() {
  const router = useRouter();
  const { saveProfile } = useUserProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (loading) return;

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Enter both names");
      return;
    }

    try {
      setLoading(true);

      await saveProfile({
        name: `${firstName.trim()} ${lastName.trim()}`,
      });

      router.push("/profile-more");
    } catch (error) {
      console.log("SAVE ERROR:", error);
      Alert.alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/welcome");
    } catch (error: any) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Your Name</Text>

            <TextInput
              placeholder="First Name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />

            <TextInput
              placeholder="Last Name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Next</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  title: {
    fontSize: 26,
    color: "white",
    marginBottom: 35,
    textAlign: "center",
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    color: "white",
  },

  button: {
    backgroundColor: "#ff4d6d",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  logoutButton: {
    backgroundColor: "rgba(255, 77, 109, 0.4)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ff4d6d",
  },

  logoutBtnText: {
    color: "#ff4d6d",
    fontWeight: "600",
    fontSize: 14,
  },
});
