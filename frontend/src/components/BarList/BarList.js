import { h } from '../../utils/dom.js';

/** items: [{ label, total }]. A largura da barra é definida via CSSOM (compatível com a CSP). */
export function BarList({ title, items, emptyMessage = 'Sem dados.' }) {
  const max = Math.max(...items.map((item) => item.total), 1);

  const rows = items.map((item) => {
    const fill = h('span', { class: 'bars__fill' });
    fill.style.width = `${(item.total / max) * 100}%`;
    return h(
      'li',
      { class: 'bars__row' },
      h('span', { class: 'bars__label' }, item.label),
      h('span', { class: 'bars__track' }, fill),
      h('strong', { class: 'bars__value' }, String(item.total)),
    );
  });

  return h(
    'section',
    { class: 'card' },
    h('h3', { class: 'card__title' }, title),
    items.length === 0 ? h('p', { class: 'empty' }, emptyMessage) : h('ul', { class: 'bars' }, ...rows),
  );
}
