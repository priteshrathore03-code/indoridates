import { Stack } from "expo-router";
import { UserProfileProvider } from "../data/userProfile";
import useAutoLocation from "../hooks/useAutoLocation";
import usePushNotifications from "../hooks/usePushNotifications";

import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProfileProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </UserProfileProvider>
    </GestureHandlerRootView>
  );
}
