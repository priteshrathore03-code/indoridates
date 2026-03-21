import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { auth, db } from "../firebaseConfig";

export default function useAutoLocation() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("❌ No user logged in");
        return;
      }

      try {
        // 1️⃣ Permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("❌ Location permission denied");
          return;
        }

        // 2️⃣ Get location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        console.log("📍 LOCATION:", coords);

        // 3️⃣ Save local
        await AsyncStorage.setItem("user_location", JSON.stringify(coords));

        // 4️⃣ Firestore me force update
        await setDoc(
          doc(db, "profiles", user.uid),
          {
            location: coords,
            updatedAt: new Date(),
          },
          { merge: true }, // 👈 IMPORTANT (overwrite nahi karega pura doc)
        );

        console.log("✅ AUTO location updated (login)");
      } catch (error) {
        console.log("❌ Location error:", error);
      }
    });

    return () => unsubscribe();
  }, []);
}
