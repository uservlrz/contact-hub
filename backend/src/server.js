import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';

const server = createApp().listen(env.PORT, () => {
  console.log(`Contact Hub rodando em http://localhost:${env.PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} recebido, encerrando...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
