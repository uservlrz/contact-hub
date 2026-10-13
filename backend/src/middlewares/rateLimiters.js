import rateLimit from 'express-rate-limit';

const createLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
    message: { message: options.message },
  });

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: 'Muitas requisições. Tente novamente em instantes.',
});

/** Contra força bruta: só tentativas com falha contam. */
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Muitas tentativas de login. Aguarde 15 minutos.',
});

export const registrationLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Muitas solicitações de cadastro. Tente novamente mais tarde.',
});
