import { REGISTRATION_STATUS } from '../models/constants.js';
import { h } from '../utils/dom.js';

const CONTENT_BY_STATUS = {
  [REGISTRATION_STATUS.PENDING]: {
    icon: '⏳',
    title: 'Aguardando aprovação',
    text: 'Sua solicitação foi enviada. Esta tela será atualizada automaticamente assim que um administrador analisá-la.',
  },
  [REGISTRATION_STATUS.APPROVED]: {
    icon: '✅',
    title: 'Cadastro aprovado!',
    text: 'Seu acesso foi liberado. Entre com o e-mail e a senha informados na solicitação.',
  },
  [REGISTRATION_STATUS.REJECTED]: {
    icon: '⛔',
    title: 'Solicitação rejeitada',
    text: 'Seu cadastro não foi aprovado. Procure um administrador para mais informações.',
  },
};

export function WaitingApprovalView({ status, onBackToLogin }) {
  const content = CONTENT_BY_STATUS[status] ?? CONTENT_BY_STATUS[REGISTRATION_STATUS.PENDING];
  const isPending = status === REGISTRATION_STATUS.PENDING;

  return h(
    'div',
    { class: 'auth' },
    h(
      'section',
      { class: 'auth__card waiting', 'aria-live': 'polite' },
      h('div', { class: `waiting__icon${isPending ? ' waiting__icon--pulse' : ''}` }, content.icon),
      h('h1', { class: 'auth__title' }, content.title),
      h('p', { class: 'auth__subtitle' }, content.text),
      !isPending && h('button', { type: 'button', class: 'button button--block', onclick: onBackToLogin }, 'Ir para o login'),
    ),
  );
}
