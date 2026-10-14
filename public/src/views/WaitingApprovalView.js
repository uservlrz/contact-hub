import { REGISTRATION_STATUS } from '../models/constants.js';
import { h } from '../utils/dom.js';

const CONTENT_BY_STATUS = {
  [REGISTRATION_STATUS.PENDING]: {
    title: 'Aguardando aprovação',
    text: 'Sua solicitação foi enviada. Esta tela atualiza sozinha quando um administrador responder.',
  },
  [REGISTRATION_STATUS.APPROVED]: {
    title: 'Cadastro aprovado',
    text: 'Seu acesso foi liberado. Entre com o e-mail e a senha que você informou na solicitação.',
  },
  [REGISTRATION_STATUS.REJECTED]: {
    title: 'Solicitação recusada',
    text: 'Seu cadastro não foi aprovado. Fale com um administrador para saber mais.',
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
      { class: 'auth__card', 'aria-live': 'polite' },
      h('h1', { class: 'auth__title' }, content.title),
      h('p', { class: 'auth__subtitle' }, content.text),
      !isPending && h('button', { type: 'button', class: 'button button--block', onclick: onBackToLogin }, 'Ir para o login'),
    ),
  );
}
