import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function PublicProfile() {
  const { uid } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  // 🔥 NEW STATE (important)
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!uid) return;

      const snap = await getDoc(doc(db, "users", String(uid)));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };

    loadProfile();
  }, [uid]);

  if (!profile) return null;

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>User Profile</Text>

            {/* 🔥 UPDATED PHOTOS CLICKABLE */}
            {profile.photos?.length > 0 && (
              <View style={styles.photoRow}>
                {profile.photos.map((uri: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedImage(uri);
                      setShowImage(true);
                    }}
                  >
                    <Image source={{ uri }} style={styles.photo} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{profile.name}</Text>

            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>{profile.age}</Text>

            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>{profile.gender}</Text>

            <Text style={styles.label}>Bio</Text>
            <Text style={styles.value}>{profile.bio}</Text>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.btnText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* 🔥 FULL SCREEN IMAGE MODAL */}
        <Modal visible={showImage} transparent animationType="fade">
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "black",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowImage(false)}
          >
            <Image
              source={{ uri: selectedImage! }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
    borderRadius: 20,
  },
  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { color: "#aaa", marginTop: 10 },
  value: { color: "white" },
  photoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: 12,
    margin: 5,
  },
  backBtn: {
    backgroundColor: "blue",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
});
