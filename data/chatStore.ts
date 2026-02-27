import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const createChatRoom = async (uid1: string, uid2: string) => {
  try {
    const docRef = await addDoc(collection(db, "chatRooms"), {
      users: [uid1, uid2],
      createdAt: Date.now(),
    });

    return docRef.id;
  } catch (error) {
    console.log("CHAT CREATE ERROR:", error);
    throw error;
  }
};
