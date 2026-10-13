import { Router } from 'express';
import * as controller from '../controllers/authController.js';
import { loginSchema } from '../dto/auth.dto.js';
import { authenticate } from '../middlewares/authenticate.js';
import { loginLimiter } from '../middlewares/rateLimiters.js';
import { validate } from '../middlewares/validate.js';

export const authRoutes = Router();

authRoutes.post('/login', loginLimiter, validate(loginSchema), controller.login);
authRoutes.post('/refresh', controller.refresh);
authRoutes.post('/logout', controller.logout);
authRoutes.get('/me', authenticate, controller.me);
