import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "../validators/index.js";
import {
  createUserBodySchema,
  loginBodySchema,
  userIdParamsSchema,
  userResponseSchema,
} from "../validators/user.validator.js";
import {
  defaultResponseSchema,
  serverErrorResponseSchema,
} from "../validators/response.validator.js";

export const userRegistry = new OpenAPIRegistry();

// Register schemas for Swagger (Zod schemas)
userRegistry.register("CreateUserBody", createUserBodySchema);
userRegistry.register("LoginBody", loginBodySchema);

// Register endpoints
userRegistry.registerPath({
  method: "post",
  path: "/signup",
  tags: ["User"],
  summary: "Create a new user",
  description:
    "Sign up a new user by providing full name, email, and password.",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            ...userResponseSchema.shape,
          }),
        },
      },
    },
    409: {
      description: "Email already in use",
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

userRegistry.registerPath({
  method: "post",
  path: "/login",
  tags: ["User"],
  summary: "Login user",
  description:
    "Login an existing user with email and password to get an access token.",
  request: {
    body: {
      content: {
        "application/json": { schema: loginBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            ...userResponseSchema.shape,
          }),
        },
      },
    },
    401: {
      description: "Invalid credentials",
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

userRegistry.registerPath({
  method: "get",
  path: "/verify-token",
  tags: ["User"],
  summary: "Verify JWT token",
  description: "Verify the JWT token to check if the user is authenticated.",
  responses: {
    200: {
      description: "Token is valid",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            ...userIdParamsSchema.shape,
          }),
        },
      },
    },
    401: {
      description: "Token is required or invalid",
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

userRegistry.registerPath({
  method: "post",
  path: "/logout",
  tags: ["User"],
  summary: "Logout user",
  description: "Logout the user by clearing the JWT token in the cookies.",
  responses: {
    200: {
      description: "Logged out successfully",
      content: {
        "application/json": {
          schema: defaultResponseSchema,
        },
      },
    },
  },
});

userRegistry.registerPath({
  method: "delete",
  path: "/delete-account",
  tags: ["User"],
  summary: "Delete user account",
  description:
    "Soft-delete the user account. The user can reactivate the account by signing up again.",
  responses: {
    204: {
      description: "Account deleted successfully",
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
      description: "User not found",
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

// Registering the "Get User Profile" endpoint
userRegistry.registerPath({
  method: "get",
  path: "/profile",
  tags: ["User"],
  summary: "Get the profile of the authenticated user",
  description: "Retrieve the profile of the authenticated user",
  responses: {
    200: {
      description: "Profile retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            ...defaultResponseSchema.shape,
            ...userResponseSchema.shape,
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
