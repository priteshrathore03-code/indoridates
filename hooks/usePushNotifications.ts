import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import { auth } from "../firebaseConfig";
import { registerForPushNotifications } from "../services/notificationService";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function usePushNotifications() {
  useEffect(() => {
    const uid = auth.currentUser?.uid;

    if (uid) {
      registerForPushNotifications(uid);
    }

    const receivedListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification Received:", notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Clicked:", response);
      });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, []);
}
