import type { JournalEntry } from "@/features/journals/types";
import { getEntryColor } from "@/features/journals/types";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface JournalCardProps {
  entry: JournalEntry;
  onClick?: () => void;
  viewMode?: "grid" | "list";
}

export default function JournalCard({
  entry,
  onClick,
  viewMode,
}: JournalCardProps) {
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
      {/* Paper stack effect */}
      <div
        className={cn("relative", viewMode === "grid" ? "w-full" : "hidden")}
      >
        {/* Bottom papers - these will animate on hover */}
        <motion.div
          className="absolute rounded-lg shadow-md"
          style={{
            backgroundColor: `${entryColor}50`,
            top: "8px",
            left: "8px",
            right: "-4px",
            bottom: "-4px",
            zIndex: 1,
            backgroundImage: "url('/placeholder.svg?height=10&width=10')",
            backgroundBlendMode: "overlay",
            // backgroundOpacity: 0.05,
          }}
          initial={{ rotate: -2 }}
          whileHover={{ rotate: -6, x: -8, y: 4 }}
          transition={{ ease: "easeInOut", duration: 0.1 }}
        />

        {/* Middle paper */}
        <motion.div
          className="absolute rounded-lg shadow-md"
          style={{
            backgroundColor: `${entryColor}50`,
            top: "4px",
            left: "4px",
            right: "-2px",
            bottom: "-2px",
            zIndex: 2,
            backgroundImage: "url('/placeholder.svg?height=10&width=10')",
            backgroundBlendMode: "overlay",
            // backgroundOpacity: 0.05,
          }}
          initial={{ rotate: -1 }}
          whileHover={{ rotate: -3, x: -4, y: 2 }}
          transition={{ ease: "easeInOut", duration: 0.1 }}
        />

        {/* Top paper (main content) */}
        <motion.div
          className={cn(
            "relative z-10 rounded-lg border border-gray-100 bg-white p-4 shadow-md transition-all duration-300",
            "group-hover:shadow-lg",
            viewMode === "grid" ? "min-h-[200px]" : "min-h-[120px]",
          )}
          style={{
            backgroundImage: "linear-gradient(to bottom, #ffffff, #fafafa)",
            transformOrigin: "center",
          }}
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 2, scale: 1.02, y: -2 }}
          transition={{ ease: "easeInOut", duration: 0.1 }}
          // transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="mb-2 flex items-start justify-between">
            <h3 className="line-clamp-1 text-lg font-semibold text-[#3a3a3a]">
              {entry.title}
            </h3>
            <div className="flex flex-wrap justify-end gap-1">
              {Object.entries(entry.moods)
                .slice(0, 3)
                .map(([mood, score], index) => (
                  <div
                    key={index}
                    className="bg-opacity-20 rounded-full px-2 py-1 text-xs"
                    style={{ backgroundColor: `${entryColor}50` }}
                  >
                    {mood}
                  </div>
                ))}
            </div>
          </div>

          <p
            className={cn(
              "mb-3 text-[#6b6b6b]",
              viewMode === "grid" ? "line-clamp-3" : "line-clamp-1",
            )}
          >
            {entry.content}
          </p>

          <div className="flex items-center justify-between text-xs text-[#8a8a8a]">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {formattedDate}
            </div>

            {viewMode === "grid" && (
              <div className="flex items-center gap-1">
                {entry.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
                {entry.tags.length > 2 && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5">
                    +{entry.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
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
                .map(([mood, score], index) => (
                  <div
                    key={index}
                    className="bg-opacity-20 rounded-full px-2 py-1 text-xs"
                    style={{ backgroundColor: `${entryColor}50` }}
                  >
                    {mood}
                  </div>
                ))}
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
