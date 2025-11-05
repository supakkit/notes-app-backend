import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { defaultResponseSchema, serverErrorResponseSchema } from "../validators/response.validator.js";

export const healthCheckRegistry = new OpenAPIRegistry();

// Registering the "Get User Notes" endpoint
healthCheckRegistry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health check"],
  summary: "Check server is ready to serve",
  description:
    "Retrieve a simple message",
  responses: {
    200: {
      description: "API is healthy - ready to serve",
      content: {
        "application/json": {
          schema: defaultResponseSchema,
        },
      },
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