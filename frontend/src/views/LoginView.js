import { FormError, FormField } from '../components/FormField/FormField.js';
import { h } from '../utils/dom.js';
import { bindForm } from '../utils/form.js';

const PASSWORD_HINT = 'Mínimo 8 caracteres, com maiúscula, minúscula e número.';

function buildLoginForm(onLogin) {
  const error = FormError();
  const form = h(
    'form',
    { class: 'auth__form' },
    FormField({ label: 'E-mail', name: 'email', scope: 'login', type: 'email', autocomplete: 'username' }),
    FormField({ label: 'Senha', name: 'password', scope: 'login', type: 'password', autocomplete: 'current-password', maxlength: 72 }),
    error,
    h('button', { type: 'submit', class: 'button button--block' }, 'Entrar'),
  );
  bindForm(form, error, ({ email, password }) => onLogin({ email, password }));
  return form;
}

function buildRequestForm(onRequestAccess) {
  const error = FormError();
  const form = h(
    'form',
    { class: 'auth__form' },
    FormField({ label: 'Nome completo', name: 'name', scope: 'request', autocomplete: 'name', minlength: 2, maxlength: 100 }),
    FormField({ label: 'E-mail', name: 'email', scope: 'request', type: 'email', autocomplete: 'email' }),
    FormField({ label: 'Senha', name: 'password', scope: 'request', type: 'password', autocomplete: 'new-password', minlength: 8, maxlength: 72, hint: PASSWORD_HINT }),
    FormField({ label: 'Confirmar senha', name: 'confirmPassword', scope: 'request', type: 'password', autocomplete: 'new-password', maxlength: 72 }),
    error,
    h('button', { type: 'submit', class: 'button button--block' }, 'Solicitar acesso'),
  );
  bindForm(form, error, (values) => {
    if (values.password !== values.confirmPassword) throw new Error('As senhas não conferem');
    return onRequestAccess(values);
  });
  return form;
}

/** Tela de login com alternância para o formulário de solicitação de cadastro. */
export function LoginView({ onLogin, onRequestAccess }) {
  const loginForm = buildLoginForm(onLogin);
  const requestForm = buildRequestForm(onRequestAccess);
  requestForm.hidden = true;

  const tabs = [
    { label: 'Entrar', form: loginForm },
    { label: 'Solicitar acesso', form: requestForm },
  ];

  const buttons = tabs.map((tab) =>
    h('button', { type: 'button', class: 'tabs__button', role: 'tab', onclick: () => select(tab) }, tab.label),
  );

  function select(selected) {
    tabs.forEach((tab, index) => {
      const active = tab === selected;
      tab.form.hidden = !active;
      buttons[index].setAttribute('aria-selected', String(active));
    });
  }
  select(tabs[0]);

  return h(
    'div',
    { class: 'auth' },
    h(
      'section',
      { class: 'auth__card' },
      h('h1', { class: 'auth__title' }, 'Contact Hub'),
      h('p', { class: 'auth__subtitle' }, 'Gestão de contatos'),
      h('div', { class: 'tabs', role: 'tablist' }, ...buttons),
      loginForm,
      requestForm,
    ),
  );
}
