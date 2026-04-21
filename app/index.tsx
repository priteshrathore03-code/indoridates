import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, db } from "../firebaseConfig";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        router.replace("/welcome");
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        const data = snap.data();

        // 🔥 FINAL LOGIC
        if (!snap.exists() || !data?.isProfileComplete) {
          router.replace("/profile-completion"); // onboarding start
        } else {
          router.replace("/(tabs)/home"); // normal app
        }

      } catch (e) {
        console.log("INDEX ERROR:", e);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff4d6d" />
      </View>
    );
  }

  return null;
}