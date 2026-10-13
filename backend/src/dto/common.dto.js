import { z } from 'zod';

export const emailField = z
  .string({ required_error: 'E-mail é obrigatório' })
  .trim()
  .toLowerCase()
  .email('E-mail inválido')
  .max(254);

export const nameField = z
  .string({ required_error: 'Nome é obrigatório' })
  .trim()
  .min(2, 'Nome deve ter ao menos 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres');

/** Limite de 72 bytes: bcrypt ignora o que passa disso. */
export const passwordField = z
  .string({ required_error: 'Senha é obrigatória' })
  .min(8, 'Senha deve ter ao menos 8 caracteres')
  .max(72, 'Senha deve ter no máximo 72 caracteres')
  .regex(/[a-z]/, 'Senha deve conter uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve conter uma letra maiúscula')
  .regex(/\d/, 'Senha deve conter um número');

export const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max, `Deve ter no máximo ${max} caracteres`)
    .optional()
    .transform((value) => value || null);

export const idParamSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
