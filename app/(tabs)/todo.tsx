import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  addPlan,
  deletePlan,
  getAllPlans,
  PlanStatus,
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
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [brief, setBrief] = useState("");

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const data = await getAllPlans();
    setPlans(data);
  };

  if (!user) return null;

  const isFemale = user.gender === "female";
  const isMale = user.gender === "male";

  const resetForm = () => {
    setTitle("");
    setTime("");
    setBrief("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!title || !time || !brief) return;

    if (editingId) {
      await updatePlan(editingId, { title, time, brief });
    } else {
      const newPlan: PlanType = {
        title,
        time,
        brief,
        createdBy: user.uid,
        createdByName: user.name || "User",
        requests: [],
        accepted: "",
        status: "open",
        createdAt: Date.now(),
      };
      await addPlan(newPlan);
    }

    await loadPlans();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deletePlan(id);
    await loadPlans();
  };

  const handleInterested = async (plan: PlanType) => {
    if (!plan.id) return;

    if (!plan.requests.includes(user.uid)) {
      await updatePlan(plan.id, {
        requests: [...plan.requests, user.uid],
      });
      await loadPlans();
    }
  };

  const handleAccept = async (plan: PlanType, uid: string) => {
    if (!plan.id) return;

    await updatePlan(plan.id, {
      accepted: uid,
      status: "matched" as PlanStatus,
    });

    await loadPlans();
  };

  const handleReject = async (plan: PlanType, uid: string) => {
    if (!plan.id) return;

    await updatePlan(plan.id, {
      requests: plan.requests.filter((r) => r !== uid),
    });

    await loadPlans();
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView style={styles.container}>
          {isFemale && (
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => setShowForm(!showForm)}
            >
              <Text style={styles.btnText}>
                {showForm ? "Cancel" : "Create Plan"}
              </Text>
            </TouchableOpacity>
          )}

          {showForm && (
            <View style={styles.form}>
              <TextInput
                placeholder="Title"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                placeholder="Time"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={time}
                onChangeText={setTime}
              />
              <TextInput
                placeholder="Brief"
                placeholderTextColor="#aaa"
                style={styles.input}
                value={brief}
                onChangeText={setBrief}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.btnText}>
                  {editingId ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {plans.map((plan) => {
            const alreadyRequested = plan.requests.includes(user.uid);

            return (
              <View key={plan.id} style={styles.card}>
                <Text style={styles.name}>{plan.createdByName}</Text>
                <Text style={styles.title}>{plan.title}</Text>
                <Text style={styles.time}>{plan.time}</Text>
                <Text style={styles.brief}>{plan.brief}</Text>

                {isFemale && plan.createdBy === user.uid && (
                  <>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => {
                        setEditingId(plan.id || null);
                        setTitle(plan.title);
                        setTime(plan.time);
                        setBrief(plan.brief);
                        setShowForm(true);
                      }}
                    >
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => plan.id && handleDelete(plan.id)}
                    >
                      <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>

                    {plan.requests.map((req) => (
                      <View key={req} style={styles.requestBox}>
                        <Text style={{ color: "white" }}>New Request</Text>

                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() => handleAccept(plan, req)}
                        >
                          <Text style={styles.btnText}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleReject(plan, req)}
                        >
                          <Text style={styles.btnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                )}

                {isMale &&
                  plan.createdBy !== user.uid &&
                  plan.status === "open" && (
                    <TouchableOpacity
                      style={[
                        styles.interestBtn,
                        alreadyRequested && { backgroundColor: "#555" },
                      ]}
                      disabled={alreadyRequested}
                      onPress={() => handleInterested(plan)}
                    >
                      <Text style={styles.btnText}>
                        {alreadyRequested ? "Request Sent" : "Interested"}
                      </Text>
                    </TouchableOpacity>
                  )}

                {plan.status === "matched" && (
                  <Text style={{ color: "green", marginTop: 10 }}>
                    ✅ Matched
                  </Text>
                )}
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
  card: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  name: { color: "yellow", fontWeight: "bold" },
  title: { color: "white", fontSize: 16, marginTop: 5 },
  time: { color: "orange", marginTop: 3 },
  brief: { color: "white", marginTop: 5 },

  createBtn: {
    backgroundColor: "purple",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },

  saveBtn: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  editBtn: {
    backgroundColor: "blue",
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
    alignItems: "center",
  },

  interestBtn: {
    backgroundColor: "purple",
    padding: 8,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: { color: "white", fontWeight: "bold" },

  form: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#444",
    color: "white",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },

  requestBox: {
    marginTop: 10,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
  },
});
