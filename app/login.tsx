import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";
import { registerForPushNotifications } from "../services/notificationService";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        "860588660053-p5rk7kth3hbavua92d5bog1pa87sdp7h.apps.googleusercontent.com",
    });
  }, []);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());

      Alert.alert(
        "Success",
        "Password reset link sent. Check Inbox, Spam, or Promotions.",
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAuth = async () => {
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Enter email and password");
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password.trim(),
        );

        await sendEmailVerification(userCredential.user);

        Alert.alert(
          "Verify Email",
          "Verification email sent. Please check Inbox, Spam, or Promotions folder before login.",
        );

        return;
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password.trim(),
        );

        // if (!userCredential.user.emailVerified) {
//   Alert.alert(
//     "Email Not Verified",
//     "Please verify your email before login.",
//   );
//   return;
// }

        await registerForPushNotifications(userCredential.user.uid);

        router.replace("/");
      }
    } catch (error: any) {
      Alert.alert("Auth Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/indore-bg.png")}
        style={styles.background}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.overlay}
        >
          <View style={styles.card}>
            <Text style={styles.title}>
              {isRegister ? "Create Account" : "Welcome Back"}
            </Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor="#ccc"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#ccc"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isRegister ? "Register" : "Login"}
                </Text>
              )}
            </TouchableOpacity>
{/*
            <TouchableOpacity
              style={styles.googleButton}
              onPress={async () => {
                try {
                  await GoogleSignin.hasPlayServices();
                  const userInfo = await GoogleSignin.signIn();
                  const idToken = userInfo.data?.idToken;

                  const credential = GoogleAuthProvider.credential(idToken);

                  await signInWithCredential(auth, credential);

                  router.replace("/");

                  console.log("GOOGLE USER:", userInfo);

                  router.replace("/");
                } catch (error) {
                  console.log("GOOGLE LOGIN ERROR:", error);
                }
              }}
            >
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>
*/}
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
            <Text style={styles.noteText}>
              Check Inbox / Spam / Promotions for email
            </Text>
            <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
              <Text style={styles.switchText}>
                {isRegister
                  ? "Already have an account? Login"
                  : "New user? Create account"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    padding: 14,
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
  },
  button: {
    backgroundColor: "#ff4d6d",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  forgotText: {
    textAlign: "center",
    color: "#FFD700",
    fontWeight: "600",
    marginBottom: 15,
  },
  noteText: {
    textAlign: "center",
    color: "#ddd",
    fontSize: 12,
    marginBottom: 12,
  },
  switchText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});
