import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserProfile } from "../data/userProfile";
import FadeWrapper from "./components/FadeWrapper";
import IndoreBackground from "./components/IndoreBackground";

export default function Intent() {
  const router = useRouter();
  const { user, saveProfile } = useUserProfile();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleNext = async () => {
    if (!selected) return;

    try {
      setLoading(true);

      await saveProfile({
        ...user,
        bio: selected,
      });

      router.push("/profile-photos");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <View style={styles.container}>
          <View style={styles.glass}>
            <Text style={styles.title}>Why are you here?</Text>

            <TouchableOpacity
              style={[
                styles.option,
                selected === "relationship" && styles.selected,
              ]}
              onPress={() => setSelected("relationship")}
            >
              <Text style={styles.optionText}>
                💍 Looking for a Serious Relationship
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, selected === "friends" && styles.selected]}
              onPress={() => setSelected("friends")}
            >
              <Text style={styles.optionText}>
                🤝 Make New Friends & Connections
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.option, selected === "explore" && styles.selected]}
              onPress={() => setSelected("explore")}
            >
              <Text style={styles.optionText}>✨ Just Exploring</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextBtn}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.nextText}>Next</Text>
              )}
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
    borderRadius: 22,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  option: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
  },
  selected: {
    backgroundColor: "#ff4d6d",
  },
  optionText: {
    color: "white",
    fontWeight: "600",
  },
  nextBtn: {
    backgroundColor: "#ff4d6d",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  nextText: {
    color: "white",
    fontWeight: "bold",
  },
});
