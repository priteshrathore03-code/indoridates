import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
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
import { createChatRoom } from "../../data/chatStore";
import {
  addPlan,
  deletePlan,
  listenPlans,
  PlanType,
  updatePlan,
} from "../../data/planStore";
import { useUserProfile } from "../../data/userProfile";
import { db } from "../../firebaseConfig";
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function Todo() {
  const router = useRouter();
  const { user } = useUserProfile();

  const [plans, setPlans] = useState<PlanType[]>([]);
  const [usersMap, setUsersMap] = useState<any>({});
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [brief, setBrief] = useState("");

  // 🔥 REALTIME LISTENER
  useEffect(() => {
    const unsubscribe = listenPlans(async (data) => {
      setPlans(data);
      await fetchUsers(data);
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async (plansData: PlanType[]) => {
    const map: any = {};

    for (const plan of plansData) {
      if (!map[plan.createdBy]) {
        const snap = await getDoc(doc(db, "users", plan.createdBy));
        if (snap.exists()) map[plan.createdBy] = snap.data();
      }

      for (const reqUid of plan.requests || []) {
        if (!map[reqUid]) {
          const snap = await getDoc(doc(db, "users", reqUid));
          if (snap.exists()) map[reqUid] = snap.data();
        }
      }
    }

    setUsersMap(map);
  };

  if (!user) return null;

  const isFemale = user.gender === "female";
  const isMale = user.gender === "male";

  const handleCreate = async () => {
    if (!title || !time || !brief) {
      Alert.alert("Fill all fields");
      return;
    }

    await addPlan({
      title,
      time,
      brief,
      createdBy: user.uid,
      createdAt: Date.now(),
      requests: [],
      accepted: "",
      status: "open",
    });

    setTitle("");
    setTime("");
    setBrief("");
    setShowForm(false);
  };

  const handleInterested = async (plan: PlanType) => {
    if (!plan.id) return;
    if (plan.requests.includes(user.uid)) return;

    await updatePlan(plan.id, {
      requests: [...plan.requests, user.uid],
    });
  };

  const handleAccept = async (plan: PlanType, reqUid: string) => {
    if (!plan.id) return;

    try {
      const roomId = await createChatRoom(plan.createdBy, reqUid);

      await deletePlan(plan.id);

      router.replace({
        pathname: "/(tabs)/chat",
        params: { roomId },
      });
    } catch (error: any) {
      console.log("ACCEPT ERROR FULL:", error);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePlan(id);
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView style={styles.container}>
          {isFemale && (
            <>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => setShowForm(!showForm)}
              >
                <Text style={styles.btnText}>
                  {showForm ? "Cancel" : "Create Plan"}
                </Text>
              </TouchableOpacity>

              {showForm && (
                <View style={styles.form}>
                  <TextInput
                    placeholder="Title"
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                  />
                  <TextInput
                    placeholder="Time"
                    style={styles.input}
                    value={time}
                    onChangeText={setTime}
                  />
                  <TextInput
                    placeholder="Brief"
                    style={styles.input}
                    value={brief}
                    onChangeText={setBrief}
                  />
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleCreate}
                  >
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {plans.map((plan) => {
            const creator = usersMap[plan.createdBy];
            const alreadyRequested = plan.requests.includes(user.uid);

            return (
              <View key={plan.id} style={styles.card}>
                {creator && (
                  <View style={styles.profileRow}>
                    <Image
                      source={{ uri: creator.photos?.[0] }}
                      style={styles.profileImage}
                    />
                    <Text style={styles.name}>{creator.name}</Text>
                  </View>
                )}

                <Text style={styles.title}>{plan.title}</Text>
                <Text style={styles.time}>{plan.time}</Text>
                <Text style={styles.brief}>{plan.brief}</Text>

                {plan.createdBy !== user.uid && (
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => router.push(`/user/${plan.createdBy}`)}
                  >
                    <Text style={styles.btnText}>View Profile</Text>
                  </TouchableOpacity>
                )}

                {isFemale && plan.createdBy === user.uid && (
                  <>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(plan.id!)}
                    >
                      <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>

                    {plan.requests.map((reqUid) => {
                      const reqUser = usersMap[reqUid];
                      return (
                        <View key={reqUid} style={styles.requestBox}>
                          {reqUser && (
                            <>
                              <Text style={{ color: "white" }}>
                                {reqUser.name}
                              </Text>

                              <TouchableOpacity
                                style={styles.viewBtn}
                                onPress={() => router.push(`/user/${reqUid}`)}
                              >
                                <Text style={styles.btnText}>View Profile</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.acceptBtn}
                                onPress={() => handleAccept(plan, reqUid)}
                              >
                                <Text style={styles.btnText}>Accept</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      );
                    })}
                  </>
                )}

                {isMale &&
                  plan.createdBy !== user.uid &&
                  (alreadyRequested ? (
                    <Text style={{ color: "yellow", marginTop: 10 }}>
                      Request Sent
                    </Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.interestBtn}
                      onPress={() => handleInterested(plan)}
                    >
                      <Text style={styles.btnText}>Interested</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            );
          })}
        </ScrollView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  createBtn: {
    backgroundColor: "purple",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  form: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#444",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: { color: "yellow", fontWeight: "bold" },
  title: { color: "white", fontSize: 16 },
  time: { color: "orange" },
  brief: { color: "white" },
  viewBtn: {
    backgroundColor: "#444",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  deleteBtn: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  interestBtn: {
    backgroundColor: "purple",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  acceptBtn: {
    backgroundColor: "blue",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  btnText: { color: "white", fontWeight: "bold" },
  requestBox: {
    marginTop: 10,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
  },
});
