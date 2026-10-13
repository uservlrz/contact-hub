import { DataTable } from '../components/DataTable/DataTable.js';
import { Pagination } from '../components/Pagination/Pagination.js';
import { ACTIVITY_LABELS } from '../models/constants.js';
import { h } from '../utils/dom.js';
import { formatDateTime } from '../utils/format.js';

const COLUMNS = [
  { header: 'Quando', render: (entry) => formatDateTime(entry.createdAt) },
  { header: 'Evento', render: (entry) => ACTIVITY_LABELS[entry.action] ?? entry.action },
  { header: 'Responsável', render: (entry) => entry.actorName ?? 'Anônimo' },
  { header: 'Detalhes', render: (entry) => Object.values(entry.metadata ?? {}).join(' · ') || '—' },
  { header: 'IP', render: (entry) => entry.ip ?? '—' },
];

export function ActivityView({ result, onPageChange }) {
  return h(
    'div',
    {},
    h('h2', { class: 'page-title' }, 'Atividade da aplicação'),
    h(
      'div',
      { class: 'card' },
      DataTable({ columns: COLUMNS, rows: result.data, emptyMessage: 'Nenhuma atividade registrada.' }),
      Pagination({ meta: result.meta, onChange: onPageChange }),
    ),
  );
}
