import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import * as Location from "expo-location"; // 🔥 IMPORTANT

import { auth, db } from "../firebaseConfig";

export type UserProfileState = {
  uid: string;
  name?: string;
  age?: number;
  phone?: string;
  gender?: string;
  bio?: string;
  photos?: string[];
  video?: string | null;

  latitude?: number;
  longitude?: number;
};

type UserContextType = {
  user: UserProfileState | null;
  loading: boolean;
  saveProfile: (profile: Partial<UserProfileState>) => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfileState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));

        if (snap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            ...(snap.data() as any),
          });
        } else {
          setUser({ uid: firebaseUser.uid });
        }
      } catch (e) {
        console.log("USER FETCH ERROR:", e);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // 🔥 SAVE PROFILE + REAL LOCATION
  const saveProfile = async (profile: Partial<UserProfileState>) => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    try {
      // 🔥 PERMISSION
      const { status } = await Location.requestForegroundPermissionsAsync();

      let latitude = profile.latitude;
      let longitude = profile.longitude;

      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;

        console.log("LOCATION SAVED:", latitude, longitude); // 🔥 debug
      }

      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          ...profile,
          latitude,
          longitude,
        },
        { merge: true },
      );

      setUser((prev) => ({
        ...(prev || { uid }),
        ...profile,
        latitude,
        longitude,
      }));
    } catch (error) {
      console.log("SAVE PROFILE ERROR:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, saveProfile, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserProfile must be used inside provider");
  return context;
};
