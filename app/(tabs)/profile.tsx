import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebaseConfig";

import { useUserProfile } from "../../data/userProfile";
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useUserProfile();

  if (!user) return null;

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState("");

  const profileImage = user.photos?.[0] || "";

  const hasProfileImage =
    profileImage &&
    typeof profileImage === "string" &&
    profileImage.trim().length > 0;

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
  const handleDeleteProfile = async () => {
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to permanently delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const currentUser = auth.currentUser;

              if (!currentUser) return;

              const uid = currentUser.uid;

              // Firestore profile delete
              await deleteDoc(doc(db, "users", uid));

              // Firebase auth delete
              await deleteUser(currentUser);

              // Local storage clear
              await AsyncStorage.clear();

              // Redirect
              router.replace("/welcome");
            } catch (error) {
              console.log("DELETE PROFILE ERROR:", error);
            }
          },
        },
      ],
    );
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
            {hasProfileImage ? (
              <Image
                key={profileImage}
                source={{
                  uri: `${profileImage}?t=${Date.now()}`,
                }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.emptyProfile}>
                <Ionicons name="person" size={50} color="#fff" />
              </View>
            )}

            <View style={styles.infoSection}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={styles.name}>
                  {user.name}, <Text style={styles.age}>{user.age}</Text>
                </Text>

                {user?.verification?.status === "verified" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color="#1DA1F2"
                    style={{
                      marginLeft: 8,
                      marginTop: 2,
                    }}
                  />
                )}
              </View>

              <View style={styles.badgeRow}>
                <View style={styles.genderBadge}>
                  <Ionicons
                    name={user?.gender === "female" ? "female" : "male"}
                    size={15}
                    color="#fff"
                  />

                  <Text style={styles.badgeText}>{user.gender}</Text>
                </View>

                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={14} color="#fff" />

                  <Text style={styles.badgeText}>Indore</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.verifyCard}
              disabled={user?.verification?.status === "verified"}
              onPress={() => {
                if (user?.verification?.status !== "verified") {
                  router.push("/verification");
                }
              }}
            >
              <Ionicons
                name={
                  user?.verification?.status === "verified"
                    ? "checkmark-circle"
                    : "shield-checkmark"
                }
                size={34}
                color="#00E676"
              />

              <View
                style={{
                  flex: 1,
                  marginLeft: 15,
                }}
              >
                <Text style={styles.verifyTitle}>
                  {user?.verification?.status === "verified"
                    ? "Verified"
                    : "Get Verified"}
                </Text>

                <Text style={styles.verifySubtitle}>
                  {user?.verification?.status === "verified"
                    ? "Your profile has been successfully verified."
                    : "Verify your profile and earn the Verified Badge."}
                </Text>
              </View>

              {user?.verification?.status !== "verified" && (
                <Ionicons name="chevron-forward" size={22} color="#999" />
              )}
            </TouchableOpacity>
          </View>
          {/* ABOUT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>

            <View style={styles.glassCard}>
              <Text style={styles.bioText}>
                {user.bio || "No bio added yet"}
              </Text>
            </View>
          </View>

          {/* PHOTOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(user?.photos || []).map((photo: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => {
                    setViewerImage(photo);
                    setViewerVisible(true);
                  }}
                >
                  <Image
                    key={`${photo}-${index}`}
                    source={{
                      uri: `${photo}?t=${Date.now()}`,
                    }}
                    style={styles.galleryImage}
                  />
                </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDeleteProfile}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />

              <Text style={styles.deleteText}>Delete My Profile</Text>
            </TouchableOpacity>
          </View>
          <Modal visible={viewerVisible} transparent animationType="fade">
            <View style={styles.viewerContainer}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setViewerVisible(false)}
              >
                <Ionicons name="close" size={34} color="#fff" />
              </TouchableOpacity>

              <Image
                source={{ uri: viewerImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            </View>
          </Modal>
          <View style={{ height: 120 }} />
        </ScrollView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  emptyProfile: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ff4d6d",
  },
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
  deleteBtn: {
    backgroundColor: "#ff3b30",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    width: "100%",
    height: "85%",
  },

  closeBtn: {
    position: "absolute",
    top: 60,
    right: 25,
    zIndex: 10,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  verifyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  verifyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  verifySubtitle: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
  },
});
