import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

export type PlanStatus = "open" | "matched";

export type PlanType = {
  id?: string;
  title: string;
  time: string;
  brief: string;

  visibleTo?: "male" | "female" | "everyone";

  createdBy: string;
  createdByName?: string;
  createdByPhoto?: string;
  requests: {
    uid: string;
    name: string;
    photo: string;
  }[];
  accepted: string;
  status: PlanStatus;
  createdAt: number;
  latitude?: number;
longitude?: number;
};

const plansCollection = collection(db, "plans");

// 🔥 CREATE PLAN
export const addPlan = async (plan: Omit<PlanType, "id">) => {
  await addDoc(plansCollection, plan);
};

// 🔥 REALTIME LISTENER
export const listenPlans = (callback: (plans: PlanType[]) => void) => {
  return onSnapshot(plansCollection, (snapshot) => {
    const plans: PlanType[] = [];

    snapshot.forEach((docItem) => {
      const data = docItem.data() as PlanType;

      plans.push({
        id: docItem.id,
        title: data.title,
        time: data.time,
        brief: data.brief,
        createdBy: data.createdBy,
        createdByName: data.createdByName,
        requests: data.requests || [],
        accepted: data.accepted || "",
        status: data.status || "open",
        createdAt: data.createdAt,
        visibleTo: data.visibleTo || "male",
      });
    });

    callback(plans);
  });
};

// 🔥 UPDATE PLAN
export const updatePlan = async (id: string, data: Partial<PlanType>) => {
  const planRef = doc(db, "plans", id);
  await updateDoc(planRef, data);
};

// 🔥 DELETE PLAN
export const deletePlan = async (id: string) => {
  const planRef = doc(db, "plans", id);
  await deleteDoc(planRef);
};
