import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { withTransaction } from '../config/database.js';
import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import { REGISTRATION_STATUS, ROLES } from '../constants/domain.js';
import * as registrationRepository from '../repositories/registrationRepository.js';
import * as userRepository from '../repositories/userRepository.js';
import { emitRegistrationStatus, emitToAdmins } from '../sockets/realtime.js';
import { HttpError } from '../utils/httpError.js';
import * as auditService from './auditService.js';
import { generateOpaqueToken, hashToken, safeEqual } from './tokenService.js';

export async function submit({ name, email, password }, { ip }) {
  if (await userRepository.emailExists(email)) {
    throw HttpError.conflict('Já existe um usuário com este e-mail');
  }
  if (await registrationRepository.hasPendingByEmail(email)) {
    throw HttpError.conflict('Já existe uma solicitação pendente para este e-mail');
  }

  const statusToken = generateOpaqueToken(24);
  const request = await registrationRepository.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, env.BCRYPT_ROUNDS),
    statusTokenHash: hashToken(statusToken),
  });

  await auditService.record({
    action: AUDIT_ACTIONS.REGISTRATION_SUBMITTED,
    entity: 'registration',
    entityId: request.id,
    metadata: { email },
    ip,
  });
  await emitToAdmins('registration:created', { id: request.id });

  return { id: request.id, statusToken };
}

/** Estado atual da solicitação; exige o token de status entregue ao solicitante. */
export async function getStatus({ id, statusToken }) {
  const stored = await registrationRepository.findStatusAuth(id);
  if (!stored || !safeEqual(stored.statusTokenHash, hashToken(statusToken))) {
    throw HttpError.notFound('Solicitação não encontrada');
  }
  return { status: stored.status };
}

export function list(status) {
  return registrationRepository.findAll(status);
}

export async function approve(id, admin, { ip }) {
  const request = await withTransaction(async (client) => {
    const resolved = await registrationRepository.resolve(
      id,
      { status: REGISTRATION_STATUS.APPROVED, reviewerId: admin.id },
      client,
    );
    if (!resolved) throw HttpError.conflict('Solicitação inexistente ou já analisada');

    await userRepository.create(
      {
        name: resolved.name,
        email: resolved.email,
        passwordHash: resolved.passwordHash,
        role: ROLES.OPERATOR,
      },
      client,
    );
    await auditService.record(
      {
        actorId: admin.id,
        action: AUDIT_ACTIONS.REGISTRATION_APPROVED,
        entity: 'registration',
        entityId: id,
        metadata: { email: resolved.email },
        ip,
      },
      client,
    );
    return resolved;
  });

  await emitRegistrationStatus(request.statusTokenHash, REGISTRATION_STATUS.APPROVED);
  await emitToAdmins('registration:resolved', { id });
}

export async function reject(id, admin, { ip }) {
  const request = await registrationRepository.resolve(id, {
    status: REGISTRATION_STATUS.REJECTED,
    reviewerId: admin.id,
  });
  if (!request) throw HttpError.conflict('Solicitação inexistente ou já analisada');

  await auditService.record({
    actorId: admin.id,
    action: AUDIT_ACTIONS.REGISTRATION_REJECTED,
    entity: 'registration',
    entityId: id,
    metadata: { email: request.email },
    ip,
  });
  await emitRegistrationStatus(request.statusTokenHash, REGISTRATION_STATUS.REJECTED);
  await emitToAdmins('registration:resolved', { id });
}
