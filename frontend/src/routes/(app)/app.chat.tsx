import { Button } from "@/components/ui/button";
import { ChatContainer } from "@/features/chatbot/chat-container";
import { ChatInputWithActions } from "@/features/chatbot/chat-input";
import { Markdown } from "@/features/chatbot/markdown";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from "@/features/chatbot/message";
import { ResponseStream } from "@/features/chatbot/response-stream";
import { ScrollButton } from "@/features/chatbot/scroll-button";
import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
export const Route = createFileRoute("/(app)/app/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "user",
      content: "Hello! Can you help me with a coding question?",
    },
    {
      id: 2,
      role: "assistant",
      content:
        "Of course! I'd be happy to help with your coding question. What would you like to know?",
    },
    {
      id: 3,
      role: "user",
      content: "How do I create a responsive layout with CSS Grid?",
    },
    {
      id: 4,
      role: "assistant",
      content:
        "Creating a responsive layout with CSS Grid is straightforward. Here's a basic example:\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}\n```\n\nThis creates a grid where:\n- Columns automatically fit as many as possible\n- Each column is at least 250px wide\n- Columns expand to fill available space\n- There's a 1rem gap between items\n\nWould you like me to explain more about how this works?",
    },
    {
      id: 5,
      role: "user",
      content:
        "Creating a responsive layout with CSS Grid is straightforward. Here's a basic example:\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}\n```\n\nThis creates a grid where:\n- Columns automatically fit as many as possible\n- Each column is at least 250px wide\n- Columns expand to fill available space\n- There's a 1rem gap between items\n\nWould you like me to explain more about how this works?",
    },
  ]);

  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamContentRef = useRef("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const streamResponse = () => {
    if (isStreaming) return;

    setIsStreaming(true);
    const fullResponse =
      "Yes, I'd be happy to explain more about CSS Grid! The `grid-template-columns` property defines the columns in your grid. The `repeat()` function is a shorthand that repeats a pattern. `auto-fit` will fit as many columns as possible in the available space. The `minmax()` function sets a minimum and maximum size for each column. This creates a responsive layout that automatically adjusts based on the available space without requiring media queries.";

    const newMessageId = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      {
        id: newMessageId,
        role: "assistant",
        content: "",
      },
    ]);

    let charIndex = 0;
    streamContentRef.current = "";

    streamIntervalRef.current = setInterval(() => {
      if (charIndex < fullResponse.length) {
        streamContentRef.current += fullResponse[charIndex];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessageId
              ? { ...msg, content: streamContentRef.current }
              : msg,
          ),
        );
        charIndex++;
      } else {
        clearInterval(streamIntervalRef.current!);
        setIsStreaming(false);
      }
    }, 30);
  };

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text =
      "I can help with a variety of tasks:\n\n- Answering questions\n- Providing information\n- Assisting with coding\n- Generating creative content\n\nWhat would you like help with today?";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative flex h-full w-full flex-col overflow-y-hidden">
      <div className="flex items-center justify-between border-b p-3">
        <Button size="sm" onClick={streamResponse} disabled={isStreaming}>
          {isStreaming ? "Streaming..." : "Show Streaming"}
        </Button>
      </div>
      <div className="absolute bottom-20 flex w-full translate-x-[-3%] items-center justify-center">
        <ScrollButton containerRef={chatContainerRef} scrollRef={bottomRef} />
      </div>
      <ChatContainer
        className="h-full flex-1 space-y-4 p-4"
        ref={chatContainerRef}
      >
        {messages.map((message) => {
          const isAssistant = message.role === "assistant";

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
              <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
                {isAssistant ? (
                  <div className="bg-secondary text-foreground prose rounded-lg p-2">
                    <ResponseStream
                      textStream={message.content}
                      mode="fade"
                      className="text-sm"
                      fadeDuration={800}
                      speed={100}
                    />
                    {/* <Markdown>{message.content}</Markdown> */}
                  </div>
                ) : (
                  <>
                    <MessageContent className="bg-primary text-primary-foreground">
                      {message.content}
                    </MessageContent>
                    <MessageActions className="self-end">
                      <MessageAction tooltip="Copy to clipboard">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={handleCopy}
                        >
                          <Copy
                            className={`size-4 ${copied ? "text-green-500" : ""}`}
                          />
                        </Button>
                      </MessageAction>
                    </MessageActions>
                  </>
                )}
              </div>
            </Message>
          );
        })}
        <div ref={bottomRef} />
      </ChatContainer>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
          filter: "blur(20px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="absolute bottom-10 flex w-full items-center justify-center"
      >
        <ChatInputWithActions />
      </motion.div>
    </div>
  );
}
