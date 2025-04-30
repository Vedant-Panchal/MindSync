import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  username: string;
  exp: number;
  lastSubmitted: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      enabled: import.meta.env.MODE === "development",
      anonymousActionType: "authStore",
      name: "authStore",
    },
  ),
);
