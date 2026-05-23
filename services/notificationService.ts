import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "../firebaseConfig";
export const sendPersonalNotification = async (
  targetUid: string,
  title: string,
  body: string,
) => {
  try {
    const userSnap = await getDoc(doc(db, "users", targetUid));
    const token = userSnap.data()?.pushToken;

    if (token) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: token,
          title,
          body,
          sound: "default",
        }),
      });
    }
  } catch (error) {
    console.error("Error sending personal notification:", error);
  }
};

export const notifyAllMales = async (title: string, body: string) => {
  try {
    const q = query(collection(db, "users"), where("gender", "==", "male"));

    const querySnapshot = await getDocs(q);

    const tokens: string[] = [];

    querySnapshot.forEach((item) => {
      const token = item.data()?.pushToken;
      if (token) tokens.push(token);
    });

    if (tokens.length > 0) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: tokens,
          title,
          body,
          sound: "default",
        }),
      });
    }
  } catch (error) {
    console.error("Error notifying all males:", error);
  }
};

export const registerForPushNotifications = async (userId: string) => {
  try {
    // Web doesn't support Expo push notifications natively
    if (Platform.OS === "web") {
      console.log("Push notifications not available on web");
      // You can implement browser notifications here if needed
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    let token = "";

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      token = tokenData.data;

      console.log("✅ EXPO TOKEN:", token);
    } catch (e) {
      console.log("❌ Expo token fetch failed");
      return;
    }

    if (token && userId) {
      await setDoc(
        doc(db, "users", userId),
        {
          pushToken: token,
        },
        { merge: true },
      );

      console.log("✅ Push token saved successfully!");
    }
  } catch (error) {
    console.error("❌ Token registration error:", error);
  }
};
