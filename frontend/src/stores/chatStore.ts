import { create } from "zustand";

type Message = {
  role: "user" | "assistant";
  content: string;
  date?: string;
};

interface ChatbotState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatbotState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }), // Initialize messages

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetChat: () =>
    set({
      messages: [],
      isLoading: false,
      error: null,
    }),
}));
