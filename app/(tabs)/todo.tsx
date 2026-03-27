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

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

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
    }

    setUsersMap(map);
  };

  if (!user) return null;

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

    await updatePlan(plan.id, {
      requests: [...plan.requests, user.uid],
    });
  };

  const handleAccept = async (plan: PlanType, reqUid: string) => {
    if (!plan.id) return;

    await createChatRoom(plan.createdBy, reqUid);
    await deletePlan(plan.id);

    router.replace("/(tabs)/chat");
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <SafeAreaView style={{ flex: 1 }}>

          <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {plans.map((plan) => {
              const creator = usersMap[plan.createdBy];

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
                      style={styles.interestBtn}
                      onPress={() => handleInterested(plan)}
                    >
                      <Text style={styles.btnText}>Interested</Text>
                    </TouchableOpacity>
                  )}

                  {plan.createdBy === user.uid &&
                    plan.requests.map((reqUid) => (
                      <TouchableOpacity
                        key={reqUid}
                        style={styles.acceptBtn}
                        onPress={() => handleAccept(plan, reqUid)}
                      >
                        <Text style={styles.btnText}>Accept Request</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              );
            })}
          </ScrollView>

          {/* CREATE PLAN MODAL */}
          {showForm && (
            <View style={styles.overlay}>
              <View style={styles.formCard}>

                <Text style={styles.formTitle}>Create a Plan</Text>

                <View style={styles.inputBox}>
                  <Feather name="edit-2" size={18} color="#fff" />
                  <TextInput
                    placeholder="Plan Title"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Feather name="clock" size={18} color="#fff" />
                  <TextInput
                    placeholder="Time"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={time}
                    onChangeText={setTime}
                  />
                </View>

                <View style={styles.inputBox}>
                  <Feather name="file-text" size={18} color="#fff" />
                  <TextInput
                    placeholder="Brief Description"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={brief}
                    onChangeText={setBrief}
                  />
                </View>

                <TouchableOpacity onPress={handleCreate}>
                  <LinearGradient
                    colors={["#ffb347", "#ff416c", "#ff2d95"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtn}
                  >
                    <Text style={styles.saveText}>Save Plan</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowForm(false)}>
                  <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>

              </View>
            </View>
          )}

          {/* CREATE PLAN BUTTON */}
          {!showForm && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={styles.createBtnContainer}
            >
              <LinearGradient
                colors={["#ffb347", "#ff416c", "#ff2d95"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createBtn}
              >
                <Text style={styles.createText}>Create Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

        </SafeAreaView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:16
  },

  card:{
    backgroundColor:"rgba(0,0,0,0.75)",
    padding:16,
    borderRadius:16,
    marginBottom:15
  },

  profileRow:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:10
  },

  profileImage:{
    width:45,
    height:45,
    borderRadius:22,
    marginRight:10
  },

  name:{
    color:"#FFD700",
    fontWeight:"bold"
  },

  title:{
    color:"white",
    fontSize:17,
    fontWeight:"600"
  },

  time:{
    color:"#ffa726",
    marginTop:2
  },

  brief:{
    color:"#eee",
    marginTop:4
  },

  interestBtn:{
    backgroundColor:"#ff2d95",
    padding:10,
    borderRadius:10,
    marginTop:12,
    alignItems:"center"
  },

  acceptBtn:{
    backgroundColor:"#3b82f6",
    padding:10,
    borderRadius:10,
    marginTop:10,
    alignItems:"center"
  },

  btnText:{
    color:"white",
    fontWeight:"bold"
  },

  overlay:{
    position:"absolute",
    bottom:120,
    left:20,
    right:20,
    alignItems:"center"
  },

  formCard:{
    width:"100%",
    backgroundColor:"rgba(255,255,255,0.08)",
    borderRadius:25,
    padding:25
  },

  formTitle:{
    fontSize:32,
    color:"white",
    textAlign:"center",
    marginBottom:25,
    fontFamily:"serif"
  },

  inputBox:{
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"rgba(255,255,255,0.12)",
    paddingHorizontal:15,
    paddingVertical:14,
    borderRadius:15,
    marginBottom:15,
    gap:10
  },

  input:{
    flex:1,
    color:"white",
    fontSize:16
  },

  saveBtn:{
    paddingVertical:16,
    borderRadius:30,
    alignItems:"center",
    marginTop:10
  },

  saveText:{
    color:"white",
    fontWeight:"bold",
    fontSize:18
  },

  cancel:{
    textAlign:"center",
    color:"#ddd",
    marginTop:15,
    fontSize:16
  },

  createBtnContainer:{
    position:"absolute",
    bottom:20,
    left:40,
    right:40
  },

  createBtn:{
    height:55,
    borderRadius:28,
    justifyContent:"center",
    alignItems:"center"
  },

  createText:{
    color:"white",
    fontWeight:"bold",
    fontSize:18
  }

});