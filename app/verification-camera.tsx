import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VerificationCamera() {
  const router = useRouter();

  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();

  const [facing] = useState<CameraType>("front");
  const captureSelfie = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
      });

      console.log("SELFIE :", photo.uri);

      router.push({
        pathname: "/verification-preview",
        params: {
          image: photo.uri,
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission required</Text>

        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permissionBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />
      <View style={styles.darkOverlay} />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={styles.circle} />

        <Text style={styles.title}>Place your face inside the circle</Text>

        <TouchableOpacity style={styles.capture} onPress={captureSelfie} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },

  back: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },

  circle: {
    width: 350,
    height: 480,
    borderRadius: 240,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 25,
    marginHorizontal: 30,
  },
  capture: {
    position: "absolute",
    bottom: 55,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "#d9d9d9",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
  },

  permissionText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
  },

  permissionBtn: {
    backgroundColor: "#ff4d6d",
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
  },

  permissionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.20)",
  },
});
