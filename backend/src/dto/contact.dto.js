import { z } from 'zod';
import { emailField, nameField, optionalText, paginationQuerySchema } from './common.dto.js';
import { CONTACT_CATEGORIES } from '../constants/domain.js';

export const createContactSchema = z.object({
  name: nameField,
  email: emailField,
  phone: z
    .string({ required_error: 'Telefone é obrigatório' })
    .trim()
    .regex(/^\+?[\d\s()-]{8,20}$/, 'Telefone inválido'),
  company: optionalText(100),
  category: z.enum(CONTACT_CATEGORIES, { errorMap: () => ({ message: 'Categoria inválida' }) }),
  city: optionalText(100),
  state: z
    .string({ required_error: 'UF é obrigatória' })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'UF inválida'),
});

export const listContactsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(100).optional(),
});
