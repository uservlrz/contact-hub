import { Router } from 'express';
import { ROLES } from '../constants/domain.js';
import * as controller from '../controllers/registrationController.js';
import { idParamSchema } from '../dto/common.dto.js';
import {
  listRegistrationsQuerySchema,
  registrationStatusSchema,
  submitRegistrationSchema,
} from '../dto/registration.dto.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { registrationLimiter } from '../middlewares/rateLimiters.js';
import { validate } from '../middlewares/validate.js';

export const registrationRoutes = Router();

// Públicas: operador ainda sem conta solicita acesso e consulta o status com o token recebido.
registrationRoutes.post(
  '/',
  registrationLimiter,
  validate(submitRegistrationSchema),
  controller.submit,
);
registrationRoutes.post('/status', validate(registrationStatusSchema), controller.getStatus);

registrationRoutes.use(authenticate, authorize(ROLES.ADMIN));
registrationRoutes.get('/', validate(listRegistrationsQuerySchema, 'query'), controller.list);
registrationRoutes.post('/:id/approve', validate(idParamSchema, 'params'), controller.approve);
registrationRoutes.post('/:id/reject', validate(idParamSchema, 'params'), controller.reject);
