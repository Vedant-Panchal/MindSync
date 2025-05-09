import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/features/chatbot/prompt-input";
import { useChatbotStore } from "@/stores/chatStore";
import { IconMicrophone, IconMicrophoneOff } from "@tabler/icons-react";
import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { api } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import { IMessage } from "@/routes/(app)/app.chat";

export function ChatInputWithActions() {
  const {
    input,
    setInput,
    messages,
    setMessages,
    setLastMessage,
    setLoading,
    loading,
  } = useChatbotStore();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsContinuousListening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { mutate, isPending } = useMutation({
    mutationFn: async (query: string) => {
      const res = await api.post("/api/v1/chat/start", { query });
      return res as any;
    },
    onSuccess: (data) => {
      const fullResponse = data.message.message || data.message;
      const lastMessageObject: IMessage = {
        id: messages.length + 1,
        content: fullResponse,
        role: "assistant",
      };
      setLastMessage(lastMessageObject);
      setLoading(false);
    },
    onError: (error) => {
      console.error("Error fetching response:", error);
      const errorMessage = "Error Generating Response, Please Try Again";
      const lastMessageObject: IMessage = {
        id: messages.length + 1,
        content: errorMessage,
        role: "assistant",
      };
      setLastMessage(lastMessageObject);
      setLoading(false);
    },
  });

  const startListening = () => {
    SpeechRecognition.abortListening();
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-IN",
    });
  };

  const stopListening = () => {
    setInput(transcript);
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      setInput(transcript);
    }, 300);

    return () => clearTimeout(debounce);
  }, [transcript, setInput]);

  // const streamResponse = (fullResponse: string) => {

  //   console.log(fullResponse)
  //   if (isStreaming) return;

  //   setLoading(true); // Set loading to true during streaming
  //   console.log("Stream Started");
  //   let charIndex = 0;
  //   streamContentRef.current = "";

  //   streamIntervalRef.current = setInterval(() => {
  //     if (charIndex < fullResponse.length) {
  //       streamContentRef.current += fullResponse[charIndex];
  //       setStreamingContent(streamContentRef.current);
  //       charIndex++;
  //     } else {
  //       clearInterval(streamIntervalRef.current!);
  //       console.log("Stream Ended");
  //       setLoading(false);
  //       setStreamingContent("");
  //     }
  //   }, 30);
  // };

  // useEffect(() => {
  //   return () => {
  //     if (streamIntervalRef.current) {
  //       clearInterval(streamIntervalRef.current);
  //     }
  //   };
  // }, []);

  const handleSubmit = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: "user" as const,
      content: input,
      date: new Date().toISOString(),
    };
    setMessages(userMessage);
    setInput("");
    setLoading(true);
    mutate(input);
    setLastMessage(null);
  };

  return (
    <PromptInput
      value={input}
      onValueChange={setInput}
      isLoading={isPending}
      onSubmit={handleSubmit}
      className="w-full max-w-(--breakpoint-md)"
    >
      <PromptInputTextarea
        placeholder="Ask me anything..."
        disabled={loading}
      />
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
          tooltip={isPending ? "Stop generation" : "Send message"}
        >
          <Button
            variant="default"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {isPending ? (
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
