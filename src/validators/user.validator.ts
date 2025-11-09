import { z } from "./index.js";

// Zod schema for the User object (excluding password)
export const userResponseSchema = z.object({
  _id: z.uuid().openapi({ example: "6909a5e6032da33efd9b524e" }),
  fullName: z.string().openapi({ example: "John Doe" }),
  email: z.string().openapi({ example: "john.doe@example.com" }),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().nullable().openapi({ example: "2023-11-01T12:00:00Z" }),
  createdAt: z.date().optional().openapi({ example: "2023-01-01T12:00:00Z" }),
  updatedAt: z.date().optional().openapi({ example: "2023-10-01T12:00:00Z" }),
});

export const userIdParamsSchema = z.object({
  userId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid userId format (must be a MongoDB ObjectId)"
    )
    .openapi({ example: "6909a5e6032da33efd9b524e" }),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

export const createUserBodySchema = z.object({
  fullName: z.string("Full name is required.").min(1, "Full name is too short."),
  email: z.email("Invalid email address."),
  password: z
    .string("Password is required.")
    .min(6, "Password must contain at least 6 characters."),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const loginBodySchema = z.object({
  email: z.email("Invalid email address."),
  password: z
    .string("Password is required.")
    .min(6, "Password must contain at least 6 characters."),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
