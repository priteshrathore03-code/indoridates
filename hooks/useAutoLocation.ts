import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect } from "react";
import { Platform } from "react-native";
import { auth, db } from "../firebaseConfig";

export default function useAutoLocation() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("❌ No user logged in");
        return;
      }

      try {
        let coords: { latitude: number; longitude: number };

        if (Platform.OS === "web") {
          // Web: Use browser's geolocation API
          coords = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Geolocation not supported"));
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => {
                console.log("❌ Web geolocation permission denied:", error.message);
                reject(error);
              }
            );
          });
        } else {
          // Mobile: Use expo-location
          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {
            console.log("❌ Location permission denied");
            return;
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }

        console.log("📍 LOCATION:", coords);

        // Save local
        await AsyncStorage.setItem("user_location", JSON.stringify(coords));

        // Update Firestore
        await setDoc(
          doc(db, "profiles", user.uid),
          {
            location: coords,
            updatedAt: new Date(),
          },
          { merge: true }
        );

        console.log("✅ AUTO location updated (login)");
      } catch (error) {
        console.log("❌ Location error:", error);
      }
    });

    return () => unsubscribe();
  }, []);
}
