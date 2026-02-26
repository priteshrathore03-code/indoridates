import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { addPlan } from "../data/planStore";
import { useUserProfile } from "../data/userProfile";

export default function CreatePlan() {
  const router = useRouter();
  const { user } = useUserProfile();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    try {
      await addPlan({
        title: title.trim(),
        description: description.trim(),
        createdBy: user.uid, // ✅ now guaranteed string
        createdByName: user.name || "Indori",
        createdAt: Date.now(),
      });

      Alert.alert("Success", "Plan Created 🚀");
      router.back();
    } catch (error) {
      console.log("CREATE PLAN ERROR:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Plan</Text>

      <TextInput
        placeholder="Plan Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Plan Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#ff4d6d",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
