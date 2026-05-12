import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Image,
  Linking,
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

  const profileImage =
    user?.photos?.[0] ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330";

  const handleLogout = async () => {
    await logout();
    router.replace("/welcome");
  };
  const handleSupport = async () => {
    try {
      await Linking.openURL(
        "mailto:support@indoridates.com?subject=IndoriDates Support",
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* HERO CARD */}
          <LinearGradient
            colors={["rgba(255,77,109,0.25)", "rgba(255,255,255,0.08)"]}
            style={styles.heroCard}
          >
            <Image source={{ uri: profileImage }} style={styles.profileImage} />

            <View style={styles.infoSection}>
              <Text style={styles.name}>
                {user?.name || "Indori User"},{" "}
                <Text style={styles.age}>{user?.age || 18}</Text>
              </Text>

              <View style={styles.badgeRow}>
                <View style={styles.genderBadge}>
                  <Ionicons
                    name={user?.gender === "female" ? "female" : "male"}
                    size={15}
                    color="#fff"
                  />

                  <Text style={styles.badgeText}>{user?.gender || "User"}</Text>
                </View>

                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={14} color="#fff" />

                  <Text style={styles.badgeText}>Indore</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* ABOUT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>

            <View style={styles.glassCard}>
              <Text style={styles.bioText}>
                {user?.bio || "No bio added yet"}
              </Text>
            </View>
          </View>

          {/* PHOTOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(user?.photos || []).map((photo: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.galleryImage}
                />
              ))}
            </ScrollView>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/edit-profile")}
            >
              <View style={styles.actionLeft}>
                <Feather name="edit-2" size={20} color="#fff" />

                <Text style={styles.actionText}>Edit Profile</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push("/todo")}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="calendar-outline" size={20} color="#fff" />

                <Text style={styles.actionText}>My Plans</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleSupport}>
              <View style={styles.actionLeft}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color="#fff"
                />

                <Text style={styles.actionText}>Contact Support</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>
            <Text style={styles.supportText}>
              Need help? Contact us anytime. We usually respond within 24-48
              hours.
            </Text>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />

              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  supportText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: -6,
    marginBottom: 14,
    marginLeft: 8,
  },
  container: {
    padding: 20,
    paddingTop: 70,
  },

  heroCard: {
    borderRadius: 28,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: "#ff4d6d",
  },

  infoSection: {
    alignItems: "center",
    marginTop: 18,
  },

  name: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },

  age: {
    color: "#ffb3c1",
  },

  badgeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  genderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "600",
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  bioText: {
    color: "#ddd",
    lineHeight: 24,
    fontSize: 15,
  },

  galleryImage: {
    width: 120,
    height: 170,
    borderRadius: 20,
    marginRight: 14,
  },

  actionBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  logoutBtn: {
    backgroundColor: "#ff4d6d",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
