import { updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { onValue, ref } from "firebase/database";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db, rtdb } from "../../firebaseConfig";
import { uploadDocument, uploadVoice } from "../../services/mediaService";
import FadeWrapper from "../components/FadeWrapper";
import IndoreBackground from "../components/IndoreBackground";
// Notification Service Import
import { sendPersonalNotification } from "../../services/notificationService";

export default function ChatRoom() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [blocked, setBlocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const myUid = auth.currentUser?.uid;
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  useEffect(() => {
    const loadUser = async () => {
      if (!roomId || !myUid) return;

      const roomSnap = await getDoc(doc(db, "chatRooms", String(roomId)));
      if (!roomSnap.exists()) return;

      const data = roomSnap.data();
      const otherUid = data.users.find((u: string) => u !== myUid);

      const userSnap = await getDoc(doc(db, "users", otherUid));
      if (userSnap.exists()) {
        setOtherUser({ ...userSnap.data(), uid: otherUid });
      }
    };

    loadUser();
  }, [roomId]);

  useEffect(() => {
    if (!otherUser?.uid) return;

    const statusRef = ref(rtdb, `status/${otherUser.uid}`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();

      setStatus(data);
      setIsOnline(data?.state === "online");
    });

    return () => unsubscribe();
  }, [otherUser?.uid]);

  useEffect(() => {
    const checkBlock = async () => {
      if (!myUid || !otherUser) return;

      const q1 = query(
        collection(db, "blocks"),
        where("blockedBy", "==", myUid),
        where("blockedUser", "==", otherUser.uid),
      );

      const q2 = query(
        collection(db, "blocks"),
        where("blockedBy", "==", otherUser.uid),
        where("blockedUser", "==", myUid),
      );

      const snap1 = await getDocs(q1);
      const snap2 = await getDocs(q2);

      if (!snap1.empty || !snap2.empty) {
        setBlocked(true);
      } else {
        setBlocked(false);
      }
    };

    checkBlock();
  }, [otherUser]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "messages"),
      where("roomId", "==", String(roomId)),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(q, async (snap) => {
      const arr: any[] = [];

      for (const d of snap.docs) {
        const data = d.data();

        if (data.senderId !== myUid && data.status !== "read") {
          await updateDoc(doc(db, "messages", d.id), {
            status: "read",
          });
        }

        arr.push({ id: d.id, ...data });
      }

      setMessages(arr);
    });

    return () => unsub();
  }, [roomId]);
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Gallery permission is required.");
      return;
    }
    console.log("Opening Video Picker...");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    console.log("RESULT =>", result);
    if (result.canceled) return;

    router.push({
      pathname: "/media-preview",
      params: {
        roomId: String(roomId),
        mediaUri: result.assets[0].uri,
        mediaType: "image",
      },
    });
  };
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    try {
      Alert.alert("Uploading...", "Please wait");

      const file = result.assets[0];

      const documentUrl = await uploadDocument(file.uri, file.name);

      await addDoc(collection(db, "messages"), {
        roomId: String(roomId),
        senderId: myUid,

        type: "document",
        text: "",

        mediaUrl: documentUrl,

        fileName: file.name,
        fileSize: file.size ?? 0,

        thumbnail: "",
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

      Alert.alert("Success", "Document sent.");
    } catch (e: any) {
      console.log("DOCUMENT ERROR =>", e);

      Alert.alert("Document Error", JSON.stringify(e?.message || e));
    }
  };
  const handleAttachment = async () => {
    Alert.alert("Select Attachment", "Choose what you want to send", [
      {
        text: "📷 Image",
        onPress: pickImage,
      },
      {
        text: "🎥 Video",
        onPress: pickVideo,
      },
      {
        text: "📄 Document",
        onPress: pickDocument,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (result.canceled) return;
    router.push({
      pathname: "/media-preview",
      params: {
        roomId: String(roomId),
        mediaUri: result.assets[0].uri,
        mediaType: "image",
      },
    });
  };
  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 1,
      videoMaxDuration: 60,
    });

    if (result.canceled) return;
    router.push({
      pathname: "/media-preview",
      params: {
        roomId: String(roomId),
        mediaUri: result.assets[0].uri,
        mediaType: "image",
      },
    });

    const video = result.assets[0];

    // Duration Check
    if ((video.duration ?? 0) > 60000) {
      Alert.alert("Video Error", "Video is more than 1 minute.");
      return;
    }

    // File Size Check
    if ((video.fileSize ?? 0) > 100 * 1024 * 1024) {
      Alert.alert("Video Error", "Maximum video size is 100 MB.");
      return;
    }

    console.log(video);

    // Abhi direct preview bhejenge
    router.push({
      pathname: "/media-preview",
      params: {
        roomId: String(roomId),
        mediaUri: video.uri,
        mediaType: "video",
      },
    });
  };
  const requestMicrophonePermission = async () => {
    const status = await AudioModule.requestRecordingPermissionsAsync();

    if (!status.granted) {
      Alert.alert("Permission Required", "Microphone permission is required.");
      return false;
    }

    return true;
  };
  const startRecording = async () => {
    try {
      if (isRecording) return;

      const granted = await requestMicrophonePermission();

      if (!granted) return;

      await audioRecorder.prepareToRecordAsync();

      audioRecorder.record();

      setIsRecording(true);

      console.log("🎤 Recording Started");
    } catch (e) {
      console.log("START RECORDING ERROR =>", e);
    }
  };
  const stopRecording = async () => {
    try {
      if (!isRecording) return;

      await audioRecorder.stop();

      console.log("🎤 Recording Stopped");

      console.log("VOICE URI =>", audioRecorder.uri);
      setRecordedUri(audioRecorder.uri ?? null);
      setIsRecording(false);
    } catch (e) {
      console.log("STOP RECORDING ERROR =>", e);
    }
  };
  const sendVoiceMessage = async () => {
    try {
      if (!recordedUri || !otherUser) return;

      const voiceUrl = await uploadVoice(recordedUri);

      await addDoc(collection(db, "messages"), {
        roomId: String(roomId),
        senderId: myUid,

        type: "voice",
        text: "",

        mediaUrl: voiceUrl,

        thumbnail: "",
        fileName: "",
        fileSize: 0,
        duration: recordingTime,

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

      setRecordedUri(null);
      setRecordingTime(0);
    } catch (e) {
      console.log("VOICE SEND ERROR =>", e);
    }
  };
  const playVoice = async (url: string) => {
    try {
      console.log("PLAY VOICE =>", url);
    } catch (e) {
      console.log("PLAY ERROR =>", e);
    }
  };
  const sendMessage = async () => {
    if (!text.trim() || blocked || !otherUser) return;

    const messageText = text;
    setText("");

    await addDoc(collection(db, "messages"), {
      roomId: String(roomId),
      senderId: myUid,

      type: "text",
      text: messageText,

      mediaUrl: "",
      thumbnail: "",
      fileName: "",
      fileSize: 0,
      duration: 0,

      replyTo: replyTo
        ? {
            id: replyTo.id,
            senderId: replyTo.senderId,
            text: replyTo.text,
          }
        : null,
      reactions: {},

      edited: false,
      deletedFor: [],

      status: "sending",

      sentAt: null,
      deliveredAt: null,
      readAt: null,

      createdAt: serverTimestamp(),
    });
    setReplyTo(null);

    // Send Notification to the other user
    await sendPersonalNotification(
      otherUser.uid,
      `New message from ${otherUser.name}`,
      messageText,
    );
  };

  const handleOptions = async () => {
    if (!myUid || !otherUser) return;

    const q = query(
      collection(db, "blocks"),
      where("blockedBy", "==", myUid),
      where("blockedUser", "==", otherUser.uid),
    );

    const snap = await getDocs(q);
    const alreadyBlocked = !snap.empty;

    if (alreadyBlocked) {
      Alert.alert("Options", "Choose action", [
        {
          text: "Unblock",
          onPress: async () => {
            snap.forEach(async (d) => {
              await deleteDoc(doc(db, "blocks", d.id));
            });

            setBlocked(false);
            Alert.alert("Unblocked ✅");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      Alert.alert("Options", "Choose action", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          onPress: async () => {
            await addDoc(collection(db, "reports"), {
              roomId: String(roomId),
              reportedBy: myUid,
              createdAt: Date.now(),
            });

            Alert.alert("Reported 🚨");
          },
        },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            await addDoc(collection(db, "blocks"), {
              blockedBy: myUid,
              blockedUser: otherUser.uid,
              createdAt: Date.now(),
            });

            setBlocked(true);
            Alert.alert("User Blocked 🚫");
          },
        },
      ]);
    }
  };

  return (
    <IndoreBackground>
      <FadeWrapper>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={30}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.replace("/(tabs)/chat")}>
                <Text style={{ color: "white", fontSize: 18 }}>←</Text>
              </TouchableOpacity>

              {otherUser && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                  onPress={() => router.push(`/user/${otherUser.uid}`)}
                >
                  <Image
                    source={{ uri: otherUser.photos?.[0] }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.headerName}>{otherUser.name}</Text>

                    <Text
                      style={{
                        color: isOnline ? "#4CAF50" : "#BBBBBB",
                        fontSize: 12,
                      }}
                    >
                      {isOnline
                        ? "🟢 Online"
                        : status?.lastSeen
                          ? `Last seen ${new Date(
                              status.lastSeen,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "Offline"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{ marginLeft: "auto" }}
                onPress={handleOptions}
              >
                <Text style={{ color: "white", fontSize: 22 }}>⋮</Text>
              </TouchableOpacity>
            </View>

            {blocked && (
              <Text style={styles.blockedText}>
                You cannot chat with this user 🚫
              </Text>
            )}

            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
              renderItem={({ item }) => {
                const isMe = item.senderId === myUid;

                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onLongPress={() => {
                      Alert.alert("Message", "Choose action", [
                        {
                          text: "↩ Reply",
                          onPress: () => setReplyTo(item),
                        },
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                      ]);
                    }}
                    style={[styles.msg, isMe ? styles.myMsg : styles.otherMsg]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {item.replyTo && (
                        <View
                          style={{
                            borderLeftWidth: 3,
                            borderLeftColor: "#8A2BE2",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            padding: 6,
                            marginBottom: 6,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: "#8A2BE2",
                              fontWeight: "bold",
                              fontSize: 12,
                            }}
                          >
                            {item.replyTo.senderId === myUid
                              ? "You"
                              : otherUser?.name}
                          </Text>

                          <Text
                            numberOfLines={1}
                            style={{
                              color: "#ddd",
                              fontSize: 12,
                            }}
                          >
                            {item.replyTo.text}
                          </Text>
                        </View>
                      )}
                      {item.type === "text" && (
                        <Text style={{ color: "white" }}>{item.text}</Text>
                      )}

                      {item.type === "voice" && (
                        <TouchableOpacity
                          onPress={() => playVoice(item.mediaUrl)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 20,
                              marginRight: 8,
                            }}
                          >
                            ▶️
                          </Text>

                          <Text
                            style={{
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            Voice Message
                          </Text>
                        </TouchableOpacity>
                      )}

                      {isMe && (
                        <Text
                          style={{
                            fontSize: 10,
                            marginLeft: 6,
                            color: item.status === "read" ? "#4fc3f7" : "#ccc",
                          }}
                        >
                          {item.status === "read" ? "✓✓" : "✓"}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
            {replyTo && (
              <View
                style={{
                  backgroundColor: "#222",
                  padding: 10,
                  marginHorizontal: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: "#8A2BE2",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "#8A2BE2",
                    fontWeight: "bold",
                  }}
                >
                  Replying to{" "}
                  {replyTo.senderId === myUid ? "You" : otherUser?.name}
                </Text>

                <Text numberOfLines={1} style={{ color: "#fff", marginTop: 3 }}>
                  {replyTo.text}
                </Text>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 8,
                  }}
                  onPress={() => setReplyTo(null)}
                >
                  <Text style={{ color: "white" }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              {!isRecording && !recordedUri && (
                <>
                  <TouchableOpacity
                    onPress={handleAttachment}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>📎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={openCamera}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>📷</Text>
                  </TouchableOpacity>
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    placeholder={blocked ? "User blocked" : "Type message..."}
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    editable={!blocked}
                  />

                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={sendMessage}
                    disabled={blocked}
                  >
                    <Text style={{ color: "white" }}>Send</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginLeft: 10,
                    }}
                    onPress={startRecording}
                  >
                    <Text style={{ fontSize: 22 }}>🎤</Text>
                  </TouchableOpacity>
                </>
              )}
              {isRecording && (
                <>
                  <TouchableOpacity
                    onPress={handleAttachment}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>📎</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={openCamera}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>📷</Text>
                  </TouchableOpacity>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#333",
                      borderRadius: 10,
                      marginHorizontal: 10,
                      justifyContent: "center",
                      paddingHorizontal: 15,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ff4d4d",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      🔴 Recording...
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={stopRecording}
                  >
                    <Text style={{ color: "white", fontSize: 20 }}>⏹</Text>
                  </TouchableOpacity>
                </>
              )}
              {recordedUri && !isRecording && (
                <>
                  <TouchableOpacity
                    onPress={handleAttachment}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>📎</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={openCamera}
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>📷</Text>
                  </TouchableOpacity>

                  <View
                    style={{
                      flex: 1,
                      backgroundColor: "#333",
                      borderRadius: 10,
                      marginHorizontal: 10,
                      justifyContent: "center",
                      paddingHorizontal: 15,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      🎤 Voice Note Ready
                    </Text>
                  </View>

                  {/* Delete */}
                  <TouchableOpacity
                    onPress={() => {
                      setRecordedUri(null);
                      setRecordingTime(0);
                      setIsRecording(false);
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>🗑</Text>
                  </TouchableOpacity>

                  {/* Send */}
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={sendVoiceMessage}
                  >
                    <Text style={{ color: "white" }}>📤</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </FadeWrapper>
    </IndoreBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginLeft: 10,
  },
  headerName: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  msg: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 12,
    maxWidth: "70%",
  },
  myMsg: {
    backgroundColor: "#6a0dad",
    alignSelf: "flex-end",
  },
  otherMsg: {
    backgroundColor: "#444",
    alignSelf: "flex-start",
  },
  blockedText: {
    color: "red",
    textAlign: "center",
    margin: 10,
  },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  input: {
    flex: 1,
    backgroundColor: "#333",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "purple",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 10,
  },
});
