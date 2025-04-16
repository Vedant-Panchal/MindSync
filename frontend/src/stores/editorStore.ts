import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { Content } from "@tiptap/react";
import { Tag } from "emblor";

interface EditorState {
  richText: Content; // Stores HTML content
  plainText: string; // Stores plain text content
  title: string;
  tags: Tag[];
  activeIndex: number | null;
  setState: (state: Partial<Omit<EditorState, "setState">>) => void;
  setActiveIndex: (
    index: number | null | ((prev: number | null) => number | null),
  ) => void;
  setTags: (tags: Tag[] | ((prev: Tag[]) => Tag[])) => void;
  reset: () => void;
}

const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set) => ({
        richText: "",
        plainText: "",
        title: "",
        tags: [],
        activeIndex: 0,
        setState: (state) => set((prev) => ({ ...prev, ...state })),
        setActiveIndex: (index) =>
          set((state) => ({
            activeIndex:
              typeof index === "function" ? index(state.activeIndex) : index,
          })),
        setTags: (tags) =>
          set((state) => ({
            tags: typeof tags === "function" ? tags(state.tags) : tags,
          })),
        reset: () =>
          set({
            richText: "",
            plainText: "",
            title: "",
            tags: [],
            activeIndex: 0,
          }),
      }),
      {
        name: "editor-storage",
      },
    ),
    {
      name: "EditorStore",
      enabled: import.meta.env.MODE === "development",
      store: "editorStore",
    },
  ),
);

export default useEditorStore;
