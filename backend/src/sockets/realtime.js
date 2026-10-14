import crypto from 'node:crypto';
import { env } from '../config/env.js';

const BROADCAST_URL = `${env.SUPABASE_URL}/realtime/v1/api/broadcast`;

/**
 * Tempo real via Supabase Realtime (Broadcast). Funciona em serverless (Vercel),
 * onde a API não mantém WebSocket. Os eventos são apenas SINAIS: nunca carregam
 * dados sensíveis; o cliente busca os dados pela API autenticada.
 * Os nomes dos canais são segredos derivados no servidor, não adivinháveis.
 */

/** Canal dos admins: HMAC do segredo JWT; entregue só a admins autenticados. */
export function adminChannel() {
  const digest = crypto.createHmac('sha256', env.JWT_ACCESS_SECRET).update('admin-channel').digest('hex');
  return `admin:${digest.slice(0, 32)}`;
}

/** Canal da solicitação: derivado do hash do token de status que só o solicitante conhece. */
const registrationChannel = (statusTokenHash) => `registration:${statusTokenHash}`;

async function broadcast(topic, event, payload = {}) {
  try {
    const response = await fetch(BROADCAST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ messages: [{ topic, event, payload, private: false }] }),
    });
    if (!response.ok) console.error(`Falha no broadcast (${response.status})`);
  } catch (error) {
    // Tempo real é best-effort: não deve derrubar a operação de negócio.
    console.error('Falha no broadcast', error.message);
  }
}

export const emitToAdmins = (event, payload) => broadcast(adminChannel(), event, payload);

export const emitRegistrationStatus = (statusTokenHash, status) =>
  broadcast(registrationChannel(statusTokenHash), 'registration:status', { status });
