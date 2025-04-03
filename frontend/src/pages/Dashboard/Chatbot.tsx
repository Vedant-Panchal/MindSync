// components/ChatBot.tsx
import { Chat } from "@/components/ui/chat";
import { useChatStore } from "@/store/chatStore";
import { Message } from "@/components/ui/chat-message";
import { useKiteHoldings, useKiteUser } from "@/hooks/kite";
import { apiFetch } from "@/utils/pythonAPIFetch";
import { getOnBoardData } from "@/hooks/onBoard";

export function ChatBot() {
  const {
    messages,
    input,
    isLoading,
    setMessages,
    addMessage,
    setInput,
    setIsLoading,
    clearInput,
  } = useChatStore();
  const { data: portfolioHoldings } = useKiteHoldings();
  const {data: user} = useKiteUser()
  const {data: onBoardingData} = getOnBoardData(user?.data?.user_id)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (
    event?: { preventDefault?: () => void },
    messageContent: string = input,
  ) => {
    if (event?.preventDefault) event.preventDefault();
    if (!messageContent.trim() || !portfolioHoldings) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
    };
    // Add the user message only here, not in append
    addMessage(userMessage);
    clearInput();
    setIsLoading(true);

    try {
      console.log(onBoardingData)
      const data = await apiFetch<{ response: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          query: messageContent,
          holdings: portfolioHoldings,
          onboarding_data: onBoardingData
        }),
      });

      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
      });
    } catch (error) {
      console.error("Chat API Error:", error);
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stop = () => {
    setIsLoading(false);
  };

  const append = (message: { role: "user"; content: string }) => {
    // Do not add the message here; let handleSubmit handle it
    handleSubmit(undefined, message.content);
  };

  return (
    <div className="relative flex h-full w-full">
      {messages && messages.length == 0 && (
        <div className="absolute top-10 left-1/2 flex -translate-x-1/2 transform items-center justify-center space-x-2">
          <img src="/logo.png" className="h-10 w-auto" alt="" />{" "}
          <span className="text-2xl font-bold text-pink-800">Investrix</span>
        </div>
      )}
      <Chat
        className="mx-auto flex w-full max-w-2xl flex-col space-y-4 self-end"
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isLoading}
        stop={stop}
        append={append}
        suggestions={[
          "Generate my portfolio summary.",
          "Am I making profits or losses?",
          "How can I reduce my tax liability?",
        ]}
      />
    </div>
  );
}
