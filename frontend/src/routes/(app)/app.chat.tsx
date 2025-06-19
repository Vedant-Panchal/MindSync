import { ChatContainer } from "@/features/chatbot/chat-container";
import { ChatInputWithActions } from "@/features/chatbot/chat-input";
import { Markdown } from "@/features/chatbot/markdown";
import { Message, MessageContent } from "@/features/chatbot/message";
import { ResponseStream } from "@/features/chatbot/response-stream";
import { ScrollButton } from "@/features/chatbot/scroll-button";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { api } from "@/lib/api-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Citation, useChatbotStore } from "@/stores/chatStore";
import toast from "react-hot-toast";
import { createSSEStream } from "@/lib/sse-stream";

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
  content: AsyncIterable<string> | string;
  citations?: Citation[];
}

function RouteComponent() {
  const {
    messages,
    setMessages,
    lastMessage,
    setLastMessage,
    loading,
    setLoading,
    citations,
    setCitations,
  } = useChatbotStore();
  const { mutate, isPending } = useMutation({
    mutationFn: async (query: string) => {
      const stream = createSSEStream(
        "http://localhost:8000/api/v1/chat/start/streaming",
        query,
      );
      return stream;
    },
    onSuccess: (stream) => {
      console.log("On Success Stream:", citations);
      const lastMessageObject: IMessage = {
        id: messages.length + 1,
        content: stream, // AsyncIterable<string>
        role: "assistant",
        citations: citations,
      };
      setLastMessage(lastMessageObject);
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
    },
  });

  const { data, isError, error } = useQuery({
    queryKey: ["chatHistory"],
    queryFn: getChatHistory,
  });

  if (isError) {
    toast.error(error.message);
    return <div>Error loading chat history. Please try again.</div>;
  }
  // Ref 1
  useEffect(() => {
    if (data) {
      const updatedData: IMessage[] = data.map((mess: any, index: number) => ({
        id: mess.id || index + 1,
        content: mess.content || "",
        role: mess.role as "user" | "assistant",
        citations: mess.citations || [],
      }));
      console.log("ref 1 live data adding:", updatedData);
      setMessages(updatedData);
      console.log("Updated Messages:", updatedData);
    }
  }, [data, setMessages]);
  // Ref 2
  useEffect(() => {
    if (lastMessage) {
      console.log("ref 1 live data adding:", lastMessage);
      setMessages(lastMessage);
    }
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lastMessage, setMessages]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) {
        setCitations(e.detail);
      }
    };

    window.addEventListener("citations", handler);
    return () => window.removeEventListener("citations", handler);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail) {
        setLoading(false);
      }
    };

    window.addEventListener("startStream", handler);
    return () => window.removeEventListener("startStream", handler);
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-start pt-0">
      <div className="absolute bottom-40 flex w-full translate-x-[-3%] items-center justify-center">
        <ScrollButton containerRef={chatContainerRef} scrollRef={bottomRef} />
      </div>
      <ChatContainer
        className="scrollbar-hide mb-10 h-[80vh] max-h-[80vh] w-[50vw] space-y-4 px-4 py-6"
        ref={chatContainerRef}
        scrollToRef={bottomRef}
        autoScroll={true}
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
              <div className="sm:max-w-[75%]">
                {isAssistant ? (
                  <div className="text-foreground prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs max-w-[85%] rounded-lg p-2 text-sm">
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {message?.citations.map((citation: Citation) => (
                          <a
                            key={citation.journal_id}
                            href={citation.url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-card rounded-lg border p-4 shadow transition hover:shadow-md"
                          >
                            <h4 className="font-medium">{citation.title}</h4>
                            <p className="text-muted-foreground text-sm">
                              {citation.date}
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                    <Markdown>{message.content}</Markdown>
                  </div>
                ) : (
                  <MessageContent className="bg-sidebar-accent prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs text-sidebar-accent-foreground w-full p-2 text-sm">
                    {message.content}
                  </MessageContent>
                )}
              </div>
            </Message>
          );
        })}
        {loading && (
          <div className="h-full">
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
            <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
              <div className="text-foreground prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs rounded-lg p-2">
                {citations.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {citations.map((citation) => (
                      <a
                        key={citation.journal_id}
                        href={citation.url ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-card rounded-lg border p-4 shadow transition hover:shadow-md"
                      >
                        <h4 className="font-medium">{citation.title}</h4>
                        <p className="text-muted-foreground text-sm">
                          {citation.date}
                        </p>
                      </a>
                    ))}
                  </div>
                )}

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
      </ChatContainer>
      <div className="absolute bottom-0 h-1 w-full" ref={bottomRef} />
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(20px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute bottom-10 flex w-full items-center justify-center"
      >
        <ChatInputWithActions mutate={mutate} isPending={isPending} />
      </motion.div>
    </div>
  );
}
