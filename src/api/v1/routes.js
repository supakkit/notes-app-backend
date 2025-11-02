import { Router } from 'express';
import healthRoutes from './routes/health.routes.js';
import noteRoutes from './routes/note.routes.js';
import userRoutes from './routes/user.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(userRoutes);
router.use(noteRoutes);


export default router;