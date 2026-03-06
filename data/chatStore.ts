import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// deterministic ID
const generateRoomId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join("_");
};

export const createChatRoom = async (uid1: string, uid2: string) => {
  try {
    console.log("createChatRoom CALLED");
    console.log("UID1:", uid1);
    console.log("UID2:", uid2);

    const roomId = generateRoomId(uid1, uid2);
    const roomRef = doc(db, "chatRooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      await setDoc(roomRef, {
        users: [uid1, uid2],
        type: "private",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      });
    } else {
      await setDoc(roomRef, { updatedAt: serverTimestamp() }, { merge: true });
    }

    return roomId;
  } catch (error) {
    console.log("CHAT CREATE ERROR:", error);
    throw error;
  }
};
