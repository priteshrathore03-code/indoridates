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

import { useUserProfile } from "../data/userProfile";
import FadeWrapper from "./components/FadeWrapper";
import IndoreBackground from "./components/IndoreBackground";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function ProfilePhotos() {
  const router = useRouter();
  const { user, saveProfile } = useUserProfile();

  const [photos, setPhotos] = useState<string[]>(user?.photos || []);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const pickImage = async (index: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled) {
      const updated = [...photos];
      updated[index] = result.assets[0].uri;
      setPhotos(updated);
    }
  };

  const uploadToFirebase = async (uri: string, uid: string, index: number) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error("Not authenticated");

    const idToken = await firebaseUser.getIdToken();

    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName = `photo_${index}_${Date.now()}.jpg`;

    const uploadUrl =
      `https://firebasestorage.googleapis.com/v0/b/indoridates.firebasestorage.app/o` +
      `?name=users/${uid}/${fileName}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
        Authorization: `Bearer ${idToken}`,
      },
      body: blob,
    });

    const data = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(JSON.stringify(data));
    }

    return `https://firebasestorage.googleapis.com/v0/b/indoridates.firebasestorage.app/o/users%2F${uid}%2F${fileName}?alt=media`;
  };

  const handleNext = async () => {
    const validPhotos = photos.filter(Boolean);

    if (validPhotos.length < 3) {
      Alert.alert("Upload at least 3 photos");
      return;
    }

    try {
      setLoading(true);

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        Alert.alert("Authentication error");
        return;
      }

      const uploadedPhotoURLs: string[] = [];

      for (let i = 0; i < validPhotos.length; i++) {
        const url = await uploadToFirebase(validPhotos[i], firebaseUser.uid, i);
        uploadedPhotoURLs.push(url);
      }

      const updatedUser = {
        ...user,
        photos: uploadedPhotoURLs,
      };

      await saveProfile(updatedUser);

      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          ...updatedUser,
          email: firebaseUser.email,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log("UPLOAD ERROR:", error);
      Alert.alert("Upload failed", error.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.glass}>
            <Text style={styles.title}>Add Photos</Text>

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
    fontSize: 20,
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
  plus: {
    fontSize: 24,
    color: "white",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  nextBtn: {
    backgroundColor: "#ff4d6d",
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
  },
  nextText: {
    color: "white",
    fontWeight: "bold",
  },
});
