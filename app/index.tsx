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
      try {
        // 🔥 Not logged in
        if (!user) {
          router.replace("/welcome");
          return;
        }

        // 🔥 User profile check
        const snap = await getDoc(doc(db, "users", user.uid));

        // 🔥 New user
        if (!snap.exists()) {
          router.replace("/profile-completion");
          return;
        }

        const data = snap.data();

        // 🔥 Profile complete check
        const isComplete =
          !!data?.name &&
          Array.isArray(data?.photos) &&
          data.photos.length >= 1;

        if (!isComplete) {
          router.replace("/profile-completion");
        } else {
          // 🔥 Direct app
          router.replace("/(tabs)/home");
        }
      } catch (e) {
        console.log("INDEX ERROR:", e);
        router.replace("/welcome");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#ff4d6d" />
      </View>
    );
  }

  return null;
}