import { executor } from '../config/database.js';

const PUBLIC_COLUMNS = `id, name, email, role, active, created_at AS "createdAt"`;

export async function findByEmail(email) {
  const { rows } = await executor().query(
    `SELECT ${PUBLIC_COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await executor().query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function emailExists(email) {
  const { rowCount } = await executor().query('SELECT 1 FROM users WHERE email = $1', [email]);
  return rowCount > 0;
}

export async function create({ name, email, passwordHash, role }, client) {
  const { rows } = await executor(client).query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING ${PUBLIC_COLUMNS}`,
    [name, email, passwordHash, role],
  );
  return rows[0];
}

export async function findAll() {
  const { rows } = await executor().query(
    `SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY created_at DESC`,
  );
  return rows;
}

export async function setActive(id, active) {
  const { rows } = await executor().query(
    `UPDATE users SET active = $2 WHERE id = $1 RETURNING ${PUBLIC_COLUMNS}`,
    [id, active],
  );
  return rows[0] ?? null;
}

export async function countActive() {
  const { rows } = await executor().query(
    'SELECT count(*)::int AS total FROM users WHERE active = true',
  );
  return rows[0].total;
}
