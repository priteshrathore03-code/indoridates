import { create } from "zustand";

type Plan = {
  id: string;
  title: string;
  description: string;
  createdBy: string;
};

type PlanState = {
  plans: Plan[];
  requests: { [planId: string]: string[] };
  addPlan: (plan: Plan) => void;
  sendRequest: (planId: string, boyName: string) => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  plans: [],
  requests: {},

  addPlan: (plan) =>
    set((state) => ({
      plans: [...state.plans, plan],
    })),

  sendRequest: (planId, boyName) =>
    set((state) => ({
      requests: {
        ...state.requests,
        [planId]: [...(state.requests[planId] || []), boyName],
      },
    })),
}));
