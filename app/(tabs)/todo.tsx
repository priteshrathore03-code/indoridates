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
  getAllPlans,
  PlanStatus,
  PlanType,
  updatePlans,
} from "../../data/planStore";
import { useUserProfile } from "../../data/userProfile";
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";

export default function Todo() {
  const router = useRouter();
  const profile = useUserProfile();
  const user = profile?.user;

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
    setPlans(data || []);
  };

  if (!user) return null;

  const isFemale = user.gender === "female";
  const isMale = user.gender === "male";

  const handleSave = async () => {
    if (!title || !time || !brief) return;

    let updatedPlans: PlanType[];

    if (editingId) {
      updatedPlans = plans.map((p) =>
        p.id === editingId ? { ...p, title, time, brief } : p,
      );
    } else {
      const newPlan: PlanType = {
        id: Date.now().toString(),
        title,
        time,
        brief,
        createdBy: user.phone,
        createdByName: user.name || "User",
        requests: [],
        accepted: "",
        status: "open",
        createdAt: Date.now(),
      };

      updatedPlans = [...plans, newPlan];
    }

    setPlans(updatedPlans);
    await updatePlans(updatedPlans);

    setShowForm(false);
    setEditingId(null);
    setTitle("");
    setTime("");
    setBrief("");
  };

  const handleDelete = async (id: string) => {
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    await updatePlans(updated);
  };

  const handleInterested = async (planId: string) => {
    const updated = plans.map((p) =>
      p.id === planId && !p.requests.includes(user.phone)
        ? { ...p, requests: [...p.requests, user.phone] }
        : p,
    );

    setPlans(updated);
    await updatePlans(updated);
  };

  const handleAccept = async (planId: string, phone: string) => {
    const updated = plans.map((p) =>
      p.id === planId
        ? {
            ...p,
            accepted: phone,
            status: "matched" as PlanStatus,
          }
        : p,
    );

    setPlans(updated);
    await updatePlans(updated);
  };

  const handleReject = async (planId: string, phone: string) => {
    const updated = plans.map((p) =>
      p.id === planId
        ? {
            ...p,
            requests: p.requests.filter((r) => r !== phone),
          }
        : p,
    );

    setPlans(updated);
    await updatePlans(updated);
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
            const alreadyRequested = plan.requests.includes(user.phone);

            return (
              <View key={plan.id} style={styles.card}>
                <Text style={styles.name}>{plan.createdByName}</Text>
                <Text style={styles.title}>{plan.title}</Text>
                <Text style={styles.time}>{plan.time}</Text>
                <Text style={styles.brief}>{plan.brief}</Text>

                {/* VIEW PROFILE BUTTON (Both sides) */}
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/profile",
                    })
                  }
                >
                  <Text style={styles.btnText}>View Profile</Text>
                </TouchableOpacity>

                {/* FEMALE OWNER CONTROLS */}
                {isFemale && plan.createdBy === user.phone && (
                  <>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => {
                        setEditingId(plan.id);
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
                      onPress={() => handleDelete(plan.id)}
                    >
                      <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>

                    {plan.requests.map((req) => (
                      <View key={req} style={styles.requestBox}>
                        {/* NUMBER HIDDEN */}
                        <Text style={{ color: "white" }}>New Request</Text>

                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() => handleAccept(plan.id, req)}
                        >
                          <Text style={styles.btnText}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleReject(plan.id, req)}
                        >
                          <Text style={styles.btnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                )}

                {/* MALE INTEREST BUTTON */}
                {isMale &&
                  plan.createdBy !== user.phone &&
                  plan.status === "open" && (
                    <TouchableOpacity
                      style={[
                        styles.interestBtn,
                        alreadyRequested && { backgroundColor: "#555" },
                      ]}
                      disabled={alreadyRequested}
                      onPress={() => handleInterested(plan.id)}
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

  viewBtn: {
    backgroundColor: "#444",
    padding: 8,
    marginTop: 8,
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
