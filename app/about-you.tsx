import { useRouter } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AboutYou() {
  const router = useRouter();

  const heights = [
    "5'0\"",
    "5'1\"",
    "5'2\"",
    "5'3\"",
    "5'4\"",
    "5'5\"",
    "5'6\"",
    "5'7\"",
    "5'8\"",
    "5'9\"",
    "5'10\"",
    "5'11\"",
    "6'0\"+",
  ];

  const [height, setHeight] = useState("");
  const [bio, setBio] = useState("");

  const canProceed = height !== "" || bio.length > 0;

  return (
    <View style={styles.container}>
      {/* TITLE */}
      <Text style={styles.title}>Thoda apne baare me 😄</Text>
      <Text style={styles.subtitle}>Optional hai, skip bhi kar sakte ho</Text>

      {/* HEIGHT */}
      <Text style={styles.label}>Height</Text>
      <View style={styles.wrap}>
        {heights.map((h) => (
          <TouchableOpacity
            key={h}
            style={[styles.chip, height === h && styles.activeChip]}
            onPress={() => setHeight(h)}
          >
            <Text
              style={[styles.chipText, height === h && styles.activeChipText]}
            >
              {h}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* BIO */}
      <Text style={[styles.label, { marginTop: 20 }]}>Bio</Text>
      <TextInput
        style={styles.bio}
        placeholder="Chai ya coffee? ☕🍵"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      {/* ACTIONS */}
      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => router.push("/profile-photos")}
      >
        <Text style={styles.nextText}>{canProceed ? "Next →" : "Skip →"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: "#ff5a7e",
    borderColor: "#ff5a7e",
  },
  chipText: {
    fontWeight: "600",
    color: "#000",
  },
  activeChipText: {
    color: "#fff",
  },
  bio: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    height: 90,
    textAlignVertical: "top",
  },
  nextBtn: {
    marginTop: 30,
    backgroundColor: "#ff5a7e",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
