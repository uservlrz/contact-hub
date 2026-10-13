import { h } from '../../utils/dom.js';

/** columns: [{ header, render: (row) => Node | string }] */
export function DataTable({ columns, rows, emptyMessage = 'Nenhum registro encontrado.' }) {
  if (rows.length === 0) return h('p', { class: 'empty' }, emptyMessage);

  return h(
    'div',
    { class: 'table-wrapper' },
    h(
      'table',
      { class: 'table' },
      h('thead', {}, h('tr', {}, ...columns.map((column) => h('th', { scope: 'col' }, column.header)))),
      h(
        'tbody',
        {},
        ...rows.map((row) => h('tr', {}, ...columns.map((column) => h('td', {}, column.render(row))))),
      ),
    ),
  );
}
