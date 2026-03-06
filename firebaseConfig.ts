import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_0A5aA39MrhBe45NRZT65C8l_-Dn5Ga0",
  authDomain: "indoridates.firebaseapp.com",
  projectId: "indoridates",
  storageBucket: "indoridates.firebasestorage.app",
  messagingSenderId: "860588660053",
  appId: "1:860588660053:web:41e1b8bf2567681e8c4bdc",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
