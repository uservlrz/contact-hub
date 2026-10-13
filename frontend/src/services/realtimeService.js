import { api } from './api.js';
import { getAccessToken } from './sessionStore.js';

let clientPromise = null;
let channel = null;
const listeners = new Map(); // evento -> Set<handler>

/** Cria o cliente Supabase uma vez; URL e chave anon vêm de /api/config. */
function getClient() {
  clientPromise ??= api
    .get('/config', { auth: false })
    .then(({ supabaseUrl, supabaseAnonKey }) => window.supabase.createClient(supabaseUrl, supabaseAnonKey));
  return clientPromise;
}

const sha256Hex = async (text) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

function dispatch(event, payload) {
  listeners.get(event)?.forEach((handler) => handler(payload));
}

/** Conexão do admin: o nome do canal é um segredo entregue só após o login. */
export async function connectRealtime(channelName) {
  if (!channelName || channel || !getAccessToken()) return;
  const client = await getClient();
  channel = client
    .channel(channelName)
    .on('broadcast', { event: '*' }, ({ event, payload }) => dispatch(event, payload))
    .subscribe();
}

export async function disconnectRealtime() {
  const current = channel;
  channel = null;
  if (current) (await getClient()).removeChannel(current);
}

/** Assina um evento; retorna a função que cancela a assinatura. */
export function onRealtime(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
  return () => listeners.get(event)?.delete(handler);
}

/**
 * Acompanha a solicitação sem login. O canal é derivado do hash do token de status,
 * que só o solicitante conhece. Ao assinar, consulta o estado atual para não perder
 * uma decisão tomada antes da conexão.
 */
export function watchRegistration({ requestId, statusToken }, { onStatus, onInvalid }) {
  let stopped = false;
  let subscribed = null;

  (async () => {
    const client = await getClient();
    const name = `registration:${await sha256Hex(statusToken)}`;
    if (stopped) return;

    subscribed = client
      .channel(name)
      .on('broadcast', { event: 'registration:status' }, ({ payload }) => onStatus(payload.status))
      .subscribe(async (state) => {
        if (state !== 'SUBSCRIBED' || stopped) return;
        try {
          const { status } = await api.post('/registrations/status', { id: requestId, statusToken }, { auth: false });
          if (!stopped) onStatus(status);
        } catch (error) {
          if (error.status === 404 && !stopped) onInvalid();
        }
      });
  })();

  return () => {
    stopped = true;
    if (subscribed) getClient().then((client) => client.removeChannel(subscribed));
  };
}
