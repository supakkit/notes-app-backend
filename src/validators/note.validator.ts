import { z } from "zod";

// Validation schema for creating note
export const createNoteBodySchema = z.object({
  title: z.string("Title is required").min(1, "Too short!"),
  content: z.string("Content is required").min(1, "Too short!"),
  tags: z.array(z.string()).optional().default([]),
  isPinned: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export type CreateNoteBody = z.infer<typeof createNoteBodySchema>;

// Validation schema for updating note
export const updatedNoteBodySchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  isPinned: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateNoteBody = z.infer<typeof updatedNoteBodySchema>;

// Validation schema for query parameter
export const getNotesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, "Page must be a positive integer"),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),

  q: z
    .string()
    .optional()
    .transform((val) => val?.trim() || ""),
});

export type GetNotesQuery = z.infer<typeof getNotesQuerySchema>;

export const noteIdParamsSchema = z.object({
  noteId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid noteId format (must be a MongoDB ObjectId)"
    ),
});

export type NoteIdParams = z.infer<typeof noteIdParamsSchema>;

export const answerQuestionBodySchema = z.object({
  question: z.string("Question is required").min(5, "Too short!"),
});

export type AnswerQuestionBody = z.infer<typeof answerQuestionBodySchema>;
