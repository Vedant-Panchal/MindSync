import { ChatContainer } from "@/features/chatbot/chat-container";
import { ChatInputWithActions } from "@/features/chatbot/chat-input";
import { Markdown } from "@/features/chatbot/markdown";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/features/chatbot/message";
import { ResponseStream } from "@/features/chatbot/response-stream";
import { ScrollButton } from "@/features/chatbot/scroll-button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { api } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { useChatbotStore } from "@/stores/chatStore";
import toast from "react-hot-toast";
import { Loader } from "@/features/chatbot/loader";

export const Route = createFileRoute("/(app)/app/chat")({
  component: RouteComponent,
});

async function getChatHistory() {
  const res = await api.get("/api/v1/chat/history");
  return res as any;
}

export interface IMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

function RouteComponent() {
  const { messages, setMessages, lastMessage, loading, setLastMessage } =
    useChatbotStore();

  const { data, isError, error } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: getChatHistory,
  });

  if (isError) {
    toast.error(error.message);
    return <div>Error loading chat history. Please try again.</div>;
  }

  useEffect(() => {
    if (data) {
      const updatedData: IMessage[] = data.map((mess: any, index: number) => ({
        id: mess.id || index + 1,
        content: mess.content || "",
        role: mess.role as "user" | "assistant",
      }));
      setMessages(updatedData);
      console.log("Updated Messages:", updatedData);
    }
  }, [data, setMessages]);

  useEffect(() => {
    if (lastMessage) {
      setMessages(lastMessage);
    }
  }, [lastMessage, setMessages]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-hidden">
      <div className="absolute bottom-40 flex w-full translate-x-[-3%] items-center justify-center">
        <ScrollButton containerRef={chatContainerRef} scrollRef={bottomRef} />
      </div>
      <ChatContainer
        className="scrollbar-hide h-full flex-1 space-y-4 p-4"
        ref={chatContainerRef}
      >
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";
          if (lastMessage && lastMessage.id == message.id) return;
          return (
            <Message
              key={message.id}
              className={
                message.role === "user" ? "justify-end" : "justify-start"
              }
            >
              {isAssistant && (
                <MessageAvatar
                  src="/avatars/ai.png"
                  alt="AI Assistant"
                  fallback="AI"
                />
              )}
              <div className="max-w-[85%] sm:max-w-[75%]">
                {isAssistant ? (
                  <div className="bg-secondary text-foreground prose rounded-lg p-2">
                    <Markdown>{message.content}</Markdown>
                  </div>
                ) : (
                  <MessageContent className="bg-primary text-primary-foreground p-2">
                    {message.content}
                  </MessageContent>
                )}
              </div>
            </Message>
          );
        })}
        {loading && (
          <div className="ml-10 h-full">
            {/* @ts-ignore */}
            <l-mirage size="60" speed="2.5" color="#3981f6" />
          </div>
        )}
        {lastMessage && lastMessage.content && (
          <Message
            key={lastMessage.id}
            className={
              lastMessage.role === "user" ? "justify-end" : "justify-start"
            }
          >
            {lastMessage.role === "assistant" && (
              <MessageAvatar
                src="/avatars/ai.png"
                alt="AI Assistant"
                fallback="AI"
              />
            )}
            <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
              <div className="text-foreground prose rounded-lg p-2">
                <ResponseStream
                  textStream={lastMessage.content}
                  mode="fade"
                  className="text-sm"
                  fadeDuration={800}
                  speed={100}
                />
              </div>
            </div>
          </Message>
        )}
        <div className="mt-28" ref={bottomRef} />
      </ChatContainer>
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(20px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute bottom-10 flex w-full items-center justify-center"
      >
        <ChatInputWithActions />
      </motion.div>
    </div>
  );
}
