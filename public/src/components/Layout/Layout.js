import { ROLES, roleLabel } from '../../models/constants.js';
import * as contactService from '../../services/contactService.js';
import { connectRealtime, disconnectRealtime, onRealtime } from '../../services/realtimeService.js';
import { h } from '../../utils/dom.js';
import { createNotificationBell } from '../NotificationBell/NotificationBell.js';
import { showToast } from '../Toast/Toast.js';

/**
 * Casca da área autenticada: navegação, usuário, logout e (para admin)
 * notificações em tempo real. Vive enquanto a sessão estiver ativa.
 */
export function createLayout({ user, navItems, onLogout }) {
  const outlet = h('main', { class: 'layout__content', id: 'content' });
  const unsubscribers = [];

  const links = navItems.map((item) =>
    h('a', { class: 'nav__link', href: `#${item.path}`, 'data-path': item.path }, item.title),
  );

  const actions = h('div', { class: 'layout__actions' });
  if (user.role === ROLES.ADMIN) {
    const bell = createNotificationBell();
    actions.append(bell.element);
    connectRealtime(user.realtimeChannel);
    unsubscribers.push(
      onRealtime('contact:created', async ({ id }) => {
        try {
          const contact = await contactService.get(id);
          const message = `${contact.createdByName} cadastrou o contato ${contact.name}`;
          bell.push(message);
          showToast(message, 'success');
        } catch {
          bell.push('Novo contato cadastrado');
        }
      }),
      onRealtime('registration:created', () => {
        const message = 'Nova solicitação de acesso recebida';
        bell.push(message);
        showToast(message);
      }),
    );
  }

  actions.append(
    h('span', { class: 'layout__user' }, `${user.name} · ${roleLabel(user.role)}`),
    h('button', { type: 'button', class: 'button button--ghost', onclick: onLogout }, 'Sair'),
  );

  const element = h(
    'div',
    { class: 'layout' },
    h(
      'header',
      { class: 'layout__header' },
      h('strong', { class: 'layout__brand' }, 'Contact Hub'),
      h('nav', { class: 'nav', 'aria-label': 'Principal' }, ...links),
      actions,
    ),
    outlet,
  );

  return {
    element,
    outlet,
    setActive(path) {
      links.forEach((link) => {
        const active = link.getAttribute('data-path') === path;
        link.setAttribute('aria-current', active ? 'page' : 'false');
      });
    },
    destroy() {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      disconnectRealtime();
      element.remove();
    },
  };
}
