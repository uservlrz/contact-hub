import { z } from 'zod';
import { emailField, nameField, passwordField } from './common.dto.js';
import { ROLES } from '../constants/domain.js';

export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: z.enum(Object.values(ROLES)).default(ROLES.OPERATOR),
});

export const setUserStatusSchema = z.object({
  active: z.boolean({ required_error: 'Informe o status' }),
});
