import { z } from "./index.js";

// Zod schema for Note response (e.g., when fetching note details)
export const noteResponseSchema = z.object({
  _id: z.uuid().openapi({ example: "6909a5a4032da33efd9b5243" }),
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .openapi({ example: "Example Note Title." }),
  content: z
    .string()
    .min(1, { message: "Content is required." })
    .openapi({ example: "This is the content of the example note." }),
  tags: z
    .array(z.string())
    .default([])
    .openapi({ example: ["example", "note", "tags"] }),
  isPinned: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  userId: z.uuid().openapi({ example: "6909a5e6032da33efd9b524e" }),
  createdAt: z.date().optional().openapi({ example: "2023-01-01T12:00:00Z" }),
  updatedAt: z.date().optional().openapi({ example: "2023-10-01T12:00:00Z" }),
});

// Validation schema for creating note
export const createNoteBodySchema = z
  .object({
    title: z
      .string("Title is required.")
      .min(1, "Title is too short.")
      .openapi({ example: "My Note" }),
    content: z
      .string("Content is required.")
      .min(1, "Content is too short.")
      .openapi({ example: "This is my note's content." }),
    tags: z
      .array(z.string())
      .optional()
      .default([])
      .openapi({ example: ["work", "todo"] }),
    isPinned: z.boolean().default(false).openapi({ example: false }),
    isPublic: z.boolean().default(false).openapi({ example: false }),
  })
  .openapi("CreateNoteBody");

export type CreateNoteBody = z.infer<typeof createNoteBodySchema>;

// Validation schema for updating note
export const updateNoteBodySchema = z
  .object({
    title: z.string("Title is required.").min(1, "Title is too short.").optional().openapi({ example: "My Updated Note" }),
    content: z.string("Content is required.").min(1, "Title is too short.").optional(),
    tags: z.array(z.string()).optional(),
    isPinned: z.boolean().optional(),
    isPublic: z.boolean().optional(),
  })
  .openapi("UpdateNoteBody");

export type UpdateNoteBody = z.infer<typeof updateNoteBodySchema>;

// Validation schema for query parameter
export const getNotesQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, "Page must be a positive integer")
      .openapi({
        example: "1",
        description: "Page number for pagination",
      }),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
      .openapi({
        example: "10",
        description: "Limit number of results",
      }),

    q: z
      .string()
      .optional()
      .transform((val) => val?.trim() || "")
      .openapi({
        example: "meeting",
        description: "Search query string",
      }),
  })
  .openapi("GetNotesQuery");

export type GetNotesQuery = z.infer<typeof getNotesQuerySchema>;

export const noteIdParamsSchema = z
  .object({
    noteId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid noteId format (must be a MongoDB ObjectId)"
      )
      .openapi({ example: "6909a5a4032da33efd9b5243" }),
  })
  .openapi("NoteIdParams");

export type NoteIdParams = z.infer<typeof noteIdParamsSchema>;

export const answerQuestionBodySchema = z.object({
  question: z.string("Question is required.").min(5, "Question is too short."),
});

export type AnswerQuestionBody = z.infer<typeof answerQuestionBodySchema>;
