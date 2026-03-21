import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const usersRef = collection(db, "profiles");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersList: any[] = [];

      snapshot.forEach((doc) => {
        usersList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log("🔥 LIVE USERS:", usersList.length);

      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  return { users };
};
