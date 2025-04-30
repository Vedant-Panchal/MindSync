import { z } from "zod";
import { Content } from "@tiptap/react";
import { Tag } from "emblor";

export const createJournal = z.object({
  title: z.string().min(1, "Please give a title"),
  tags: z
    .custom<Tag[]>()
    .refine((value) => Array.isArray(value) && value.length > 0, {
      message: "Please add at least one tag",
    }),
  plainText: z
    .custom<string>()
    .refine((value) => value !== undefined && value !== "", {
      message: "Your journal can't be empty",
    }),
  richText: z
    .custom<Content>()
    .refine((value) => value !== undefined && value !== "", {
      message: "Your journal can't be empty",
    }),
});

export type JournalInput = z.infer<typeof createJournal>;
