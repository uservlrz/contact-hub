import { h } from '../../utils/dom.js';

export function StatCard({ label, value, hint }) {
  return h(
    'article',
    { class: 'stat-card' },
    h('span', { class: 'stat-card__label' }, label),
    h('strong', { class: 'stat-card__value' }, String(value)),
    hint && h('small', { class: 'stat-card__hint' }, hint),
  );
}
