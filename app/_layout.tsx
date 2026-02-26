import { Stack } from "expo-router";
import { UserProfileProvider } from "../data/userProfile";

export default function RootLayout() {
  return (
    <UserProfileProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProfileProvider>
  );
}
