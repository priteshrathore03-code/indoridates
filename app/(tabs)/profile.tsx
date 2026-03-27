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

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
        if (snap.exists()) setViewUser(snap.data());
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

  const handleContact = () => {
    Linking.openURL(
      "mailto:indoridates@gmail.com?subject=IndoriDates Support&body=Hi, I need help..."
    );
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <ScrollView contentContainerStyle={styles.container}>

          <View style={styles.card}>

            {isOtherProfile && (
              <TouchableOpacity
                onPress={() => {
                  if (router.canGoBack()) router.back();
                  else router.replace("/(tabs)/home");
                }}
              >
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.title}>
              {isOtherProfile ? "User Profile" : "My Profile"}
            </Text>

            {/* PHOTOS */}
            {viewUser.photos?.filter((p:string)=>p && p.trim() !== "").length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {viewUser.photos
                  .filter((p:string)=>p && p.trim() !== "")
                  .map((uri:string,index:number)=>(
                    <Image key={index} source={{uri}} style={styles.photo}/>
                  ))}
              </ScrollView>
            )}

            {/* INFO */}
            {viewUser.name && (
              <View style={styles.infoRow}>
                <Feather name="user" size={16} color="#aaa" />
                <Text style={styles.value}>{viewUser.name}</Text>
              </View>
            )}

            {viewUser.age && (
              <View style={styles.infoRow}>
                <Feather name="calendar" size={16} color="#aaa" />
                <Text style={styles.value}>{viewUser.age}</Text>
              </View>
            )}

            {viewUser.gender && (
              <View style={styles.infoRow}>
                <Feather name="heart" size={16} color="#aaa" />
                <Text style={styles.value}>{viewUser.gender}</Text>
              </View>
            )}

            {viewUser.bio && (
              <View style={styles.bioBox}>
                <Text style={styles.bio}>{viewUser.bio}</Text>
              </View>
            )}

            {/* MY PROFILE ACTIONS */}
            {!isOtherProfile && (
              <>

                <TouchableOpacity
                  onPress={() => router.push("/edit-profile")}
                >
                  <LinearGradient
                    colors={["#ffb347","#ff416c","#ff2d95"]}
                    start={{x:0,y:0}}
                    end={{x:1,y:0}}
                    style={styles.button}
                  >
                    <Text style={styles.btnText}>Edit Profile</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout}>
                  <LinearGradient
                    colors={["#ff4d6d","#ff2d55"]}
                    style={styles.button}
                  >
                    <Text style={styles.btnText}>Logout</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleContact}>
                  <View style={styles.supportBtn}>
                    <Text style={styles.btnText}>📩 Contact Support</Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.supportText}>
                  Need help? Contact us anytime.  
                  We usually respond within 24-48 hours.
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

container:{
flexGrow:1,
justifyContent:"center",
padding:20
},

card:{
backgroundColor:"rgba(255,255,255,0.12)",
borderRadius:25,
padding:20
},

backText:{
color:"white",
marginBottom:10
},

title:{
fontSize:24,
fontWeight:"bold",
color:"white",
textAlign:"center",
marginBottom:20
},

photo:{
width:120,
height:120,
borderRadius:15,
marginRight:10
},

infoRow:{
flexDirection:"row",
alignItems:"center",
marginTop:10,
gap:8
},

value:{
color:"white",
fontSize:16
},

bioBox:{
backgroundColor:"rgba(255,255,255,0.1)",
borderRadius:15,
padding:12,
marginTop:15
},

bio:{
color:"#ddd"
},

button:{
padding:16,
borderRadius:30,
alignItems:"center",
marginTop:15
},

btnText:{
color:"white",
fontWeight:"bold"
},

supportBtn:{
backgroundColor:"#444",
padding:16,
borderRadius:30,
alignItems:"center",
marginTop:15
},

supportText:{
color:"#ccc",
fontSize:12,
textAlign:"center",
marginTop:10
}

});