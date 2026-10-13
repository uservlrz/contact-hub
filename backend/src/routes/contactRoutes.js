import { Router } from 'express';
import { ROLES } from '../constants/domain.js';
import * as controller from '../controllers/contactController.js';
import { idParamSchema } from '../dto/common.dto.js';
import { createContactSchema, listContactsQuerySchema } from '../dto/contact.dto.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';

export const contactRoutes = Router();

contactRoutes.use(authenticate);
contactRoutes.get('/', validate(listContactsQuerySchema, 'query'), controller.list);
contactRoutes.get('/:id', validate(idParamSchema, 'params'), controller.getById);
contactRoutes.post(
  '/',
  authorize(ROLES.OPERATOR),
  validate(createContactSchema),
  controller.create,
);
