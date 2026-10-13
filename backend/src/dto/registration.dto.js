import { z } from 'zod';
import { emailField, nameField, passwordField } from './common.dto.js';
import { REGISTRATION_STATUS } from '../constants/domain.js';

export const submitRegistrationSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

export const listRegistrationsQuerySchema = z.object({
  status: z.enum(Object.values(REGISTRATION_STATUS)).optional(),
});

export const registrationStatusSchema = z.object({
  id: z.string().uuid(),
  statusToken: z.string().min(16).max(128),
});
