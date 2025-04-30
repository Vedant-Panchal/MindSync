import JournalEntries from "@/components/journals/journal-entries";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  rich_text: string;
  date: string;
  moods: Record<string, number>; // Changed to support mood object with scores
  tags: string[];
  created_at: string;
}

export const Route = createFileRoute("/(app)/app/journals")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: journals, isPending } = useQuery({
    queryKey: ["journals"],
    queryFn: async () => {
      const response = await api.get<JournalEntry[]>("/api/v1/journals/get");
      return response;
    },
  });
  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-y-auto">
      <JournalEntries data={journals! as any} />
    </div>
  );
}
