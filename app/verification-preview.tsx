import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useUserProfile } from "../data/userProfile";

export default function VerificationPreview() {
  const router = useRouter();
  const { saveProfile } = useUserProfile();
  const { image } = useLocalSearchParams();
  const handleVerify = async () => {
    try {
      await saveProfile({
        verification: {
          status: "verified",
          verifiedAt: Date.now(),
        },
      });

      router.replace("/(tabs)/profile");
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: image as string }}
        style={styles.image}
        contentFit="cover"
      />

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.text}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.retake}>Retake</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  image: {
    width: 320,
    height: 500,
    borderRadius: 25,
  },

  button: {
    marginTop: 30,
    backgroundColor: "#ff4d6d",
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 20,
  },

  text: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  retake: {
    marginTop: 20,
    color: "#fff",
    fontSize: 16,
  },
});
