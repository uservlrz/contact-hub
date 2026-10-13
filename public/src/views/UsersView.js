import { DataTable } from '../components/DataTable/DataTable.js';
import { FormError, FormField } from '../components/FormField/FormField.js';
import { ROLES, roleLabel } from '../models/constants.js';
import { h } from '../utils/dom.js';
import { bindForm } from '../utils/form.js';
import { formatDateTime } from '../utils/format.js';

export function UsersView({ users, currentUserId, onCreate, onToggleActive }) {
  const error = FormError();
  const form = h(
    'form',
    { class: 'card' },
    h('h3', { class: 'card__title' }, 'Novo usuário'),
    h(
      'div',
      { class: 'form-grid' },
      FormField({ label: 'Nome', name: 'name', scope: 'user', minlength: 2, maxlength: 100 }),
      FormField({ label: 'E-mail', name: 'email', scope: 'user', type: 'email', autocomplete: 'off' }),
      FormField({ label: 'Senha inicial', name: 'password', scope: 'user', type: 'password', autocomplete: 'new-password', minlength: 8, maxlength: 72, hint: 'Mínimo 8 caracteres, com maiúscula, minúscula e número.' }),
      FormField({
        label: 'Perfil',
        name: 'role',
        scope: 'user',
        type: 'select',
        options: [
          { value: ROLES.OPERATOR, label: roleLabel(ROLES.OPERATOR) },
          { value: ROLES.ADMIN, label: roleLabel(ROLES.ADMIN) },
        ],
      }),
    ),
    error,
    h('button', { type: 'submit', class: 'button' }, 'Cadastrar usuário'),
  );
  bindForm(form, error, onCreate);

  const columns = [
    { header: 'Nome', render: (user) => user.name },
    { header: 'E-mail', render: (user) => user.email },
    { header: 'Perfil', render: (user) => roleLabel(user.role) },
    {
      header: 'Status',
      render: (user) =>
        h('span', { class: `badge ${user.active ? 'badge--success' : 'badge--danger'}` }, user.active ? 'Ativo' : 'Inativo'),
    },
    { header: 'Criado em', render: (user) => formatDateTime(user.createdAt) },
    {
      header: 'Ações',
      render: (user) =>
        user.id === currentUserId
          ? '—'
          : h(
              'button',
              { type: 'button', class: 'button button--small button--ghost', onclick: () => onToggleActive(user) },
              user.active ? 'Desativar' : 'Ativar',
            ),
    },
  ];

  return h(
    'div',
    {},
    h('h2', { class: 'page-title' }, 'Usuários'),
    form,
    h('div', { class: 'card' }, DataTable({ columns, rows: users })),
  );
}
