import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/lib/api-client";
import { useChatbotStore } from "@/stores/chatStore";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function SiteHeader() {
  const { pathname } = useLocation();
  const title =
    pathname.split("/").slice(-1)[0].charAt(0).toUpperCase() +
    pathname.split("/").slice(-1)[0].slice(1);

  const { setMessages, setLastMessage } = useChatbotStore();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await api.delete("/api/v1/chat/remove-history");
      return res as any;
    },
    onSuccess: (data) => {
      toast.success("History Deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleClick = () => {
    mutate(undefined);
    setMessages([]);
    setLastMessage(null);
  };
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b py-1 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sidebar-foreground text-base font-medium">
          {title}
        </h1>
        {title === "Chat" && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={handleClick}
              variant="destructive"
              size="sm"
              className="hidden sm:flex"
            >
              <Trash2 /> Clear chat
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
