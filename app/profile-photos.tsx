import { ResizeMode, Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { checkImageSafety } from "../data/imageSafety";
import { useUserProfile } from "../data/userProfile";
import { auth } from "../firebaseConfig";
import FadeWrapper from "./components/FadeWrapper";
import IndoreBackground from "./components/IndoreBackground";

// ✅ NEW IMPORT (important)
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

export default function ProfilePhotos() {
  const router = useRouter();
  const { user, saveProfile } = useUserProfile();

  const [photos, setPhotos] = useState<string[]>(
    user?.photos && user.photos.length > 0
      ? [...user.photos]
      : ["", "", "", "", ""],
  );
  const [video, setVideo] = useState<string | null>(user?.video || null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const pickImage = async (index: number) => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.6,
    });

    if (!result.canceled) {
      const updated = [...photos];
      updated[index] = result.assets[0].uri;
      setPhotos(updated);
    }
  };

  const pickVideo = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 30,
      quality: 0.7,
    });

    if (!result.canceled) setVideo(result.assets[0].uri);
  };

  const storage = getStorage();

  const uploadToFirebase = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  const handleNext = async () => {
    const validPhotos = photos.filter((p) => p && p.trim() !== "");
    if (validPhotos.length < 3) {
      Alert.alert("Error", "Kam se kam 3 photos upload karein");
      return;
    }

    try {
      setLoading(true);
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      const finalPhotoURLs: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const uri = photos[i];
        if (!uri) continue;

        if (uri.startsWith("http")) {
          finalPhotoURLs.push(uri);
          continue;
        }

        const fileName = `users/${firebaseUser.uid}/photo_${i}_${Date.now()}.jpg`;

        // ✅ FIXED CALL
        const url = await uploadToFirebase(uri, fileName);

        const check = await checkImageSafety(url);

        if (!check?.ok) {
          Alert.alert("Photo Reject ❌", "Invalid photo. Dubara try karo.");
          setLoading(false);
          return;
        }

        finalPhotoURLs.push(url);
      }

      let finalVideoURL = video;
      if (video && !video.startsWith("http")) {
        const videoPath = `users/${firebaseUser.uid}/video_${Date.now()}.mp4`;

        // ✅ FIXED CALL
        finalVideoURL = await uploadToFirebase(video, videoPath);
      }

      await saveProfile({
        photos: finalPhotoURLs,
        video: finalVideoURL,
        isProfileComplete: true,
      });

      await new Promise((res) => setTimeout(res, 1500));

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Kuch galti hui, dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.glassCard}>
            <Text style={styles.header}>Add Photos (Min 3)</Text>

            <View style={styles.grid}>
              {photos.map((uri, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.photoBox}
                  onPress={() => pickImage(i)}
                >
                  {uri ? (
                    <Image
                      source={{ uri }}
                      style={styles.fullImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <Text style={styles.plus}>+</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subHeader}>Intro Video (Optional)</Text>

            <TouchableOpacity style={styles.videoBox} onPress={pickVideo}>
              {video ? (
                <Video
                  source={{ uri: video }}
                  style={styles.fullImg}
                  isMuted
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={false}
                />
              ) : (
                <Text style={styles.plus}>🎥</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.finishBtn}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btnText}>Finish Setup</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  glassCard: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 30,
    padding: 20,
  },
  header: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subHeader: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoBox: {
    width: "31%",
    height: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 15,
    marginBottom: 12,
    overflow: "hidden",
  },
  videoBox: {
    width: "100%",
    height: 140,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  fullImg: { width: "100%", height: "100%" },
  plus: { color: "white", fontSize: 24 },
  finishBtn: {
    backgroundColor: "#ff4d6d",
    padding: 16,
    borderRadius: 20,
    marginTop: 30,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
});
