import { executor } from '../config/database.js';

const COLUMNS = `id, name, email, status, created_at AS "createdAt", reviewed_at AS "reviewedAt"`;

export async function create({ name, email, passwordHash, statusTokenHash }) {
  const { rows } = await executor().query(
    `INSERT INTO registration_requests (name, email, password_hash, status_token_hash)
     VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
    [name, email, passwordHash, statusTokenHash],
  );
  return rows[0];
}

export async function hasPendingByEmail(email) {
  const { rowCount } = await executor().query(
    `SELECT 1 FROM registration_requests WHERE email = $1 AND status = 'pending'`,
    [email],
  );
  return rowCount > 0;
}

/** Usado para autenticar o socket de acompanhamento da solicitação. */
export async function findStatusAuth(id) {
  const { rows } = await executor().query(
    `SELECT status, status_token_hash AS "statusTokenHash"
       FROM registration_requests WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findAll(status) {
  const { rows } = await executor().query(
    `SELECT ${COLUMNS} FROM registration_requests
      WHERE ($1::registration_status IS NULL OR status = $1)
      ORDER BY created_at DESC LIMIT 200`,
    [status ?? null],
  );
  return rows;
}

export async function countPending() {
  const { rows } = await executor().query(
    `SELECT count(*)::int AS total FROM registration_requests WHERE status = 'pending'`,
  );
  return rows[0].total;
}

/** Transição atômica pending → approved|rejected. Retorna null se já analisada. */
export async function resolve(id, { status, reviewerId }, client) {
  const { rows } = await executor(client).query(
    `UPDATE registration_requests
        SET status = $2, reviewed_by = $3, reviewed_at = now()
      WHERE id = $1 AND status = 'pending'
      RETURNING ${COLUMNS}, password_hash AS "passwordHash",
                status_token_hash AS "statusTokenHash"`,
    [id, status, reviewerId],
  );
  return rows[0] ?? null;
}
