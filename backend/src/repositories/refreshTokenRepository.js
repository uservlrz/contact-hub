import { executor } from '../config/database.js';

export async function create({ userId, tokenHash, expiresAt }) {
  await executor().query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt],
  );
}

export async function findByHash(tokenHash) {
  const { rows } = await executor().query(
    `SELECT id, user_id AS "userId", expires_at AS "expiresAt", revoked_at AS "revokedAt"
       FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return rows[0] ?? null;
}

/** Revogação atômica: retorna false se outro request já revogou (reuso). */
export async function revoke(id) {
  const { rowCount } = await executor().query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL',
    [id],
  );
  return rowCount === 1;
}

export async function revokeAllForUser(userId) {
  await executor().query(
    'UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL',
    [userId],
  );
}
