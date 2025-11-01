import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import corsOptions from "./src/api/v1/middleware/corsOptions.js";
import limiter from "./src/api/v1/middleware/rateLimiter.js";
import apiRoutes from "./src/api/v1/routes.js";
import notFoundErrorHandler from "./src/api/v1/errors/notFoundErrorHandler.js";
import centralizedErrorHandler from "./src/api/v1/errors/centralizedErrorHandler.js";

const app = express();

// Global middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

// Centralized routes
app.use("/api/v1/", apiRoutes);

// Centralized error handling
app.use(notFoundErrorHandler);
app.use(centralizedErrorHandler);

export default app;
