import { h } from '../../utils/dom.js';

let container = null;

function getContainer() {
  if (!container) {
    container = h('div', { class: 'toast-container', role: 'status', 'aria-live': 'polite' });
    document.body.append(container);
  }
  return container;
}

export function showToast(message, type = 'info', durationMs = 5000) {
  const toast = h('div', { class: `toast toast--${type}` }, message);
  getContainer().append(toast);
  setTimeout(() => toast.remove(), durationMs);
}
