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

interface IMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}
function RouteComponent() {
  const [messages, setMessages] = useState<IMessage[]>([
    {
      id: 1,
      role: "user",
      content: "Hi there! Can you assist me with a programming query?",
    },
    {
      id: 2,
      role: "assistant",
      content:
        "Absolutely! I'm here to help with your programming questions. What do you need assistance with?",
    },
    {
      id: 3,
      role: "user",
      content: "Can you explain how to use the `useState` hook in React?",
    },
    {
      id: 4,
      role: "assistant",
      content:
        "Certainly! The `useState` hook is used to add state to functional components in React. Here's an example:\n\n```tsx\nimport { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n```\n\nThis creates a counter that increments when the button is clicked. Would you like more details?",
    },
    {
      id: 5,
      role: "user",
      content:
        "Thanks! That makes sense. Can you also explain how to manage multiple states?",
    },
    {
      id: 6,
      role: "assistant",
      content:
        'Sure! You can use multiple `useState` calls to manage multiple states. For example:\n\n```tsx\nfunction Form() {\n  const [name, setName] = useState(\'\');\n  const [email, setEmail] = useState(\'\');\n\n  return (\n    <form>\n      <input\n        type="text"\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n        placeholder="Name"\n      />\n      <input\n        type="email"\n        value={email}\n        onChange={(e) => setEmail(e.target.value)}\n        placeholder="Email"\n      />\n    </form>\n  );\n}\n```\n\nThis allows you to manage `name` and `email` states independently. Let me know if you\'d like further clarification!',
    },
    {
      id: 7,
      role: "user",
      content:
        "Got it! How about using `useReducer` for more complex state management?",
    },
    {
      id: 8,
      role: "assistant",
      content:
        "Great question! The `useReducer` hook is useful for managing more complex state logic. Here's an example:\n\n```tsx\nimport { useReducer } from 'react';\n\nfunction reducer(state, action) {\n  switch (action.type) {\n    case 'increment':\n      return { count: state.count + 1 };\n    case 'decrement':\n      return { count: state.count - 1 };\n    default:\n      throw new Error();\n  }\n}\n\nfunction Counter() {\n  const [state, dispatch] = useReducer(reducer, { count: 0 });\n\n  return (\n    <div>\n      <p>Count: {state.count}</p>\n      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>\n      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>\n    </div>\n  );\n}\n```\n\nThis approach is ideal for scenarios with complex state transitions. Let me know if you'd like to dive deeper!",
    },
    {
      id: 9,
      role: "user",
      content:
        "Thanks for the explanation! I think I have a better understanding now.",
    },
  ]);

  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamContentRef = useRef("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingId, setStreamingId] = useState<number | null>(null);
  const [lastMessage, setLastMessage] = useState<IMessage | null>(null);
  const streamResponse = () => {
    if (isStreaming) return;

    setIsStreaming(true);
    console.log("Stream Started");
    const fullResponse =
      "Yes I'd be happy to explain more about CSS Grid! The `grid-template-columns` property defines the columns in your grid. The `repeat()` function is a shorthand that repeats a pattern. `auto-fit` will fit as many columns as possible in the available space. The `minmax()` function sets a minimum and maximum size for each column. This creates a responsive layout that automatically adjusts based on the available space without requiring media queries.";

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
    setStreamingId(newMessageId);
    streamContentRef.current = "";

    streamIntervalRef.current = setInterval(() => {
      if (charIndex < fullResponse.length) {
        streamContentRef.current += fullResponse[charIndex];
        setStreamingContent(streamContentRef.current); // update stream UI only
        charIndex++;
      } else {
        clearInterval(streamIntervalRef.current!);
        console.log("Stream Ended");
        setIsStreaming(false);
        // Finalize the message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessageId ? { ...msg, content: fullResponse } : msg,
          ),
        );
        setLastMessage({
          id: newMessageId,
          role: "assistant",
          content: fullResponse,
        });
        setStreamingContent("");
        setStreamingId(null);
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
      <div className="absolute bottom-40 flex w-full translate-x-[-3%] items-center justify-center">
        <ScrollButton containerRef={chatContainerRef} scrollRef={bottomRef} />
      </div>
      <ChatContainer
        className="scrollbar-hide h-full flex-1 space-y-4 p-4"
        ref={chatContainerRef}
      >
        {/* Show history chats */}
        {messages.slice(0, messages.length - 1).map((message) => {
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
              <div className="max-w-[85%] sm:max-w-[75%]">
                {isAssistant ? (
                  <div className="bg-secondary text-foreground prose rounded-lg p-2">
                    <Markdown>{message.content}</Markdown>

                    {/* <Markdown>{message.content}</Markdown> */}
                  </div>
                ) : (
                  <>
                    <MessageContent className="bg-primary text-primary-foreground p-2">
                      {message.content}
                    </MessageContent>
                  </>
                )}
              </div>
            </Message>
          );
        })}

        {isStreaming ? (
          <>
            <div className="ml-10 h-full">
              {/* @ts-ignore */}
              <l-mirage size="60" speed="2.5" color="#3981f6" />
            </div>
          </>
        ) : lastMessage ? (
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
              <div className="bg-secondary text-foreground prose rounded-lg p-2">
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
        ) : null}

        <div className="mt-28" ref={bottomRef} />
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
