import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import * as refreshTokenRepository from '../repositories/refreshTokenRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import { HttpError } from '../utils/httpError.js';
import * as auditService from './auditService.js';

export function list() {
  return userRepository.findAll();
}

export async function create({ name, email, password, role }, admin, { ip }) {
  if (await userRepository.emailExists(email)) {
    throw HttpError.conflict('Já existe um usuário com este e-mail');
  }

  const user = await userRepository.create({
    name,
    email,
    role,
    passwordHash: await bcrypt.hash(password, env.BCRYPT_ROUNDS),
  });
  await auditService.record({
    actorId: admin.id,
    action: AUDIT_ACTIONS.USER_CREATED,
    entity: 'user',
    entityId: user.id,
    metadata: { email, role },
    ip,
  });
  return user;
}

export async function setActive(id, active, admin, { ip }) {
  if (id === admin.id) throw HttpError.badRequest('Você não pode alterar o próprio status');

  const user = await userRepository.setActive(id, active);
  if (!user) throw HttpError.notFound('Usuário não encontrado');

  if (!active) await refreshTokenRepository.revokeAllForUser(id);
  await auditService.record({
    actorId: admin.id,
    action: active ? AUDIT_ACTIONS.USER_ACTIVATED : AUDIT_ACTIONS.USER_DEACTIVATED,
    entity: 'user',
    entityId: id,
    metadata: { email: user.email },
    ip,
  });
  return user;
}
