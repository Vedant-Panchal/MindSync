import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { Content } from "@tiptap/react";
interface EditorState {
  content: Content;
  title: string;
  setState: (state: Partial<Omit<EditorState, "setState">>) => void;
  reset: () => void;
}

const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set) => ({
        content: "",
        title: "",
        setState: (state) => set((prev) => ({ ...prev, ...state })),
        reset: () => set({ content: "", title: "" }),
      }),
      {
        name: "editor-storage", // unique name for localStorage
      },
    ),
    {
      name: "EditorStore", // name for devtools
      enabled: import.meta.env.MODE === "development",
      store: "editorStore",
    },
  ),
);

export default useEditorStore;
