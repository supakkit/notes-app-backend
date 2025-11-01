import { Router } from 'express';
import healthRoutes from './routes/health.routes.js';
import noteRoutes from './routes/note.routes.js';

const router = Router();

router.use(healthRoutes);
router.use(noteRoutes);


export default router;