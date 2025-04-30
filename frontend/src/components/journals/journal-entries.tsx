import { useState } from "react";
import type { JournalEntry } from "@/features/journals/types";
import { Button } from "@/components/ui/button";
import { Book, Grid3X3, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JournalCard from "@/components/journals/journal-card";
import BookJournalCard from "@/components/journals/book-journal-card";
import JournalDetail from "@/components/journals/journal-detail";

type JournalEntries = {
  data: JournalEntry[];
};

export default function JournalEntries({ data }: JournalEntries) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [displayStyle, setDisplayStyle] = useState<"paper" | "book">("paper");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  const filteredEntries = data
    ?.filter(
      (entry) =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        Object.keys(entry.moods).some((mood) =>
          mood.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div className="w-full space-y-6 overflow-y-auto">
      <div className="sticky top-0 z-10 flex flex-col items-center justify-between px-5 py-2 backdrop-blur-sm sm:flex-row">
        <div className="relative w-full">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search entries..."
            className="bg-white pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ml-5 flex w-full gap-2 sm:w-auto">
          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(value as "newest" | "oldest" | "title")
            }
          >
            <SelectTrigger className="w-full bg-white sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-md border bg-white">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="sr-only">Grid view</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
              <span className="sr-only">List view</span>
            </Button>
          </div>
          <Button
            variant={displayStyle === "book" ? "default" : "ghost"}
            size="icon"
            onClick={() =>
              setDisplayStyle(displayStyle === "paper" ? "book" : "paper")
            }
            title={`Switch to ${displayStyle === "paper" ? "book" : "paper"} style`}
          >
            <Book className="h-4 w-4" />
            <span className="sr-only">Toggle display style</span>
          </Button>
        </div>
      </div>

      {filteredEntries?.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No journal entries found. Try a different search term.
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-6 px-5 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {filteredEntries?.map((entry) =>
            displayStyle === "paper" ? (
              <JournalCard
                key={entry.id}
                entry={entry}
                onClick={() => setSelectedEntry(entry)}
                viewMode={viewMode}
              />
            ) : (
              <BookJournalCard
                key={entry.id}
                entry={entry}
                onClick={() => setSelectedEntry(entry)}
                viewMode={viewMode}
              />
            ),
          )}
        </div>
      )}

      {selectedEntry && (
        <JournalDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}
