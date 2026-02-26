import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
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
  createdByName?: string; // 🔥 optional
  requests: string[];
  accepted: string;
  status: PlanStatus;
  createdAt: number;
};

const plansCollection = collection(db, "plans");

export const addPlan = async (plan: Omit<PlanType, "id">) => {
  await addDoc(plansCollection, plan);
};

export const getAllPlans = async (): Promise<PlanType[]> => {
  const snapshot = await getDocs(plansCollection);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as PlanType),
  }));
};

export const updatePlan = async (id: string, data: Partial<PlanType>) => {
  const planRef = doc(db, "plans", id);
  await updateDoc(planRef, data);
};

export const deletePlan = async (id: string) => {
  const planRef = doc(db, "plans", id);
  await deleteDoc(planRef);
};
