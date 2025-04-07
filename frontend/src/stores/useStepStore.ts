import { create } from 'zustand';

interface StepState {
    currentStep: number;
    setCurrentStep: (step: number) => void;
}

export const useStepStore = create<StepState>((set) => ({
    currentStep: 1,
    setCurrentStep: (step) => set({ currentStep: step }),
}));
