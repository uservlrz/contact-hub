import { h } from '../../utils/dom.js';

export function Pagination({ meta, onChange }) {
  const { page, totalPages, total } = meta;

  const goTo = (target) => () => onChange(target);
  const pageButton = (target) =>
    h(
      'button',
      {
        type: 'button',
        class: 'pagination__button',
        'aria-current': target === page ? 'page' : null,
        onclick: goTo(target),
      },
      String(target),
    );

  return h(
    'nav',
    { class: 'pagination', 'aria-label': 'Paginação' },
    h('span', { class: 'pagination__summary' }, `${total} registro(s)`),
    h('button', { type: 'button', class: 'pagination__button', disabled: page <= 1, onclick: goTo(page - 1) }, '‹ Anterior'),
    ...Array.from({ length: totalPages }, (_, index) => pageButton(index + 1)),
    h('button', { type: 'button', class: 'pagination__button', disabled: page >= totalPages, onclick: goTo(page + 1) }, 'Próxima ›'),
  );
}
