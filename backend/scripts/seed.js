import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/database.js';
import { passwordField } from '../src/dto/common.dto.js';

const TOTAL_CONTACTS = 20; // 2 páginas de 10 itens
const FIRST_NAMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João'];
const LAST_NAMES = ['Silva', 'Souza', 'Oliveira', 'Santos'];
const CATEGORIES = ['lead', 'client', 'partner'];
const LOCATIONS = [
  ['Goiânia', 'GO'], ['São Paulo', 'SP'], ['Belo Horizonte', 'MG'],
  ['Brasília', 'DF'], ['Curitiba', 'PR'], ['Recife', 'PE'],
];

function requireCredentials(email, password, label) {
  if (!email || !password) throw new Error(`Defina e-mail e senha de ${label} no .env`);
  const validation = passwordField.safeParse(password);
  if (!validation.success) throw new Error(`Senha de ${label} fraca: ${validation.error.issues[0].message}`);
}

async function upsertUser({ name, email, password, role }) {
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id`,
    [name, email.toLowerCase(), passwordHash, role],
  );
  console.log(`✔ ${role}: ${email}`);
  return rows[0].id;
}

async function seedContacts(operatorId) {
  const { rows } = await pool.query('SELECT count(*)::int AS total FROM contacts');
  if (rows[0].total > 0) return console.log('Contatos já existem, pulando.');

  for (let i = 0; i < TOTAL_CONTACTS; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const [city, state] = LOCATIONS[i % LOCATIONS.length];
    await pool.query(
      `INSERT INTO contacts (name, email, phone, company, category, city, state, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() - ($9 * interval '8 hours'))`,
      [
        `${first} ${last}`,
        `${first}.${last}${i}@exemplo.com`.toLowerCase(),
        `(62) 99${String(1000000 + i * 7919).slice(0, 7)}`,
        `Empresa ${i + 1}`,
        CATEGORIES[i % CATEGORIES.length],
        city,
        state,
        operatorId,
        i,
      ],
    );
  }
  console.log(`✔ ${TOTAL_CONTACTS} contatos de exemplo`);
}

async function main() {
  requireCredentials(env.ADMIN_EMAIL, env.ADMIN_PASSWORD, 'ADMIN');
  requireCredentials(env.DEMO_OPERATOR_EMAIL, env.DEMO_OPERATOR_PASSWORD, 'DEMO_OPERATOR');

  await upsertUser({ name: env.ADMIN_NAME, email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD, role: 'admin' });
  const operatorId = await upsertUser({
    name: 'Operador Demo',
    email: env.DEMO_OPERATOR_EMAIL,
    password: env.DEMO_OPERATOR_PASSWORD,
    role: 'operator',
  });
  await seedContacts(operatorId);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
