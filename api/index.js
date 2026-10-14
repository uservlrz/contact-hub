let appInstance = null;

async function getApp() {
  if (!appInstance) {
    const { createApp } = await import('../backend/src/app.js');
    appInstance = createApp();
  }
  return appInstance;
}

/** Entrada serverless da Vercel: toda requisição /api/* chega aqui. */
export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    // O detalhe fica só no log da Vercel; o cliente não recebe informação de configuração.
    console.error('Falha ao iniciar a API:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ message: 'Serviço indisponível' }));
  }
}
