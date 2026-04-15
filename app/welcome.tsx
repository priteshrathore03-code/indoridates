import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import IndoreBackground from "./components/IndoreBackground";

export default function Welcome() {
  const router = useRouter();

  return (
    <IndoreBackground>
      {/* Hum direct content area focus karenge, no extra background filters */}
      <View style={styles.centerContainer}>
        {/* Main Content Area */}
        <View style={styles.contentWrapper}>
          {/* Logo/Title Section with Hearts */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>IndoriDates</Text>
            <Text style={styles.hearts}>💕</Text>
          </View>

          {/* Minimal Spacing between title and slogans */}
          <View style={styles.taglineSection}>
            <Text style={styles.subtitle}>
              Where Real Vibes Meet Real Plans ✨
            </Text>
            <Text style={styles.tagline}>Find your vibe in Indore</Text>
          </View>

          {/* Highly Elegant and Distinct Button */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.buttonText}>GET STARTED</Text>
          </TouchableOpacity>
        </View>
      </View>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20, // Padding thodi kam ki taaki text ko jagah mile
  },
  contentWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 40, // Rajwada ke upper portion ko dikhane ke liye thoda neeche shift kiya
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap", // Force karega ki text aur heart ek hi line mein rahe
    marginBottom: 10,
  },
  title: {
    fontSize: 42, // Mobile ke liye size 56 se 42 kiya (Best fit)
    color: "#fff",
    textAlign: "center",
    fontFamily: "serif", // Standard serif elegant lagta hai
    fontStyle: "italic",
    fontWeight: "800",
    letterSpacing: 0.5,
    textShadowColor: "rgba(255, 77, 109, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  hearts: {
    fontSize: 38, // Hearts ka size title ke hisaab se chhota kiya
    paddingLeft: 8,
  },
  taglineSection: {
    alignItems: "center",
    marginBottom: 35,
    width: "90%", // Slogans ko center mein rakhne ke liye
  },
  subtitle: {
    fontSize: 16, // Thoda chhota taaki single line ya clean double line mein aaye
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    fontWeight: "600",
    fontFamily: "serif",
    fontStyle: "italic",
    lineHeight: 24, // Reading experience better karne ke liye
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    fontWeight: "400",
    marginTop: 8,
    fontFamily: "serif",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#ff4d6d",
    paddingVertical: 14, // Touch target sahi rakha par height kam ki
    paddingHorizontal: 45,
    borderRadius: 30,
    elevation: 5, // Android par halki depth
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
});
