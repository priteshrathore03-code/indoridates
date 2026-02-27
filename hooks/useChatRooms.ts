import {
    collection,
    onSnapshot,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { ChatRoom } from "../types/chat";

export const useChatRooms = (currentUserId: string) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const roomsRef = collection(db, "chatRooms");
    const q = query(
      roomsRef,
      where("users", "array-contains", currentUserId),
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList: ChatRoom[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatRoom[];

      setRooms(roomList);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  return { rooms };
};
