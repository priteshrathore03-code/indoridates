import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserProfile } from "../../data/userProfile";
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useUserProfile();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.replace("/"); // 👈 start page pe bhejega
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>My Profile</Text>

            {user.photos && user.photos.length > 0 && (
              <View style={styles.photoRow}>
                {user.photos.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.photo} />
                ))}
              </View>
            )}

            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{user.phone}</Text>

            {user.name && (
              <>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{user.name}</Text>
              </>
            )}

            {user.age && (
              <>
                <Text style={styles.label}>Age</Text>
                <Text style={styles.value}>{user.age}</Text>
              </>
            )}

            {user.gender && (
              <>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>{user.gender}</Text>
              </>
            )}

            {user.bio && user.bio.trim() !== "" && (
              <>
                <Text style={styles.label}>Bio</Text>
                <Text style={styles.value}>{user.bio}</Text>
              </>
            )}

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={styles.btnText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.btnText}>Logout</Text>
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

  label: {
    color: "#ccc",
    marginTop: 10,
  },

  value: {
    color: "white",
    fontSize: 16,
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

  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
