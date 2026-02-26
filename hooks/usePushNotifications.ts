import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

export default function usePushNotifications() {
  useEffect(() => {
    const register = async () => {
      try {
        if (!Device.isDevice) {
          console.log("Push works only on real device");
          return;
        }

        const { status } = await Notifications.requestPermissionsAsync();

        if (status !== "granted") {
          console.log("Push permission not granted");
          return;
        }

        const token = await Notifications.getExpoPushTokenAsync();

        console.log("Expo Push Token:", token.data);
      } catch (error) {
        console.log("Push registration error:", error);
      }
    };

    register();
  }, []);
}
