import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserProfile } from "../data/userProfile";
export default function Verification() {
  const router = useRouter();
  const { user } = useUserProfile();

  const isVerified = user?.verification?.status === "verified";
  const requestCameraPermission = async () => {
    console.log("VERIFY CLICKED");

    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera permission.");
      return;
    }

    router.push("/verification-camera");
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Ionicons name="shield-checkmark" size={70} color="#00E676" />

        <Text style={styles.title}>
          {isVerified ? "Verified Profile" : "Get Verified"}
        </Text>

        <Text style={styles.subtitle}>
          {isVerified
            ? "Your profile has been successfully verified."
            : "Verify your profile and earn the Verified Badge."}
        </Text>

        <View style={styles.points}>
          <Text style={styles.point}>✅ More trusted by users</Text>

          <Text style={styles.point}>✅ Higher visibility</Text>

          <Text style={styles.point}>✅ Verified Badge</Text>

          <Text style={styles.point}>✅ Safer community</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            isVerified && {
              backgroundColor: "#00C853",
            },
          ]}
          onPress={requestCameraPermission}
        >
          <Text style={styles.verifyText}>
            {isVerified ? "Verified ✓" : "Verify Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  backBtn: {
    position: "absolute",
    top: 55,
    left: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 20,
  },

  subtitle: {
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
    fontSize: 15,
  },

  points: {
    width: "100%",
    marginTop: 30,
    gap: 15,
  },

  point: {
    color: "#fff",
    fontSize: 16,
  },

  verifyBtn: {
    width: "100%",
    marginTop: 35,
    backgroundColor: "#ff4d6d",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  verifyText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
