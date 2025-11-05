import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import { Router } from "express";
import { openApiDocument } from "./openapi.js";

export const setupSwagger = (router: Router) => {
  if (process.env.NODE_ENV === "production") {
    router.use("/api-docs", (req, res, next) => {
      if (req.headers["x-api-key"] !== process.env.SWAGGER_KEY) {
        return res.status(401).send("Unauthorized");
      }
      next();
    });
  }

  router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
};
