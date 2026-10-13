import { Router } from 'express';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminRoutes } from './adminRoutes.js';
import { authRoutes } from './authRoutes.js';
import { contactRoutes } from './contactRoutes.js';
import { registrationRoutes } from './registrationRoutes.js';
import { userRoutes } from './userRoutes.js';

export const apiRoutes = Router();

apiRoutes.get(
  '/health',
  asyncHandler(async (req, res) => {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  }),
);

/** Valores públicos por natureza (URL e chave anon do Supabase); o acesso real é protegido por RLS. */
apiRoutes.get('/config', (req, res) => {
  res.json({ supabaseUrl: env.SUPABASE_URL, supabaseAnonKey: env.SUPABASE_ANON_KEY });
});

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/registrations', registrationRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/contacts', contactRoutes);
apiRoutes.use('/admin', adminRoutes);
