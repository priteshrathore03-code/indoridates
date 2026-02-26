import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export type PlanType = {
  id?: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
};

const plansCollection = collection(db, "plans");

export const addPlan = async (plan: PlanType) => {
  await addDoc(plansCollection, plan);
};

export const getAllPlans = async (): Promise<PlanType[]> => {
  const snapshot = await getDocs(plansCollection);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as PlanType),
  }));
};
