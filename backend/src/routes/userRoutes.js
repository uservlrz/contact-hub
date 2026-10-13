import { Router } from 'express';
import { ROLES } from '../constants/domain.js';
import * as controller from '../controllers/userController.js';
import { idParamSchema } from '../dto/common.dto.js';
import { createUserSchema, setUserStatusSchema } from '../dto/user.dto.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';

export const userRoutes = Router();

userRoutes.use(authenticate, authorize(ROLES.ADMIN));
userRoutes.get('/', controller.list);
userRoutes.post('/', validate(createUserSchema), controller.create);
userRoutes.patch(
  '/:id/status',
  validate(idParamSchema, 'params'),
  validate(setUserStatusSchema),
  controller.setStatus,
);
