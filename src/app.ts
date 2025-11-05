import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import corsOptions from "./middleware/corsOptions.js";
import limiter from "./middleware/rateLimiter.js";
import apiRoutes from "./api/v1/routes.js";
import notFoundErrorHandler from "./errors/notFoundErrorHandler.js";
import centralizedErrorHandler from "./errors/centralizedErrorHandler.js";

const app = express();

app.set("trust proxy", 1);

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
