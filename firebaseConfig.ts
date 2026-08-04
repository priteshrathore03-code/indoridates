import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_0A5aA39MrhBe45NRZT65C8l_-Dn5Ga0",
  authDomain: "indoridates.firebaseapp.com",
  projectId: "indoridates",
  storageBucket: "indoridates.firebasestorage.app",
  messagingSenderId: "860588660053",
  appId: "1:860588660053:web:41e1b8bf2567681e8c4bdc",
  databaseURL:
    "https://indoridates-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);

// TypeScript Fix: Runtime par module bypass karke native persistence use karna
const { getReactNativePersistence } = require("firebase/auth");

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

export default app;
