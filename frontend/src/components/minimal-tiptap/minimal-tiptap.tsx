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
import { Button } from "@/components/ui/button";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Square } from "lucide-react";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";

export interface MinimalTiptapProps
  extends Omit<UseMinimalTiptapEditorProps, "onUpdate"> {
  value?: Content;
  onChange?: (value: Content) => void;
  className?: string;
  editorContentClassName?: string;
  // editor : Editor | null
}

export function Toolbar({ editor }: { editor: Editor }) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsContinuousListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const startListening = () => {
    SpeechRecognition.abortListening();
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-IN",
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  React.useEffect(() => {
    if (listening && transcript) {
      const debounce = setTimeout(() => {
        editor.chain().insertContent(transcript).run();
      }, 300);

      return () => clearTimeout(debounce);
    }
  }, [transcript, editor, listening]);
  return (
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
        <Separator
          orientation="vertical"
          className="data-[orientation=vertical]:h-7 data-[orientation=vertical]:w-[1px] data-[orientation=vertical]:rounded-full"
        />
        {/* <Button
          variant="default"
          size="icon"
          className={`h-8 w-8 rounded-full ${listening ? "bg-red-500" : ""}`}
          disabled={!browserSupportsContinuousListening}
          onClick={listening ? stopListening : startListening}
        >
          {listening ? (
            <Square className="size-5 fill-current" />
          ) : (
            <>
              <IconMicrophoneOff
                className={`size-5 ${browserSupportsSpeechRecognition && "hidden"}`}
              />
              <IconMicrophone
                className={`size-5 ${!browserSupportsSpeechRecognition && "hidden"}`}
              />
            </>
          )}
        </Button> */}
      </div>
    </div>
  );
}

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
