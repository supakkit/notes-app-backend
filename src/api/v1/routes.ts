import { Router } from "express";
import healthRoutes from "./routes/health.routes.js";
import noteRoutes from "./routes/note.routes.js";
import userRoutes from "./routes/user.routes.js";
import publicNoteRoutes from "./routes/public-note.routes.js";
import { authUser } from "../../middleware/auth.js";
import { setupSwagger } from "../../config/swagger.js";

const router = Router();

router.use(healthRoutes);
router.use(userRoutes);
router.use(publicNoteRoutes);
setupSwagger(router);

router.use(authUser, noteRoutes);

export default router;
