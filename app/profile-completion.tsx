import { useRouter } from "expo-router";
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
import { useUserProfile } from "../data/userProfile";
import FadeWrapper from "./components/FadeWrapper";
import IndoreBackground from "./components/IndoreBackground";

export default function ProfileCompletion() {
  const router = useRouter();
  const { user, saveProfile } = useUserProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <IndoreBackground>
        <FadeWrapper>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#ff4d6d" />
          </View>
        </FadeWrapper>
      </IndoreBackground>
    );
  }

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

  return (
    <IndoreBackground>
      <FadeWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>Your Name</Text>

          <TextInput
            placeholder="First Name"
            placeholderTextColor="#666"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />

          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#666"
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
  title: {
    fontSize: 24,
    color: "white",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#ff4d6d",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
