import { z } from "./index.js";

export const serverErrorResponseSchema = z.object({
  error: z.boolean().default(true),
  message: z.string().openapi({ example: "Internal server error" }),
});

export const defaultResponseSchema = z.object({
  error: z.boolean().default(false),
  message: z.string(),
})
