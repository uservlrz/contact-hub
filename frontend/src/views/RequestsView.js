import { DataTable } from '../components/DataTable/DataTable.js';
import { REGISTRATION_STATUS, REGISTRATION_STATUS_LABELS } from '../models/constants.js';
import { h } from '../utils/dom.js';
import { formatDateTime } from '../utils/format.js';

const FILTERS = [
  { value: REGISTRATION_STATUS.PENDING, label: 'Pendentes' },
  { value: REGISTRATION_STATUS.APPROVED, label: 'Aprovadas' },
  { value: REGISTRATION_STATUS.REJECTED, label: 'Rejeitadas' },
];

export function RequestsView({ requests, filter, onFilter, onApprove, onReject }) {
  const filterButtons = FILTERS.map((item) =>
    h(
      'button',
      {
        type: 'button',
        class: 'tabs__button',
        role: 'tab',
        'aria-selected': String(item.value === filter),
        onclick: () => onFilter(item.value),
      },
      item.label,
    ),
  );

  const columns = [
    { header: 'Nome', render: (request) => request.name },
    { header: 'E-mail', render: (request) => request.email },
    { header: 'Solicitada em', render: (request) => formatDateTime(request.createdAt) },
    { header: 'Status', render: (request) => h('span', { class: 'badge' }, REGISTRATION_STATUS_LABELS[request.status]) },
    {
      header: 'Ações',
      render: (request) =>
        request.status === REGISTRATION_STATUS.PENDING
          ? h(
              'div',
              { class: 'row-actions' },
              h('button', { type: 'button', class: 'button button--small', onclick: () => onApprove(request) }, 'Aprovar'),
              h('button', { type: 'button', class: 'button button--small button--danger', onclick: () => onReject(request) }, 'Rejeitar'),
            )
          : '—',
    },
  ];

  return h(
    'div',
    {},
    h('h2', { class: 'page-title' }, 'Solicitações de cadastro'),
    h('div', { class: 'tabs', role: 'tablist' }, ...filterButtons),
    h('div', { class: 'card' }, DataTable({ columns, rows: requests, emptyMessage: 'Nenhuma solicitação neste filtro.' })),
  );
}
