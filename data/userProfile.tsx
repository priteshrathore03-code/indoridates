import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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

  // 🔥 Auth listener
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
            ...(snap.data() as Omit<UserProfileState, "uid">),
          });
        } else {
          // New user without profile yet
          setUser({
            uid: firebaseUser.uid,
          });
        }
      } catch (error) {
        console.log("USER FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // 🔥 SIMPLE & SAFE saveProfile
  const saveProfile = async (profile: Partial<UserProfileState>) => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    try {
      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          ...profile,
        },
        { merge: true },
      );

      setUser((prev) => ({
        ...(prev || { uid }),
        ...profile,
      }));
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
    <UserContext.Provider
      value={{
        user,
        loading,
        saveProfile,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserProfile must be used inside UserProfileProvider");
  }

  return context;
};
