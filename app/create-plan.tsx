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
  const [time, setTime] = useState("");
  const [brief, setBrief] = useState("");
  const [visibleTo, setVisibleTo] = useState<
  "male" | "female" | "everyone"
>("male");

  const handleCreate = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    if (!title.trim() || !time.trim() || !brief.trim()) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    try {
      await addPlan({
        title: title.trim(),
        time: time.trim(),
        brief: brief.trim(),
        createdBy: user.uid,
        createdByName: user.name || "Indori",
        requests: [],
        accepted: "",
        status: "open",
        createdAt: Date.now(),
        visibleTo,
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
        placeholder="Time (e.g. 10 PM)"
        value={time}
        onChangeText={setTime}
        style={styles.input}
      />

      <TextInput
        placeholder="Brief"
        value={brief}
        onChangeText={setBrief}
        style={styles.input}
        multiline
      />

      <Text style={styles.visibilityTitle}>
  Who can see this plan?
</Text>

<View style={styles.visibilityContainer}>
  <TouchableOpacity
    style={[
      styles.visibilityButton,
      visibleTo === "male" && styles.activeVisibility,
    ]}
    onPress={() => setVisibleTo("male")}
  >
    <Text style={styles.visibilityText}>👦 Only Boys</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.visibilityButton,
      visibleTo === "female" && styles.activeVisibility,
    ]}
    onPress={() => setVisibleTo("female")}
  >
    <Text style={styles.visibilityText}>👧 Only Girls</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.visibilityButton,
      visibleTo === "everyone" &&
        styles.activeVisibility,
    ]}
    onPress={() => setVisibleTo("everyone")}
  >
    <Text style={styles.visibilityText}>🌍 Everyone</Text>
  </TouchableOpacity>
</View>

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
  visibilityTitle: {
  fontSize: 16,
  fontWeight: "bold",
  marginBottom: 10,
},

visibilityContainer: {
  marginBottom: 20,
},

visibilityButton: {
  padding: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ccc",
  marginBottom: 10,
},

activeVisibility: {
  backgroundColor: "#ff4d6d",
  borderColor: "#ff4d6d",
},

visibilityText: {
  color: "#000",
  fontWeight: "600",
},
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
