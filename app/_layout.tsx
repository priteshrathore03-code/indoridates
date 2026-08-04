import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProfileProvider } from "../data/userProfile";
import useAutoLocation from "../hooks/useAutoLocation";
import usePushNotifications from "../hooks/usePushNotifications";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { auth, db } from "../firebaseConfig";
import { startPresence } from "../services/presenseService";

import { Alert, Linking } from "react-native";

export default function RootLayout() {
  // TypeScript Fix: <any> lagane se undefined, null aur user object sab allow ho jayenge
  const [user, setUser] = useState<any>(undefined);
  const [updateChecked, setUpdateChecked] = useState(false);

  const CURRENT_VERSION = 3;
  const segments = useSegments();
  const router = useRouter();

  try {
    usePushNotifications();
  } catch (e) {
    console.log("Notification skipped");
  }

  try {
    useAutoLocation();
  } catch (e) {
    console.log("Location skipped");
  }

  // Auth Listener जो चेक करेगा कि पुराना यूजर लॉगिन है या नहीं
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return unsubscribe;
  }, []);
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const snap = await getDoc(doc(db, "appConfig", "version"));

        if (!snap.exists()) {
          setUpdateChecked(true);
          return;
        }

        const config = snap.data();

        if (config.forceUpdate && CURRENT_VERSION < config.latestVersion) {
          Alert.alert(
            "Update Required 🚀",
            "Please update IndoriDates to continue.",
            [
              {
                text: "Update Now",
                onPress: () => {
                  Linking.openURL(
                    "https://play.google.com/store/apps/details?id=com.indoridates.app2",
                  );
                },
              },
            ],
            {
              cancelable: false,
            },
          );

          return;
        }

        setUpdateChecked(true);
      } catch (e) {
        console.log("Version check error", e);
        setUpdateChecked(true);
      }
    };

    checkVersion();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    startPresence(user.uid);
  }, [user?.uid]);
  // Auto-Routing Logic (Login state ke hisaab se sahi screen par bhejna)
  useEffect(() => {
    if (user === undefined || !updateChecked) return;

    const inAuthGroup = segments[0] === "login";

    if (!user && !inAuthGroup) {
      // अगर यूजर लॉगइन नहीं है और लॉगिन स्क्रीन पर भी नहीं है -> लॉगिन पर भेजो
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // अगर यूजर लॉगइन है और लॉगिन स्क्रीन पर खड़ा है -> होम (root) पर भेजो
      router.replace("/");
    }
  }, [user, segments, updateChecked]);

  // जब तक फ़ायरबेस चेक कर रहा है, तब तक लोडिंग स्पिनर दिखेगा
  if (user === undefined || !updateChecked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff4d6d" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProfileProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </UserProfileProvider>
    </GestureHandlerRootView>
  );
}
