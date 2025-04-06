import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  exp: number;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));