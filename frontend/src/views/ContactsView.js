import { DataTable } from '../components/DataTable/DataTable.js';
import { FormError, FormField } from '../components/FormField/FormField.js';
import { Pagination } from '../components/Pagination/Pagination.js';
import { BR_STATES, CONTACT_CATEGORIES, categoryLabel } from '../models/constants.js';
import { h } from '../utils/dom.js';
import { bindForm } from '../utils/form.js';
import { formatDateTime } from '../utils/format.js';

const COLUMNS = [
  { header: 'Nome', render: (contact) => contact.name },
  { header: 'E-mail', render: (contact) => contact.email },
  { header: 'Telefone', render: (contact) => contact.phone },
  { header: 'Empresa', render: (contact) => contact.company ?? '—' },
  { header: 'Categoria', render: (contact) => h('span', { class: 'badge' }, categoryLabel(contact.category)) },
  { header: 'Cidade/UF', render: (contact) => `${contact.city ?? '—'} / ${contact.state}` },
  { header: 'Cadastrado por', render: (contact) => contact.createdByName },
  { header: 'Data', render: (contact) => formatDateTime(contact.createdAt) },
];

function buildCreateForm(onCreate) {
  const error = FormError();
  const form = h(
    'form',
    { class: 'card' },
    h('h3', { class: 'card__title' }, 'Novo contato'),
    h(
      'div',
      { class: 'form-grid' },
      FormField({ label: 'Nome', name: 'name', scope: 'contact', maxlength: 100 }),
      FormField({ label: 'E-mail', name: 'email', scope: 'contact', type: 'email' }),
      FormField({ label: 'Telefone', name: 'phone', scope: 'contact', type: 'tel', placeholder: '(62) 99999-0000', maxlength: 20 }),
      FormField({ label: 'Empresa', name: 'company', scope: 'contact', required: false, maxlength: 100 }),
      FormField({ label: 'Categoria', name: 'category', scope: 'contact', type: 'select', options: CONTACT_CATEGORIES }),
      FormField({ label: 'Cidade', name: 'city', scope: 'contact', required: false, maxlength: 100 }),
      FormField({ label: 'UF', name: 'state', scope: 'contact', type: 'select', options: BR_STATES.map((uf) => ({ value: uf, label: uf })) }),
    ),
    error,
    h('button', { type: 'submit', class: 'button' }, 'Cadastrar contato'),
  );
  bindForm(form, error, onCreate, { resetOnSuccess: true });
  return form;
}

export function ContactsView({ canCreate, onCreate, onSearch }) {
  const listContainer = h('div', { class: 'card' });
  const searchInput = h('input', {
    type: 'search',
    class: 'search',
    placeholder: 'Buscar por nome ou e-mail',
    'aria-label': 'Buscar contatos',
    maxlength: 100,
  });
  const searchForm = h(
    'form',
    {
      class: 'toolbar',
      onsubmit: (event) => {
        event.preventDefault();
        onSearch(searchInput.value.trim());
      },
    },
    searchInput,
    h('button', { type: 'submit', class: 'button button--ghost' }, 'Buscar'),
  );

  const element = h(
    'div',
    {},
    h('h2', { class: 'page-title' }, 'Contatos'),
    canCreate && buildCreateForm(onCreate),
    searchForm,
    listContainer,
  );

  return {
    element,
    setList({ data, meta }, onPageChange) {
      const children = [
        DataTable({ columns: COLUMNS, rows: data, emptyMessage: 'Nenhum contato encontrado.' }),
        meta.total > 0 ? Pagination({ meta, onChange: onPageChange }) : null,
      ].filter(Boolean);
      listContainer.replaceChildren(...children);
    },
  };
}
