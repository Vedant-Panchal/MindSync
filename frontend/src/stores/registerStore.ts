import { create } from "zustand";

type RegisterState = {
    email: string;
    username: string;
    password: string;
    otp: string;
    setField: (field: string, value: string) => void;
  };
  
  export const useRegisterStore = create<RegisterState>((set) => ({
    email: "",
    username: "",
    password: "",
    otp: "",
    setField: (field, value) =>
      set((state) => ({
        ...state,
        [field]: value,
      })),
  }));
  