import * as Notifications from "expo-notifications";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const registerForPushNotifications = async (userId: string) => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

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
