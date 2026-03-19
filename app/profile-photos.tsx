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

import { Video } from "expo-av";

import { useUserProfile } from "../data/userProfile";
import FadeWrapper from "./components/FadeWrapper";
import IndoreBackground from "./components/IndoreBackground";

import { auth } from "../firebaseConfig";

export default function ProfilePhotos() {
  const router = useRouter();
  const { user, saveProfile } = useUserProfile();

  if (!user) return null;

  const [photos, setPhotos] = useState<string[]>(
    user.photos && user.photos.length > 0
      ? [...user.photos]
      : ["", "", "", "", ""],
  );

  const [video, setVideo] = useState<string | null>(user.video || null);
  const [loading, setLoading] = useState(false);

  // ---------------- PICK IMAGE ----------------
  const pickImage = async (index: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotos((prev) => {
        const updated = [...prev];
        updated[index] = result.assets[0].uri;
        return updated;
      });
    }
  };

  // ---------------- PICK VIDEO ----------------
  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 30,
      quality: 0.7,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  // ---------------- UPLOAD ----------------
  const uploadToFirebase = async (
    uri: string,
    path: string,
    contentType: string,
  ) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("Not authenticated");

    const idToken = await firebaseUser.getIdToken();

    const response = await fetch(uri);
    const blob = await response.blob();

    const uploadUrl =
      `https://firebasestorage.googleapis.com/v0/b/indoridates.firebasestorage.app/o` +
      `?name=${path}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${idToken}`,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      const data = await uploadResponse.json();
      throw new Error(JSON.stringify(data));
    }

    return `https://firebasestorage.googleapis.com/v0/b/indoridates.firebasestorage.app/o/${encodeURIComponent(
      path,
    )}?alt=media`;
  };

  // ---------------- SAVE (FIXED LOGIC) ----------------
  const handleNext = async () => {
    // 1. Check valid photos (local ya web dono)
    const validPhotosCount = photos.filter((p) => p && p.trim() !== "").length;

    if (validPhotosCount < 3) {
      Alert.alert("Error", "Kam se kam 3 photos upload karein");
      return;
    }

    try {
      setLoading(true);

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      const finalPhotoURLs: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const currentUri = photos[i];
        if (!currentUri || currentUri.trim() === "") continue;

        // Agar photo pehle se firebase par hai, upload skip karo
        if (currentUri.startsWith("http")) {
          finalPhotoURLs.push(currentUri);
        } else {
          // Nayi photo upload karo
          const fileName = `users/${firebaseUser.uid}/photo_${i}_${Date.now()}.jpg`;
          const url = await uploadToFirebase(
            currentUri,
            fileName,
            "image/jpeg",
          );
          finalPhotoURLs.push(url);
        }
      }

      let finalVideoURL = video;
      if (video && !video.startsWith("http")) {
        const fileName = `users/${firebaseUser.uid}/video_${Date.now()}.mp4`;
        finalVideoURL = await uploadToFirebase(video, fileName, "video/mp4");
      }

      await saveProfile({
        photos: finalPhotoURLs,
        video: finalVideoURL,
      });

      // Thoda wait taaki Firestore update reflect ho sake
      setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 1000);
    } catch (error: any) {
      console.log("UPLOAD ERROR:", error);
      Alert.alert("Upload failed", "Kuch galti hui hai, dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.glass}>
            <Text style={styles.title}>Add Photos (Min 3)</Text>

            <View style={styles.grid}>
              {[0, 1, 2, 3, 4].map((i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.photoBox}
                  onPress={() => pickImage(i)}
                >
                  {photos[i] ? (
                    <Image source={{ uri: photos[i] }} style={styles.image} />
                  ) : (
                    <Text style={styles.plus}>+</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.title, { marginTop: 20 }]}>
              Add Intro Video (Optional)
            </Text>

            <TouchableOpacity style={styles.videoBox} onPress={pickVideo}>
              {video ? (
                <Video
                  source={{ uri: video }}
                  style={styles.video}
                  isMuted
                  shouldPlay={false}
                />
              ) : (
                <Text style={styles.plus}>+</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextBtn, loading && { opacity: 0.7 }]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.nextText}>Finish</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  glass: {
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 20,
    borderRadius: 20,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoBox: {
    width: "30%",
    height: 100,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  videoBox: {
    width: "100%",
    height: 150,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  plus: {
    fontSize: 24,
    color: "white",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  nextBtn: {
    backgroundColor: "#ff4d6d",
    padding: 14,
    borderRadius: 14,
    marginTop: 20,
    alignItems: "center",
  },
  nextText: {
    color: "white",
    fontWeight: "bold",
  },
});
