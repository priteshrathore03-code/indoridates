import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function GetStart() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        Welcome to IndoriDates 💘
      </Text>
      <Button title="Get Started" onPress={() => router.push("/login")} />
    </View>
  );
}
