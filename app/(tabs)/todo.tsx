import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  notifyAllMales,
  sendPersonalNotification,
} from "../../services/notificationService";

import { createChatRoom } from "../../data/chatStore";
import {
  addPlan,
  deletePlan,
  listenPlans,
  PlanType,
  updatePlan,
} from "../../data/planStore";

import { useUserProfile } from "../../data/userProfile";

import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function Todo() {
  const router = useRouter();
  const { user } = useUserProfile();

  const [plans, setPlans] = useState<PlanType[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [brief, setBrief] = useState("");
  const [visibleTo, setVisibleTo] = useState<"male" | "female" | "everyone">(
    "male",
  );
  const [expandedPlans, setExpandedPlans] = useState<string[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const hasActivePlan = plans.some((p) => p.createdBy === user?.uid);

  useEffect(() => {
    const unsubscribe = listenPlans(async (data) => {
      const now = Date.now();

      const validPlans = data.filter((plan) => {
        const expired = now - plan.createdAt > 24 * 60 * 60 * 1000;

        if (expired && plan.id) {
          deletePlan(plan.id);
          return false;
        }

        return true;
      });

      setPlans(validPlans);
    });

    return () => unsubscribe();
  }, []);

  if (!user) return null;

  const visiblePlans = plans.filter((plan) => {
    const isMyPlan = plan.createdBy === user.uid;

    // Female host always sees her own plan
    if (isMyPlan) {
      return true;
    }

    // Closed plans hide
    if (plan.status !== "open") {
      return false;
    }

    // Old plans without visibleTo
    if (!plan.visibleTo) {
      return true;
    }

    // Plan visible to everyone
    if (plan.visibleTo === "everyone") {
      return true;
    }

    // Male users
    if (user.gender === "male" && plan.visibleTo === "male") {
      return true;
    }

    // Female users
    if (user.gender === "female" && plan.visibleTo === "female") {
      return true;
    }

    return false;
  });

  const handleCreate = async () => {
    if (!title || !time || !brief) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    await addPlan({
      title,
      time,
      brief,

      createdBy: user.uid,
      createdByName: user.name || "User",
      createdByPhoto: user.photos?.[0] || "",

      createdAt: Date.now(),
      requests: [],
      accepted: "",
      status: "open",
      visibleTo,
    });

    setTitle("");
    setTime("");
    setBrief("");

    await notifyAllMales(
      "New Plan Alert! 🔥",
      `${user.name} has posted a new plan. Check it out!`,
    );

    setShowForm(false);
  };

  const handleDelete = async (planId: string) => {
    Alert.alert("Delete Plan", "Are you sure you want to cancel this plan?", [
      { text: "No" },
      { text: "Yes", onPress: () => deletePlan(planId) },
    ]);
  };

  const handleInterested = async (plan: PlanType) => {
    if (!plan.id) return;

    if (plan.requests.some((r) => r.uid === user.uid)) {
      Alert.alert("Already Sent", "You have already requested to join.");
      return;
    }

    await updatePlan(plan.id, {
      requests: [
        ...plan.requests,
        {
          uid: user.uid,
          name: user.name || "User",
          photo: user.photos?.[0] || "",
        },
      ],
    });

    await sendPersonalNotification(
      plan.createdBy,
      "New Interest! ❤️",
      `${user.name} is interested in your plan!`,
    );

    Alert.alert("Success", "Interest sent to the host!");
  };

  const handleAccept = async (plan: PlanType, reqUid: string) => {
    if (!plan.id) return;

    await createChatRoom(plan.createdBy, reqUid);

    await sendPersonalNotification(
      reqUid,
      "Plan Accepted! ✅",
      `${user.name} accepted your request. Let's chat!`,
    );

    const otherUsers = plan.requests.filter((r) => r.uid !== reqUid);

    for (const otherUser of otherUsers) {
      await sendPersonalNotification(
        otherUser.uid,
        "Plan Closed ❌",
        "This plan has already been accepted by someone else.",
      );
    }

    await deletePlan(plan.id);

    Alert.alert("Accepted!", "Chat room created. Heading to messages...");
    router.replace("/(tabs)/chat");
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {visiblePlans.length === 0 && (
              <View style={styles.emptyContainer}>
                <Feather
                  name="calendar"
                  size={70}
                  color="rgba(255,255,255,0.5)"
                />

                <Text style={styles.emptyTitle}>No Plans Yet</Text>
              </View>
            )}
            {visiblePlans.map((plan) => {
              const creator = {
                name: plan.createdByName,
                photos: [plan.createdByPhoto],
              };
              const isMyPlan = plan.createdBy === user.uid;

              return (
                <View key={plan.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <TouchableOpacity
                      style={styles.profileRow}
                      onPress={() => router.push(`/user/${plan.createdBy}`)}
                    >
                      <Image
                        source={{
                          uri:
                            creator?.photos?.[0] ||
                            "https://via.placeholder.com/150",
                        }}
                        style={styles.profileImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={100}
                      />
                      <View>
                        <Text style={styles.name}>
                          {creator?.name || "Loading..."}
                        </Text>
                        <Text style={styles.timeText}>{plan.time}</Text>
                      </View>
                    </TouchableOpacity>

                    {isMyPlan && (
                      <TouchableOpacity onPress={() => handleDelete(plan.id!)}>
                        <Feather name="trash-2" size={20} color="#ff416c" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.title}>{plan.title}</Text>
                  <Text style={styles.brief}>{plan.brief}</Text>

                  {!isMyPlan && (
                    <TouchableOpacity
                      style={[
                        styles.interestBtn,
                        plan.requests.some((r) => r.uid === user.uid) && {
                          opacity: 0.6,
                        },
                      ]}
                      onPress={() => handleInterested(plan)}
                      disabled={plan.requests.some((r) => r.uid === user.uid)}
                    >
                      <Text style={styles.btnText}>
                        {plan.requests.some((r) => r.uid === user.uid)
                          ? "Request Sent"
                          : "Interested"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {isMyPlan && plan.requests.length > 0 && (
                    <View style={styles.requestSection}>
                      <TouchableOpacity
                        onPress={() => {
                          if (expandedPlans.includes(plan.id!)) {
                            setExpandedPlans((prev) =>
                              prev.filter((id) => id !== plan.id),
                            );
                            return;
                          }

                          setLoadingPlanId(plan.id!);

                          setTimeout(() => {
                            setExpandedPlans((prev) => [...prev, plan.id!]);
                            setLoadingPlanId(null);
                          }, 300);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <Text style={styles.requestCount}>
                          Interests ({plan.requests.length})
                        </Text>

                        {loadingPlanId === plan.id ? (
                          <ActivityIndicator size="small" color="#FFD700" />
                        ) : (
                          <Ionicons
                            name={
                              expandedPlans.includes(plan.id!)
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={20}
                            color="#FFD700"
                          />
                        )}
                      </TouchableOpacity>

                      {expandedPlans.includes(plan.id!) &&
                        plan.requests.map((reqUser) => {
                          return (
                            <View key={reqUser.uid} style={styles.reqUserRow}>
                              <TouchableOpacity
                                style={styles.reqInfo}
                                onPress={() =>
                                  router.push(`/user/${reqUser.uid}`)
                                }
                              >
                                <Image
                                  source={{
                                    uri:
                                      reqUser.photo ||
                                      "https://via.placeholder.com/150",
                                  }}
                                  style={styles.reqAvatar}
                                  contentFit="cover"
                                  cachePolicy="memory-disk"
                                  transition={100}
                                />
                                <Text style={styles.reqName}>
                                  {reqUser.name}
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.smallAcceptBtn}
                                onPress={() => handleAccept(plan, reqUser.uid)}
                              >
                                <Text style={styles.smallBtnText}>Accept</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {showForm && (
            <View style={styles.overlay}>
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Post a Plan</Text>

                <View style={styles.inputBox}>
                  <Feather name="edit-2" size={18} color="#fff" />
                  <TextInput
                    placeholder="Where to? (e.g. Starbucks)"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Feather name="clock" size={18} color="#fff" />
                  <TextInput
                    placeholder="What time? (e.g. 7:00 PM)"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={time}
                    onChangeText={setTime}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Feather name="file-text" size={18} color="#fff" />
                  <TextInput
                    placeholder="Short description..."
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={brief}
                    onChangeText={setBrief}
                  />
                </View>
                <Text style={styles.requestCount}>Who can see this plan?</Text>

                <View style={{ marginBottom: 15 }}>
                  <TouchableOpacity
                    style={[
                      styles.interestBtn,
                      visibleTo === "male" && {
                        backgroundColor: "#3b82f6",
                      },
                    ]}
                    onPress={() => setVisibleTo("male")}
                  >
                    <Text style={styles.btnText}>👦 Only Boys</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.interestBtn,
                      visibleTo === "female" && {
                        backgroundColor: "#ec4899",
                      },
                    ]}
                    onPress={() => setVisibleTo("female")}
                  >
                    <Text style={styles.btnText}>👧 Only Girls</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.interestBtn,
                      visibleTo === "everyone" && {
                        backgroundColor: "#10b981",
                      },
                    ]}
                    onPress={() => setVisibleTo("everyone")}
                  >
                    <Text style={styles.btnText}>🌍 Everyone</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handleCreate}>
                  <LinearGradient
                    colors={["#ffb347", "#ff416c", "#ff2d95"]}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveText}>Post Now</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!showForm && user.gender === "female" && !hasActivePlan && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={styles.createBtnContainer}
            >
              <LinearGradient
                colors={["#ffb347", "#ff416c", "#ff2d95"]}
                style={styles.createBtn}
              >
                <Text style={styles.createText}>+ Create New Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: "rgba(0,0,0,0.85)",
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  name: { color: "#FFD700", fontWeight: "bold", fontSize: 16 },
  timeText: { color: "#aaa", fontSize: 12 },
  title: { color: "white", fontSize: 19, fontWeight: "bold", marginBottom: 5 },
  brief: { color: "#ccc", fontSize: 14, lineHeight: 20 },
  interestBtn: {
    backgroundColor: "#ff2d95",
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
  requestSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 15,
  },
  requestCount: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reqUserRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  reqInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  reqAvatar: { width: 35, height: 35, borderRadius: 17.5, marginRight: 10 },
  reqName: { color: "white", fontWeight: "600" },
  smallAcceptBtn: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  smallBtnText: { color: "white", fontWeight: "bold", fontSize: 12 },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  formCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 25,
    padding: 25,
    borderWidth: 1,
    borderColor: "#333",
  },
  formTitle: {
    fontSize: 26,
    color: "white",
    textAlign: "center",
    marginBottom: 25,
    fontWeight: "bold",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 15,
  },
  input: { flex: 1, color: "white", fontSize: 16, marginLeft: 10 },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: { color: "white", fontWeight: "bold", fontSize: 18 },
  cancel: { textAlign: "center", color: "#888", marginTop: 15, fontSize: 16 },
  createBtnContainer: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    width: "80%",
  },
  createBtn: {
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 180,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 18,
  },
  createText: { color: "white", fontWeight: "bold", fontSize: 18 },
});
