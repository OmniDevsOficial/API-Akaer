import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const authRoutes = Router();

authRoutes.post('/login', login as any);

authRoutes.post(
  '/register', 
  authMiddleware, 
  roleMiddleware(['ADMIN']), 
  register as any
);

export default authRoutes;