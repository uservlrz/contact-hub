import { showToast } from '../components/Toast/Toast.js';
import * as adminService from '../services/adminService.js';
import { onRealtime } from '../services/realtimeService.js';
import { debounce } from '../utils/dom.js';
import { describeError } from '../utils/form.js';
import { DashboardView } from '../views/DashboardView.js';

const RELOAD_DEBOUNCE_MS = 300;

export function mountDashboardPage(container) {
  let active = true;

  async function load() {
    try {
      const stats = await adminService.getDashboard();
      if (active) container.replaceChildren(DashboardView({ stats }));
    } catch (error) {
      if (active) showToast(describeError(error), 'error');
    }
  }

  load();
  const unsubscribe = onRealtime('dashboard:changed', debounce(load, RELOAD_DEBOUNCE_MS));
  const unsubscribeRequests = onRealtime('registration:created', debounce(load, RELOAD_DEBOUNCE_MS));

  return () => {
    active = false;
    unsubscribe();
    unsubscribeRequests();
  };
}
