let appInstance = null;
let initError = null;

async function getApp() {
  if (initError) throw initError;
  if (!appInstance) {
    try {
      const { createApp } = await import('../backend/src/app.js');
      appInstance = createApp();
    } catch (err) {
      initError = err;
      throw err;
    }
  }
  return appInstance;
}

export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error('Erro na inicialização da API na Vercel:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify(
        {
          error: 'FUNCTION_INITIALIZATION_ERROR',
          message: err?.message || 'Erro desconhecido na inicialização da API',
          tip: 'Verifique se as variáveis de ambiente (DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, JWT_ACCESS_SECRET) foram adicionadas em Settings > Environment Variables na Vercel.',
        },
        null,
        2,
      ),
    );
  }
}
