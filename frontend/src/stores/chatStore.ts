import { create } from "zustand";

export type Citation = {
  journal_id: string;
  title: string;
  date: string;
  url?: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  content: any;
  date?: string;
  citations?: Citation[] | [];
};

type ChatbotState = {
  messages: Message[];
  input: string;
  lastMessage: Message | null;
  loading: boolean;
  citations: Citation[];
  setCitations: (c: Citation[]) => void;
  setLoading: (value: boolean) => void;
  setLastMessage: (value: Message | null) => void;
  setInput: (value: string) => void;
  setMessages: (messagesOrMessage: Message | Message[]) => void;
  clearMessages: () => void;
};

export const useChatbotStore = create<ChatbotState>((set) => ({
  messages: [],
  input: "",
  lastMessage: null, // Initialize as null to avoid rendering empty messages
  loading: false,
  citations: [],
  setCitations: (c) => set(() => ({ citations: c })),
  setLoading: (value) => set(() => ({ loading: value })),
  setLastMessage: (message) => set(() => ({ lastMessage: message })),
  setInput: (value) => set(() => ({ input: value })),
  setMessages: (messagesOrMessage) =>
    set((state) => ({
      messages: Array.isArray(messagesOrMessage)
        ? [...messagesOrMessage]
        : [...state.messages, messagesOrMessage],
    })),
  clearMessages: () => set(() => ({ messages: [] })),
}));
