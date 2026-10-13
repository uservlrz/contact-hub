import { executor } from '../config/database.js';

export async function create({ actorId, action, entity, entityId, metadata, ip }, client) {
  await executor(client).query(
    `INSERT INTO audit_logs (actor_id, action, entity, entity_id, metadata, ip)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [actorId ?? null, action, entity ?? null, entityId ?? null, JSON.stringify(metadata ?? {}), ip ?? null],
  );
}

export async function findPage({ limit, offset }) {
  const { rows } = await executor().query(
    `SELECT a.id, a.action, a.entity, a.entity_id AS "entityId", a.metadata, a.ip,
            a.created_at AS "createdAt", u.name AS "actorName"
       FROM audit_logs a LEFT JOIN users u ON u.id = a.actor_id
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return rows;
}

export async function count() {
  const { rows } = await executor().query('SELECT count(*)::int AS total FROM audit_logs');
  return rows[0].total;
}
