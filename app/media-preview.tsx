import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Alert, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebaseConfig";
import { uploadImage } from "../services/mediaService";

export default function ImagePreview() {
  const router = useRouter();

  const { mediaUri, roomId, mediaType } = useLocalSearchParams<{
    mediaUri: string;
    roomId: string;
    mediaType: "image" | "video";
  }>();
  const sendMedia = async () => {
    try {
      if (!mediaUri) return;

      Alert.alert("Uploading...", "Please wait");

      const imageUrl = await uploadImage(String(mediaUri));

      await addDoc(collection(db, "messages"), {
        roomId: String(roomId),
        senderId: auth.currentUser?.uid,

        type: mediaType,
        text: "",

        mediaUrl: imageUrl,
        thumbnail: "",
        fileName: "",
        fileSize: 0,
        duration: 0,

        replyTo: null,
        reactions: {},

        edited: false,
        deletedFor: [],

        status: "sending",

        sentAt: null,
        deliveredAt: null,
        readAt: null,

        createdAt: serverTimestamp(),
      });

      router.back();
    } catch (e: any) {
      console.log("UPLOAD ERROR =>", e);

      Alert.alert("Upload Error", JSON.stringify(e?.message || e));
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Text style={styles.icon}>✕</Text>
      </TouchableOpacity>

      {mediaType === "image" ? (
        <Image
          source={{ uri: mediaUri }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <Text
          style={{
            color: "white",
            textAlign: "center",
            marginTop: 50,
          }}
        >
          Video Preview Coming...
        </Text>
      )}

      <TouchableOpacity style={styles.send} onPress={sendMedia}>
        <Text style={styles.sendText}>➤</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  image: {
    flex: 1,
    width: "100%",
  },

  close: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 100,
  },

  icon: {
    color: "white",
    fontSize: 28,
  },

  send: {
    position: "absolute",
    bottom: 40,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6a0dad",
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "white",
    fontSize: 26,
  },
});
