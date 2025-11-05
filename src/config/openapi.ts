import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { noteRegistry } from "../docs/note.docs.js";
import { userRegistry } from "../docs/user.docs.js";
import { ZodType } from "zod";
import { healthCheckRegistry } from "../docs/health.docs.js";

// Combine registries
const combinedDefinitions = [
  ...healthCheckRegistry.definitions,
  ...noteRegistry.definitions,
  ...userRegistry.definitions,
];

// Separate schemas and paths
const schemas: Record<string, ZodType> = {};
const paths: Record<string, any> = {};

combinedDefinitions.forEach((def) => {
  if (def.type === "schema") {
    // Use schema name or description as key
    const name = def.schema.description || "AnonymousSchema";
    schemas[name] = def.schema;
  } else if (def.type === "route") {
    const { path, method, request, responses, tags, summary, description } =
      def.route;
    paths[path] = paths[path] || {};
    paths[path][method] = {
      tags,
      summary,
      description,
      requestBody: request?.body
        ? { content: { "application/json": { schema: request.body } } }
        : undefined,
      parameters: request?.query
        ? Object.entries(request.query).map(([name, schema]) => ({
            name,
            in: "query",
            required: false,
            schema,
          }))
        : undefined,
      responses,
    };
  }
});

// Generate OpenAPI document
const generator = new OpenApiGeneratorV3(combinedDefinitions);

export const openApiDocument = generator.generateDocument({
  openapi: "3.0.3",
  info: {
    title: "Notes API",
    version: "1.0.0",
    description: "This is a Notes App Server based on the OpenAPI 3.0",
  },
  servers: [{ url: "http://localhost:3100/api/v1", description: "local dev" }],
  // security: [{ bearerAuth: [] }],
});
