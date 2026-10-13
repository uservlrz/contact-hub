import { executor } from '../config/database.js';

const SELECT_LIST = `c.id, c.name, c.email, c.phone, c.company, c.category, c.city, c.state,
       c.created_at AS "createdAt", u.name AS "createdByName"`;

const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

function buildFilter(search) {
  if (!search) return { where: '', params: [] };
  return {
    where: 'WHERE c.name ILIKE $1 OR c.email ILIKE $1',
    params: [`%${escapeLike(search)}%`],
  };
}

export async function create(data, client) {
  const { rows } = await executor(client).query(
    `INSERT INTO contacts (name, email, phone, company, category, city, state, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, email, phone, company, category, city, state, created_at AS "createdAt"`,
    [data.name, data.email, data.phone, data.company, data.category, data.city, data.state, data.createdBy],
  );
  return rows[0];
}

export async function findById(id) {
  const { rows } = await executor().query(
    `SELECT ${SELECT_LIST}
       FROM contacts c JOIN users u ON u.id = c.created_by
      WHERE c.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findPage({ limit, offset, search }) {
  const { where, params } = buildFilter(search);
  const { rows } = await executor().query(
    `SELECT ${SELECT_LIST}
       FROM contacts c JOIN users u ON u.id = c.created_by
       ${where}
      ORDER BY c.created_at DESC, c.id
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset],
  );
  return rows;
}

export async function count({ search }) {
  const { where, params } = buildFilter(search);
  const { rows } = await executor().query(
    `SELECT count(*)::int AS total FROM contacts c ${where}`,
    params,
  );
  return rows[0].total;
}

export async function getSummary() {
  const { rows } = await executor().query(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE created_at >= date_trunc('day', now()))::int AS today
       FROM contacts`,
  );
  return rows[0];
}

export async function countPerDay(days) {
  const { rows } = await executor().query(
    `SELECT to_char(d::date, 'YYYY-MM-DD') AS label, count(c.id)::int AS total
       FROM generate_series(current_date - ($1::int - 1), current_date, interval '1 day') AS d
       LEFT JOIN contacts c ON c.created_at >= d AND c.created_at < d + interval '1 day'
      GROUP BY d ORDER BY d`,
    [days],
  );
  return rows;
}

export async function countByCategory() {
  const { rows } = await executor().query(
    `SELECT category::text AS label, count(*)::int AS total
       FROM contacts GROUP BY category ORDER BY total DESC`,
  );
  return rows;
}

export async function countByState(limit) {
  const { rows } = await executor().query(
    `SELECT state AS label, count(*)::int AS total
       FROM contacts GROUP BY state ORDER BY total DESC, state LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function countByOperator(limit) {
  const { rows } = await executor().query(
    `SELECT u.name AS label, count(*)::int AS total
       FROM contacts c JOIN users u ON u.id = c.created_by
      GROUP BY u.id, u.name ORDER BY total DESC, u.name LIMIT $1`,
    [limit],
  );
  return rows;
}
