import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Generate permanent room ID
export const generateRoomId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join("_");
};

// Create or get existing room
export const createOrGetRoom = async (
  currentUserId: string,
  otherUserId: string,
) => {
  const roomId = generateRoomId(currentUserId, otherUserId);

  const roomRef = doc(db, "chatRooms", roomId);
  const roomSnap = await getDoc(roomRef);

  if (!roomSnap.exists()) {
    await setDoc(roomRef, {
      users: [currentUserId, otherUserId],
      type: "private",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null,
    });
  }

  return roomId;
};

// Send message
export const sendMessage = async (
  roomId: string,
  senderId: string,
  text: string,
) => {
  const messagesRef = collection(db, "chatRooms", roomId, "messages");

  const newMessage = {
    senderId,
    text,
    type: "text",
    createdAt: serverTimestamp(),
    seenBy: [senderId],
  };

  // Add message to subcollection
  const messageDoc = await addDoc(messagesRef, newMessage);

  // Update lastMessage in room
  const roomRef = doc(db, "chatRooms", roomId);

  await updateDoc(roomRef, {
    lastMessage: {
      text,
      senderId,
      type: "text",
      createdAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });

  return messageDoc.id;
};

// Mark messages as seen
export const markMessagesAsSeen = async (
  roomId: string,
  currentUserId: string,
) => {
  const messagesRef = collection(db, "chatRooms", roomId, "messages");
  const snapshot = await getDocs(messagesRef);

  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();

    // Agar message dusre user ne bheja hai
    // Aur current user already seenBy me nahi hai
    if (
      data.senderId !== currentUserId &&
      !data.seenBy?.includes(currentUserId)
    ) {
      batch.update(docSnap.ref, {
        seenBy: [...data.seenBy, currentUserId],
      });
    }
  });

  await batch.commit();
};
