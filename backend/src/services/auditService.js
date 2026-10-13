import * as auditRepository from '../repositories/auditRepository.js';
import { paginate, toOffset } from '../utils/pagination.js';

export function record(entry, client) {
  return auditRepository.create(entry, client);
}

export async function list({ page, limit }) {
  const [data, total] = await Promise.all([
    auditRepository.findPage({ limit, offset: toOffset({ page, limit }) }),
    auditRepository.count(),
  ]);
  return paginate({ page, limit, total, data });
}
