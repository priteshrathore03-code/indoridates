import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// 🔥 Deterministic Room ID generator
const generateRoomId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join("_");
};

export const createChatRoom = async (uid1: string, uid2: string) => {
  try {
    const roomId = generateRoomId(uid1, uid2);
    const roomRef = doc(db, "chatRooms", roomId);
    const roomSnap = await getDoc(roomRef);

    // Agar already exist karta hai to naya mat banao
    if (!roomSnap.exists()) {
      await setDoc(roomRef, {
        users: [uid1, uid2],
        type: "private",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      });
    }

    return roomId;
  } catch (error) {
    console.log("CHAT CREATE ERROR:", error);
    throw error;
  }
};
