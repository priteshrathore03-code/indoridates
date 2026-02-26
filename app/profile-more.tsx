import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserProfile } from "../data/userProfile";
import FadeWrapper from "./components/FadeWrapper";
import IndoreBackground from "./components/IndoreBackground";

export default function ProfileMore() {
  const router = useRouter();
  const { user, saveProfile } = useUserProfile();

  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | null>(null);

  if (!user) return null;

  const handleNext = async () => {
    if (!age || !gender) return;

    await saveProfile({
      ...user,
      age: Number(age),
      gender,
    });

    router.push("/intent"); // WHY ARE YOU HERE PAGE
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <View style={styles.container}>
          <View style={styles.glass}>
            <TextInput
              placeholder="Age"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
              style={styles.input}
            />

            <TouchableOpacity
              style={[styles.genderBtn, gender === "male" && styles.selected]}
              onPress={() => setGender("male")}
            >
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.genderBtn, gender === "female" && styles.selected]}
              onPress={() => setGender("female")}
            >
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextText}>Next</Text>
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
    padding: 20,
  },
  glass: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 25,
    borderRadius: 20,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 14,
    borderRadius: 14,
    color: "white",
    marginBottom: 15,
  },
  genderBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#ff4d6d",
  },
  genderText: {
    color: "white",
    fontWeight: "bold",
  },
  nextBtn: {
    backgroundColor: "#ff4d6d",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  nextText: {
    color: "white",
    fontWeight: "bold",
  },
});
