import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiLimiter } from './middlewares/rateLimiters.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { apiRoutes } from './routes/index.js';

const SELF = "'self'";
const supabaseOrigin = new URL(env.SUPABASE_URL);
const supabaseConnect = [`https://${supabaseOrigin.host}`, `wss://${supabaseOrigin.host}`];

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [SELF],
          scriptSrc: [SELF],
          styleSrc: [SELF],
          imgSrc: [SELF, 'data:'],
          connectSrc: [SELF, ...supabaseConnect],
          objectSrc: ["'none'"],
          baseUri: [SELF],
          formAction: [SELF],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: env.isProduction ? [] : null,
        },
      },
    }),
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  // Compatibilidade Vercel Serverless: restaura a URL original caso reescrita pelo vercel.json
  app.use((req, _res, next) => {
    const originalPath = req.headers['x-matched-path'];
    if (typeof originalPath === 'string' && originalPath.length > 0) {
      const queryIndex = req.url.indexOf('?');
      if (queryIndex !== -1 && !originalPath.includes('?')) {
        req.url = originalPath + req.url.substring(queryIndex);
      } else {
        req.url = originalPath;
      }
    }
    next();
  });

  app.use('/api', apiLimiter, apiRoutes, notFoundHandler);
  // Local: a API também serve o frontend. Na Vercel o frontend é estático (ver vercel.json).
  app.use(express.static(env.FRONTEND_DIR));
  app.use(errorHandler);

  return app;
}
