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
  email?: string;
  name?: string;
  age?: number;
  phone?: string;
  gender?: string;
  bio?: string;
  photos?: string[];
  video?: string | null;

  latitude?: number;
  longitude?: number;

  warnings?: number;
  banned?: boolean;

  isProfileComplete?: boolean;
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
      setLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            isProfileComplete: false,
          });
          setLoading(false);
          return;
        }

        const data = snap.data();

        if (data.banned) {
          alert("Account blocked 🚫");
          await signOut(auth);
          return;
        }

        const isComplete = !!(data.name && Array.isArray(data.photos) && data.photos.length >= 1);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || data.email || "",
          ...data,
          isProfileComplete: isComplete,
        } as UserProfileState);

      } catch (e) {
        console.log("USER FETCH ERROR:", e);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

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

      const updatedData = {
        uid,
        email: auth.currentUser.email || "",
        ...profile,
        latitude,
        longitude,
        warnings: 0,
        banned: false,
      };

      await setDoc(doc(db, "users", uid), updatedData, { merge: true });

      setUser((prev) => {
        const merged = { ...(prev || {}), ...updatedData } as UserProfileState;
        const complete = 
          !!merged.name && 
          Array.isArray(merged.photos) && 
          merged.photos.length >= 1;

        return {
          ...merged,
          isProfileComplete: complete,
        };
      });

    } catch (error) {
      console.log("SAVE PROFILE ERROR:", error);
      throw error;
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