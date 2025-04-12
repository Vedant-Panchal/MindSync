import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/features/chatbot/prompt-input";
import { IconMicrophone } from "@tabler/icons-react";
import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
    finalTranscript,
    interimTranscript,
    browserSupportsContinuousListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    console.log("Live Transcript:", interimTranscript);
  }, [interimTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const handleSubmit = () => {
    if (input.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setInput("");
      }, 2000);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({
        continuous: true,
        interimResults: true,
      });
    }
  };

  return (
    <PromptInput
      value={input || transcript}
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
            onClick={toggleListening}
          >
            {listening ? (
              <Square className="size-5 fill-current" />
            ) : (
              <IconMicrophone className="size-5" />
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
