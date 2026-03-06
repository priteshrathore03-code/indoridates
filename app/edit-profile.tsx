import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";

import { useUserProfile } from "../data/userProfile";
import FadeWrapper from "./components/FadeWrapper";
import IndoreBackground from "./components/IndoreBackground";

export default function EditProfile() {
  const router = useRouter();
  const { user, saveProfile } = useUserProfile();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAge(user.age ? user.age.toString() : "");
      setBio(user.bio || "");
      setPhotos(user.photos || []);
    }
  }, [user]);

  if (!user) return null;

  const pickImage = async () => {
    if (photos.length >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 photos allowed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      const uri = result.assets[0].uri;

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `users/${user.uid}/${Date.now()}.jpg`);

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);

      setPhotos((prev) => [...prev, downloadURL]);
    } catch (error) {
      console.log("UPLOAD ERROR:", error);
      Alert.alert("Upload failed");
    }
  };

  const removePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    setPhotos(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    if (photos.length < 3) {
      Alert.alert(
        "Minimum 3 Photos Required",
        "Please upload at least 3 photos",
      );
      return;
    }

    const updatedProfile = {
      ...user,
      name: name.trim(),
      age: age ? parseInt(age) : undefined,
      bio: bio.trim(),
      photos,
    };

    await saveProfile(updatedProfile);
    router.back();
  };

  return (
    <IndoreBackground>
      {" "}
      <FadeWrapper>
        {" "}
        <ScrollView contentContainerStyle={styles.container}>
          {" "}
          <View style={styles.card}>
            {" "}
            <Text style={styles.title}>Edit Profile</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Age"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              value={age}
              onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
              style={styles.input}
            />
            <TextInput
              placeholder="Bio"
              placeholderTextColor="#ccc"
              value={bio}
              onChangeText={setBio}
              style={[styles.input, { height: 80 }]}
              multiline
            />
            <View style={styles.photoRow}>
              {photos.map((uri, i) => (
                <View key={i}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity onPress={() => removePhoto(i)}>
                    <Text style={{ color: "red" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={pickImage}>
              <Text style={styles.btnText}>Add Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Save</Text>
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

  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    color: "white",
  },

  photoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },

  photo: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },

  btn: {
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  saveBtn: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
