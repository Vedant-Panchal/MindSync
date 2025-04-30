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

// Color palette for journal entries
export const JOURNAL_COLORS = [
  "#e6d7c3", // Soft beige
  "#d7e6c3", // Sage green
  "#c3d7e6", // Powder blue
  "#e6c3d7", // Soft pink
  "#d7c3e6", // Lavender
  "#e6c3c3", // Blush
  "#c3e6d7", // Mint
  "#e6e6c3", // Pale yellow
  "#c3c3e6", // Periwinkle
  "#d7d7e6", // Lilac gray
  "#e6d7b3", // Sand
  "#b3e6d7", // Seafoam
];

// Function to deterministically assign a color based on entry ID
export function getEntryColor(id: string): string {
  // Create a simple hash from the ID string
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use the absolute value of the hash to select a color from the palette
  const colorIndex = Math.abs(hash) % JOURNAL_COLORS.length;
  return JOURNAL_COLORS[colorIndex];
}
