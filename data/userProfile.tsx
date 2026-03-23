import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import * as Location from "expo-location";

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

  // 🔥 NEW
  warnings?: number;
  banned?: boolean;
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
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data() as any;

          // 🔥 अगर fields missing है → add कर दे
          if (data.warnings === undefined || data.banned === undefined) {
            await setDoc(
              userRef,
              {
                warnings: data.warnings ?? 0,
                banned: data.banned ?? false,
              },
              { merge: true },
            );
          }

          // 🚫 BAN CHECK
          if (data.banned) {
            alert("Account blocked 🚫");
            await signOut(auth);
            return;
          }

          setUser({
            uid: firebaseUser.uid,
            ...data,
          });
        } else {
          // 🔥 NEW USER → create with defaults
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            warnings: 0,
            banned: false,
          });

          setUser({
            uid: firebaseUser.uid,
            warnings: 0,
            banned: false,
          });
        }
      } catch (e) {
        console.log("USER FETCH ERROR:", e);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // 🔥 SAVE PROFILE + LOCATION
  const saveProfile = async (profile: Partial<UserProfileState>) => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      let latitude = profile.latitude;
      let longitude = profile.longitude;

      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }

      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          ...profile,
          latitude,
          longitude,

          // 🔥 ensure fields always exist
          warnings: 0,
          banned: false,
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
