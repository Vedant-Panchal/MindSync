"use client";

import type { JournalEntry } from "@/features/journals/types";
import { getEntryColor } from "@/features/journals/types";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface BookJournalCardProps {
  entry: JournalEntry;
  onClick: () => void;
  viewMode: "grid" | "list";
}

export default function BookJournalCard({
  entry,
  onClick,
  viewMode,
}: BookJournalCardProps) {
  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Get a consistent color for this entry based on its ID
  const entryColor = getEntryColor(entry.id);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "group cursor-pointer",
        viewMode === "list" && "flex items-start gap-4",
      )}
      onClick={onClick}
    >
      {/* Book effect */}
      <div
        className={cn("relative", viewMode === "grid" ? "w-full" : "hidden")}
      >
        {/* Book spine */}
        <motion.div
          className="absolute rounded-l-md"
          style={{
            backgroundColor: entryColor,
            top: "0",
            left: "0",
            width: "20px",
            bottom: "0",
            zIndex: 2,
            boxShadow: "inset -2px 0 5px rgba(0,0,0,0.1)",
          }}
          initial={{ rotateY: 0 }}
          whileHover={{ rotateY: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />

        {/* Book cover */}
        <motion.div
          className={cn(
            "relative z-10 rounded-r-md border-t border-r border-b border-gray-200 bg-white p-4 shadow-md",
            "group-hover:shadow-lg",
            viewMode === "grid" ? "min-h-[200px]" : "min-h-[120px]",
          )}
          style={{
            backgroundColor: entryColor,
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)",
            marginLeft: "15px",
            transformOrigin: "left center",
          }}
          initial={{ rotateY: 0 }}
          whileHover={{ rotateY: 25, x: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="mb-2 flex items-start justify-between">
            <h3 className="line-clamp-1 text-lg font-semibold text-[#3a3a3a]">
              {entry.title}
            </h3>
            <div className="flex flex-wrap justify-end gap-1">
              {Object.entries(entry.moods)
                .slice(0, 3)
                .map(([mood, _], index) => (
                  <div
                    key={index}
                    className="bg-opacity-70 rounded-full bg-white px-2 py-1 text-xs"
                  >
                    {mood}
                  </div>
                ))}
              {Object.keys(entry.moods).length > 2 && (
                <div className="bg-opacity-70 rounded-full bg-white px-2 py-1 text-xs">
                  +{Object.keys(entry.moods).length - 2}
                </div>
              )}
            </div>
          </div>

          <p
            className={cn(
              "mb-3 text-[#3a3a3a]",
              viewMode === "grid" ? "line-clamp-3" : "line-clamp-1",
            )}
          >
            {entry.content}
          </p>

          <div className="flex items-center justify-between text-xs text-[#3a3a3a]">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {formattedDate}
            </div>

            {viewMode === "grid" && (
              <div className="flex items-center gap-1">
                {entry.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="bg-opacity-70 rounded-full bg-white px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
                {entry.tags.length > 2 && (
                  <span className="bg-opacity-70 rounded-full bg-white px-2 py-0.5">
                    +{entry.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Book pages */}
        <motion.div
          className="absolute rounded-r-md"
          style={{
            backgroundColor: "#f0f0f0",
            top: "2px",
            left: "20px",
            right: "2px",
            bottom: "2px",
            zIndex: 1,
            boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)",
          }}
          initial={{ rotateY: 0 }}
          whileHover={{ rotateY: 15, x: 5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>

      {viewMode === "list" && (
        <div className="flex-1 rounded-md border border-gray-100 p-4 pt-2 shadow-sm transition-all duration-300">
          <div className="mb-1 flex items-start justify-between">
            <h3 className="text-lg font-semibold text-[#3a3a3a]">
              {entry.title}
            </h3>
            <div className="flex flex-wrap justify-end gap-1">
              {Object.entries(entry.moods)
                .slice(0, 3)
                .map(([mood, _], index) => (
                  <div
                    key={index}
                    className="bg-opacity-20 rounded-full px-2 py-1 text-xs"
                    style={{ backgroundColor: `${entryColor}50` }}
                  >
                    {mood}
                  </div>
                ))}
              {Object.keys(entry.moods).length > 2 && (
                <div
                  className="bg-opacity-20 rounded-full px-2 py-1 text-xs"
                  style={{ backgroundColor: `${entryColor}50` }}
                >
                  +{Object.keys(entry.moods).length - 2}
                </div>
              )}
            </div>
          </div>

          <p className="mb-2 line-clamp-2 text-[#6b6b6b]">{entry.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-[#8a8a8a]">
              <Calendar className="mr-1 h-3 w-3" />
              {formattedDate}
            </div>

            <div className="flex items-center gap-1">
              {entry.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
              {entry.tags.length > 3 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                  +{entry.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
