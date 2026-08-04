import {
    onDisconnect,
    onValue,
    ref,
    serverTimestamp,
    set,
} from "firebase/database";
import { AppState, AppStateStatus } from "react-native";
import { rtdb } from "../firebaseConfig";

let appStateSubscription: { remove: () => void } | null = null;

function getPresence(state: "online" | "offline") {
  return {
    state,
    device: "android",
    appVersion: 3,
    updatedAt: serverTimestamp(),
  };
}

export async function startPresence(uid: string) {
  
  const statusRef = ref(rtdb, `status/${uid}`);
  const connectedRef = ref(rtdb, ".info/connected");

  if (!appStateSubscription) {
    appStateSubscription = AppState.addEventListener(
      "change",
      async (state: AppStateStatus) => {
        if (state === "active") {
          await set(statusRef, {
            state: "online",
            device: "android",
            appVersion: 3,
            updatedAt: serverTimestamp(),
          });
        } else {
          await set(statusRef, {
            state: "offline",
            device: "android",
            appVersion: 3,
            lastSeen: serverTimestamp(),
          });
        }
      },
    );
  }

  onValue(connectedRef, async (snap) => {
    if (!snap.val()) return;

    await onDisconnect(statusRef).set({
      state: "offline",
      device: "android",
      appVersion: 3,
      lastSeen: serverTimestamp(),
    });

    await set(statusRef, {
      state: "online",
      device: "android",
      appVersion: 3,
      updatedAt: serverTimestamp(),
    });
  });
}

export async function stopPresence(uid: string) {
  
  const statusRef = ref(rtdb, `status/${uid}`);

  await set(statusRef, {
    state: "offline",
    device: "android",
    appVersion: 3,
    lastSeen: serverTimestamp(),
  });

  appStateSubscription?.remove();
  appStateSubscription = null;
}
