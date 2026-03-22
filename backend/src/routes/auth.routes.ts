import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const authRoutes = Router();

authRoutes.post('/login', login as any);

export default authRoutes;
