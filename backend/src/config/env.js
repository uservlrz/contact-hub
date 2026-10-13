import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const candidatePaths = [
  resolve(process.cwd(), '.env'),
  fileURLToPath(new URL('../../.env', import.meta.url)),
  fileURLToPath(new URL('../../../.env', import.meta.url)),
];

for (const envPath of candidatePaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const booleanFlag = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: booleanFlag,
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET deve ter ao menos 32 caracteres'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  FRONTEND_DIR: z
    .string()
    .default(
      existsSync(fileURLToPath(new URL('../../../public', import.meta.url)))
        ? fileURLToPath(new URL('../../../public', import.meta.url))
        : fileURLToPath(new URL('../../../frontend', import.meta.url)),
    ),
  ADMIN_NAME: z.string().default('Administrador'),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  DEMO_OPERATOR_EMAIL: z.string().optional(),
  DEMO_OPERATOR_PASSWORD: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  throw new Error(`Configuração inválida:\n - ${problems.join('\n - ')}`);
}

export const env = Object.freeze({
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === 'production',
});
