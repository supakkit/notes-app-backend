import { Router } from 'express';
import healthRoutes from './routes/health.routes.js';

const router = Router();

// Health check route
router.use(healthRoutes);




export default router;