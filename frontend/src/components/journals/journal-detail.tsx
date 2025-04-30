import type { JournalEntry } from "@/features/journals/types";
import { getEntryColor } from "@/features/journals/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Tag, X } from "lucide-react";

interface JournalDetailProps {
  entry: JournalEntry;
  onClose: () => void;
}

export default function JournalDetail({ entry, onClose }: JournalDetailProps) {
  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Get a consistent color for this entry based on its ID
  const entryColor = getEntryColor(entry.id);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto pt-10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {entry.title}
            </DialogTitle>
            <div className="flex flex-wrap gap-1">
              {Object.entries(entry.moods)
                .slice(0, 3)
                .map(([mood, score], index) => (
                  <div
                    key={index}
                    className="rounded-full px-3 py-1 text-sm"
                    style={{ backgroundColor: `${entryColor}50` }}
                  >
                    {mood}
                  </div>
                ))}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-muted-foreground flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            {formattedDate}
          </div>

          <div
            className="rounded-lg border border-gray-100 bg-[#fafafa] p-6"
            style={{ borderLeft: `4px solid ${entryColor}` }}
          >
            {entry.rich_text ? (
              <div
                className="prose max-w-none text-[#4a4a4a]"
                dangerouslySetInnerHTML={{ __html: entry.rich_text }}
              />
            ) : (
              <p className="leading-relaxed whitespace-pre-line text-[#4a4a4a]">
                {entry.content}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
              >
                <Tag className="mr-1 h-3 w-3 text-gray-500" />
                {tag}
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
