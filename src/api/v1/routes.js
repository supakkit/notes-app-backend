import { Router } from "express";
import healthRoutes from "./routes/health.routes.js";
import noteRoutes from "./routes/note.routes.js";
import userRoutes from "./routes/user.routes.js";
import { authUser } from "./middleware/auth.js";

const router = Router();

router.use(healthRoutes);
router.use(userRoutes);
router.use(authUser, noteRoutes);

export default router;
