import * as Notifications from "expo-notifications";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "../firebaseConfig";

/* ---------------- PERSONAL NOTIFICATION ---------------- */
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

      console.log("Personal notification sent successfully");
    }
  } catch (error) {
    console.error("Error sending personal notification:", error);
  }
};

/* ---------------- NOTIFY ALL MALES ---------------- */
export const notifyAllMales = async (title: string, body: string) => {
  try {
    const q = query(collection(db, "users"), where("gender", "==", "male"));

    const querySnapshot = await getDocs(q);

    const tokens: string[] = [];

    querySnapshot.forEach((item) => {
      const token = item.data()?.pushToken;
      if (token) {
        tokens.push(token);
      }
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

      console.log("All male users notified");
    }
  } catch (error) {
    console.error("Error notifying all males:", error);
  }
};

/* ---------------- REGISTER PUSH TOKEN ---------------- */
export const registerForPushNotifications = async (userId: string) => {
  try {
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

    console.log("Permission status:", finalStatus);

    if (finalStatus !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();

    const token = tokenData.data;

    console.log("Expo Push Token:", token);

    if (token && userId) {
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        pushToken: token,
      });

      console.log("Token saved successfully!");
    }
  } catch (error) {
    console.error("Token error:", error);
  }
};
