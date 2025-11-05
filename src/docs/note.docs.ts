import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../validators/index.js";
import {
  createNoteBodySchema,
  updateNoteBodySchema,
  getNotesQuerySchema,
  answerQuestionBodySchema,
  noteResponseSchema,
  noteIdParamsSchema,
} from "../validators/note.validator.js";
import {
  defaultResponseSchema,
  serverErrorResponseSchema,
} from "../validators/response.validator.js";
import { userIdParamsSchema } from "../validators/user.validator.js";

export const noteRegistry = new OpenAPIRegistry();

// Register schemas for Swagger documentation
noteRegistry.register("CreateNoteBody", createNoteBodySchema);
noteRegistry.register("UpdateNoteBody", updateNoteBodySchema);
noteRegistry.register("AnswerQuestionBody", answerQuestionBodySchema);

// Registering the "Create Note" endpoint
noteRegistry.registerPath({
  method: "post",
  path: "/notes",
  tags: ["Notes"],
  summary: "Create a new note",
  description: "Create a new note for the authenticated user",
  request: {
    body: {
      content: {
        "application/json": { schema: createNoteBodySchema },
      },
    },
  },
  responses: {
    201: {
      description: "Note created successfully",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            note: noteResponseSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid input",
    },
    401: {
      description: "Access denied. No token.",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: serverErrorResponseSchema,
        },
      },
    },
  },
});

// Registering the "Get User Notes" endpoint
noteRegistry.registerPath({
  method: "get",
  path: "/notes",
  tags: ["Notes"],
  summary: "Get all notes of the authenticated user",
  description:
    "Retrieve all notes of the authenticated user, with pagination and optional search",
  request: {
    query: getNotesQuerySchema,
  },
  responses: {
    200: {
      description: "List of notes retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            notes: z.array(noteResponseSchema),
            total: z.string().openapi({ example: "1" }),
            ...getNotesQuerySchema.shape,
          }),
        },
      },
    },
    401: {
      description: "Access denied. No token.",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: serverErrorResponseSchema,
        },
      },
    },
  },
});

// Registering the "Get Note by ID" endpoint
noteRegistry.registerPath({
  method: "get",
  path: "/notes/:noteId",
  tags: ["Notes"],
  summary: "Get a note by ID",
  description:
    "Retrieve a specific note by its ID, only for the authenticated user",
  request: {
    params: noteIdParamsSchema,
  },
  responses: {
    200: {
      description: "Note retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            note: noteResponseSchema,
          }),
        },
      },
    },
    401: {
      description: "Access denied. No token.",
    },
    404: {
      description: "Note not found",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: serverErrorResponseSchema,
        },
      },
    },
  },
});

// Registering the "Get Public Notes by user's ID" endpoint
noteRegistry.registerPath({
  method: "get",
  path: "/public-notes/:userId",
  tags: ["Notes"],
  summary: "Get public notes by user's ID",
  description: "Retrieve public notes by user's ID, for public access",
  request: {
    params: userIdParamsSchema,
  },
  responses: {
    200: {
      description: "Notes retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            user: z.object({
              fullName: z.string(),
              email: z.email(),
            }),
            notes: z.array(
              noteResponseSchema.extend({
                isPublic: z.boolean().openapi({ example: true }),
              })
            ),
          }),
        },
      },
    },
    401: {
      description: "Access denied. No token.",
    },
    404: {
      description: "Note not found",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: serverErrorResponseSchema,
        },
      },
    },
  },
});

// Registering the "Update Note" endpoint
noteRegistry.registerPath({
  method: "patch",
  path: "/notes/:noteId",
  tags: ["Notes"],
  summary: "Update an existing note",
  description:
    "Update an existing note based on the given parameters. Only accessible by the note's owner.",
  request: {
    params: noteIdParamsSchema,
    body: {
      content: {
        "application/json": { schema: updateNoteBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: "Note updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            note: noteResponseSchema,
          }),
        },
      },
    },
    400: {
      description: "No changes provided",
    },
    401: {
      description: "Access denied. No token.",
    },
    404: {
      description: "Note not found",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: serverErrorResponseSchema,
        },
      },
    },
  },
});

// Registering the "Delete Note" endpoint
noteRegistry.registerPath({
  method: "delete",
  path: "/notes/:noteId",
  tags: ["Notes"],
  summary: "Delete a note",
  description: "Delete a note by its ID, only accessible by the note's owner",
  request: {
    params: noteIdParamsSchema,
  },
  responses: {
    204: {
      description: "Note deleted successfully",
      content: {
        "application/json": {
          schema: defaultResponseSchema,
        },
      },
    },
    401: {
      description: "Access denied. No token.",
    },
    404: {
      description: "Note not found",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: serverErrorResponseSchema,
        },
      },
    },
  },
});

// Registering the "Answer Question by AI" endpoint
noteRegistry.registerPath({
  method: "post",
  path: "/notes/:userId/answer-question",
  tags: ["Notes"],
  summary: "Answer a question using AI based on notes",
  description:
    "Generate an answer to a user's question based on the top notes of the authenticated user, using OpenAI.",
  request: {
    params: userIdParamsSchema,
    body: {
      content: {
        "application/json": { schema: answerQuestionBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: "AI Answer generated successfully",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            answer: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Failed to get the answer",
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: serverErrorResponseSchema,
        },
      },
    },
  },
});
