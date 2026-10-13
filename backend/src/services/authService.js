import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { ROLES } from '../constants/domain.js';
import { adminChannel } from '../sockets/realtime.js';
import * as refreshTokenRepository from '../repositories/refreshTokenRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import { HttpError } from '../utils/httpError.js';
import * as auditService from './auditService.js';
import { generateOpaqueToken, hashToken, signAccessToken } from './tokenService.js';

/** Hash descartável: iguala o tempo de resposta quando o e-mail não existe. */
const DUMMY_HASH = bcrypt.hashSync('senha-descartavel-para-timing', env.BCRYPT_ROUNDS);

const toPublicUser = ({ id, name, email, role }) => ({
  id,
  name,
  email,
  role,
  realtimeChannel: role === ROLES.ADMIN ? adminChannel() : null,
});

async function issueSession(user) {
  const refreshToken = generateOpaqueToken();
  await refreshTokenRepository.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + env.REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
  });
  return { accessToken: signAccessToken(user), refreshToken, user: toPublicUser(user) };
}

export async function login({ email, password }, { ip }) {
  const user = await userRepository.findByEmail(email);
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches || !user.active) {
    await auditService.record({ action: AUDIT_ACTIONS.LOGIN_FAILED, metadata: { email }, ip });
    throw HttpError.unauthorized('Credenciais inválidas');
  }

  await auditService.record({
    actorId: user.id,
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    entity: 'user',
    entityId: user.id,
    ip,
  });
  return issueSession(user);
}

/** Rotação: cada refresh token só vale uma vez; reuso derruba todas as sessões. */
export async function refresh(token, { ip }) {
  if (!token) throw HttpError.unauthorized();

  const stored = await refreshTokenRepository.findByHash(hashToken(token));
  if (!stored) throw HttpError.unauthorized();

  const isReuse = Boolean(stored.revokedAt) || !(await refreshTokenRepository.revoke(stored.id));
  if (isReuse) {
    await refreshTokenRepository.revokeAllForUser(stored.userId);
    await auditService.record({
      actorId: stored.userId,
      action: AUDIT_ACTIONS.REFRESH_REUSE,
      entity: 'user',
      entityId: stored.userId,
      ip,
    });
    throw HttpError.unauthorized('Sessão inválida');
  }

  const user = await userRepository.findById(stored.userId);
  if (stored.expiresAt < new Date() || !user?.active) throw HttpError.unauthorized('Sessão expirada');

  return issueSession(user);
}

export async function logout(token) {
  if (!token) return;
  const stored = await refreshTokenRepository.findByHash(hashToken(token));
  if (stored) await refreshTokenRepository.revoke(stored.id);
}

export async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user?.active) throw HttpError.unauthorized();
  return toPublicUser(user);
}
