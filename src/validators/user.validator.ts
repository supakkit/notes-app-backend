import { z } from "zod";

export const userIdParamsSchema = z.object({
  userId: z
    .string()
    .regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid userId format (must be a MongoDB ObjectId)"
    ),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

export const createUserBodySchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const loginBodySchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must contain at least 8 characters"),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
