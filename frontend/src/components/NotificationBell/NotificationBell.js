import { h } from '../../utils/dom.js';
import { formatDateTime } from '../../utils/format.js';

const MAX_ITEMS = 20;

export function createNotificationBell() {
  const items = [];
  let unread = 0;

  const badge = h('span', { class: 'bell__badge', hidden: true }, '0');
  const list = h('ul', { class: 'bell__list' });
  const panel = h(
    'div',
    { class: 'bell__panel', hidden: true },
    h('strong', {}, 'Notificações'),
    list,
  );
  const button = h(
    'button',
    { type: 'button', class: 'bell__button', 'aria-label': 'Notificações', onclick: toggle },
    '🔔',
    badge,
  );
  const element = h('div', { class: 'bell' }, button, panel);

  function renderList() {
    list.replaceChildren(
      ...(items.length === 0
        ? [h('li', { class: 'bell__empty' }, 'Nenhuma notificação')]
        : items.map((item) =>
            h(
              'li',
              { class: 'bell__item' },
              h('span', {}, item.message),
              h('small', {}, formatDateTime(item.at)),
            ),
          )),
    );
  }

  function updateBadge() {
    badge.textContent = String(unread);
    badge.hidden = unread === 0;
  }

  function toggle() {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      unread = 0;
      updateBadge();
    }
  }

  renderList();

  return {
    element,
    push(message) {
      items.unshift({ message, at: new Date().toISOString() });
      items.length = Math.min(items.length, MAX_ITEMS);
      if (panel.hidden) unread += 1;
      updateBadge();
      renderList();
    },
  };
}
