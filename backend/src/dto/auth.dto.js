import { z } from 'zod';
import { emailField } from './common.dto.js';

export const loginSchema = z.object({
  email: emailField,
  password: z.string({ required_error: 'Senha é obrigatória' }).min(1).max(72),
});
