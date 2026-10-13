import { AUDIT_ACTIONS } from '../constants/auditActions.js';
import * as contactRepository from '../repositories/contactRepository.js';
import { emitToAdmins } from '../sockets/realtime.js';
import { HttpError } from '../utils/httpError.js';
import { paginate, toOffset } from '../utils/pagination.js';
import * as auditService from './auditService.js';

export async function create(data, operator, { ip }) {
  const contact = await contactRepository.create({ ...data, createdBy: operator.id });

  await auditService.record({
    actorId: operator.id,
    action: AUDIT_ACTIONS.CONTACT_CREATED,
    entity: 'contact',
    entityId: contact.id,
    metadata: { name: contact.name },
    ip,
  });

  // Sinais sem dados: o admin busca os detalhes pela API autenticada.
  await emitToAdmins('contact:created', { id: contact.id });
  await emitToAdmins('dashboard:changed');

  return contact;
}

export async function getById(id) {
  const contact = await contactRepository.findById(id);
  if (!contact) throw HttpError.notFound('Contato não encontrado');
  return contact;
}

export async function list({ page, limit, search }) {
  const [data, total] = await Promise.all([
    contactRepository.findPage({ limit, offset: toOffset({ page, limit }), search }),
    contactRepository.count({ search }),
  ]);
  return paginate({ page, limit, total, data });
}
