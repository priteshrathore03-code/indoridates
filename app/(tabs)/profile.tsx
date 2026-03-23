import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserProfile } from "../../data/userProfile";
import { db } from "../../firebaseConfig";
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function Profile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, logout } = useUserProfile();

  const [viewUser, setViewUser] = useState<any>(null);

  const isOtherProfile = params.uid && user && params.uid !== user.uid;

  useEffect(() => {
    const loadProfile = async () => {
      if (isOtherProfile && params.uid) {
        const snap = await getDoc(doc(db, "users", String(params.uid)));
        if (snap.exists()) {
          setViewUser(snap.data());
        }
      } else {
        setViewUser(user);
      }
    };

    loadProfile();
  }, [params.uid, user]);

  if (!viewUser) return null;

  const handleLogout = async () => {
    await logout();
    router.replace("/welcome");
  };

  // 🔥 NEW: CONTACT FUNCTION
  const handleContact = () => {
    Linking.openURL(
      "mailto:indoridates@gmail.com?subject=IndoriDates Support&body=Hi, I am facing an issue...",
    );
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            {isOtherProfile && (
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.title}>
              {isOtherProfile ? "User Profile" : "My Profile"}
            </Text>

            {viewUser.photos?.filter((p: string) => p && p.trim() !== "")
              .length > 0 && (
              <View style={styles.photoRow}>
                {viewUser.photos
                  .filter((p: string) => p && p.trim() !== "")
                  .map((uri: string, index: number) => (
                    <Image key={index} source={{ uri }} style={styles.photo} />
                  ))}
              </View>
            )}

            {viewUser.name && (
              <>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{viewUser.name}</Text>
              </>
            )}

            {viewUser.age && (
              <>
                <Text style={styles.label}>Age</Text>
                <Text style={styles.value}>{viewUser.age}</Text>
              </>
            )}

            {viewUser.gender && (
              <>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>{viewUser.gender}</Text>
              </>
            )}

            {viewUser.bio && (
              <>
                <Text style={styles.label}>Bio</Text>
                <Text style={styles.value}>{viewUser.bio}</Text>
              </>
            )}

            {!isOtherProfile && (
              <>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push("/edit-profile")}
                >
                  <Text style={styles.btnText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutBtn}
                  onPress={handleLogout}
                >
                  <Text style={styles.btnText}>Logout</Text>
                </TouchableOpacity>

                {/* 🔥 NEW: CONTACT SUPPORT */}
                <TouchableOpacity
                  style={{
                    backgroundColor: "#444",
                    padding: 15,
                    borderRadius: 12,
                    marginTop: 10,
                    alignItems: "center",
                  }}
                  onPress={handleContact}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    📩 Contact Support
                  </Text>
                </TouchableOpacity>

                <Text
                  style={{
                    color: "#ccc",
                    fontSize: 12,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  For any issues or suggestions, contact us via email. We
                  usually respond within 24–48 hours.
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 20,
  },
  backText: {
    color: "white",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { color: "#ccc", marginTop: 10 },
  value: { color: "white", fontSize: 16 },
  photoRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 15 },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  editBtn: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  logoutBtn: {
    backgroundColor: "#ff4d6d",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
});
