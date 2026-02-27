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
  createdBy: string;
  createdByName?: string;
  requests: string[];
  accepted: string;
  status: PlanStatus;
  createdAt: number;
};

const plansCollection = collection(db, "plans");

export const addPlan = async (plan: Omit<PlanType, "id">) => {
  await addDoc(plansCollection, plan);
};

export const listenPlans = (callback: (plans: PlanType[]) => void) => {
  return onSnapshot(plansCollection, (snapshot) => {
    const plans = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...(docItem.data() as PlanType),
    }));

    callback(plans);
  });
};

export const updatePlan = async (id: string, data: Partial<PlanType>) => {
  const planRef = doc(db, "plans", id);
  await updateDoc(planRef, data);
};

export const deletePlan = async (id: string) => {
  const planRef = doc(db, "plans", id);
  await deleteDoc(planRef);
};
