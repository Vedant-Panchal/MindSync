import { z } from "zod";
import { Content } from "@tiptap/react";

export const createJournal = z.object({
  title: z.string().min(1, "Please give a title"),
  content: z
    .custom<Content>()
    .refine((value) => value !== undefined && value !== "", {
      message: "Your journal can't be empty",
    }),
});

export type JournalInput = z.infer<typeof createJournal>;
