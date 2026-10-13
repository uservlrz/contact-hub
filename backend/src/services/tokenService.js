import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ISSUER = 'contact-hub';
const ALGORITHM = 'HS256';

export function signAccessToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    issuer: ISSUER,
    algorithm: ALGORITHM,
    expiresIn: env.JWT_ACCESS_TTL,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: ISSUER,
    algorithms: [ALGORITHM],
  });
}

/** Token opaco aleatório (refresh token, token de status de solicitação). */
export function generateOpaqueToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** Só o hash é persistido: um vazamento do banco não expõe tokens válidos. */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
