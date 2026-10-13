import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, withTransaction } from '../src/config/database.js';

const MIGRATIONS_DIR = fileURLToPath(new URL('../database/migrations/', import.meta.url));

async function listPendingMigrations() {
  const { rows } = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((row) => row.name));
  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith('.sql')).sort();
  return files.filter((file) => !applied.has(file));
}

async function applyMigration(file) {
  const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
  await withTransaction(async (client) => {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
  });
  console.log(`✔ ${file}`);
}

async function main() {
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);

  const pending = await listPendingMigrations();
  if (pending.length === 0) console.log('Banco já está atualizado.');
  for (const file of pending) await applyMigration(file);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
