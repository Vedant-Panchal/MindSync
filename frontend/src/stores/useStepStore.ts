import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StepState {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const useStepStore = create<StepState>()(
  persist(
    (set) => ({
      currentStep: 1,
      setCurrentStep: (step) => set({ currentStep: step }),
    }),
    {
      name: "current-step",
      partialize: (state) => ({ currentStep: state.currentStep }),
    },
  ),
);
