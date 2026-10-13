import { Router } from 'express';
import { ROLES } from '../constants/domain.js';
import * as controller from '../controllers/adminController.js';
import { paginationQuerySchema } from '../dto/common.dto.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';

export const adminRoutes = Router();

adminRoutes.use(authenticate, authorize(ROLES.ADMIN));
adminRoutes.get('/dashboard', controller.dashboard);
adminRoutes.get('/activity', validate(paginationQuerySchema, 'query'), controller.activity);
