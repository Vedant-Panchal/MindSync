import * as React from "react";
import type { Content, Editor } from "@tiptap/react";
import type { UseMinimalTiptapEditorProps } from "./hooks/use-minimal-tiptap";
import { EditorContent } from "@tiptap/react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SectionOne } from "./components/section/one";
import { SectionTwo } from "./components/section/two";
import { SectionThree } from "./components/section/three";
import { useMinimalTiptapEditor } from "./hooks/use-minimal-tiptap";
import { MeasuredContainer } from "./components/measured-container";

export interface MinimalTiptapProps
  extends Omit<UseMinimalTiptapEditorProps, "onUpdate"> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
  // editor : Editor | null
}

const Toolbar = ({ editor }: { editor: Editor }) => (
  <div className="border-border shrink-0 overflow-x-auto border-b p-2">
    <div className="flex w-max items-center gap-1">
      <SectionOne editor={editor} activeLevels={[1, 2, 3]} />

      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-7 data-[orientation=vertical]:w-[1px] data-[orientation=vertical]:rounded-full"
      />

      <SectionTwo
        editor={editor}
        activeActions={[
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "orderedList",
          "bulletList",
        ]}
        mainActionCount={6}
      />

      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-7 data-[orientation=vertical]:w-[1px] data-[orientation=vertical]:rounded-full"
      />

      <SectionThree editor={editor} />
    </div>
  </div>
);

export const MinimalTiptapEditor = React.forwardRef<
  HTMLDivElement,
  MinimalTiptapProps
>(({ value, onChange, className, editorContentClassName, ...props }, ref) => {
  const editor = useMinimalTiptapEditor({
    value,
    onUpdate: onChange,
    ...props,
  });

  if (!editor) {
    return null;
  }

  return (
    <MeasuredContainer
      as="div"
      name="editor"
      ref={ref}
      className={cn(
        "border-input focus-within:border-primary/70 flex h-auto w-full flex-col rounded-md border shadow-sm transition-all",
        className,
      )}
    >
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className={cn("minimal-tiptap-editor", editorContentClassName)}
      />
    </MeasuredContainer>
  );
});

MinimalTiptapEditor.displayName = "MinimalTiptapEditor";

export default MinimalTiptapEditor;
