import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/features/chatbot/prompt-input";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";
import { ArrowUp, Square } from "lucide-react";
import { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export function ChatInputWithActions() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsContinuousListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const startListening = () => {
    // console.log("Started listening");
    SpeechRecognition.abortListening();
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-IN",
    });
  };
  const stopListening = () => {
    // console.log("Stopped listening");
    setInput(transcript);
    SpeechRecognition.stopListening();
  };
  useEffect(() => {
    const debounce = setTimeout(() => {
      setInput(transcript);
    }, 300);

    return () => clearTimeout(debounce);
  }, [transcript]);

  const handleSubmit = () => {
    if (input.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setInput("");
      }, 2000);
    }
  };

  return (
    <PromptInput
      value={input}
      onValueChange={setInput}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      className="w-full max-w-(--breakpoint-md)"
    >
      <PromptInputTextarea placeholder="Ask me anything..." />

      <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
        <PromptInputAction tooltip="Voice input">
          <Button
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
          </Button>
        </PromptInputAction>

        <PromptInputAction
          tooltip={isLoading ? "Stop generation" : "Send message"}
        >
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSubmit}
          >
            {isLoading ? (
              <Square className="size-5 fill-current" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </PromptInputAction>
      </PromptInputActions>
    </PromptInput>
  );
}
