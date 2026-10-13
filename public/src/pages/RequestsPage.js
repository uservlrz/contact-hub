import { showToast } from '../components/Toast/Toast.js';
import { REGISTRATION_STATUS } from '../models/constants.js';
import { onRealtime } from '../services/realtimeService.js';
import * as registrationService from '../services/registrationService.js';
import { describeError } from '../utils/form.js';
import { RequestsView } from '../views/RequestsView.js';

export function mountRequestsPage(container) {
  let active = true;
  let filter = REGISTRATION_STATUS.PENDING;

  async function load() {
    try {
      const requests = await registrationService.list(filter);
      if (!active) return;
      container.replaceChildren(
        RequestsView({
          requests,
          filter,
          onFilter: (value) => {
            filter = value;
            load();
          },
          onApprove: (request) => decide(registrationService.approve, request, 'aprovada'),
          onReject: (request) => {
            if (window.confirm(`Rejeitar a solicitação de ${request.name}?`)) {
              decide(registrationService.reject, request, 'rejeitada');
            }
          },
        }),
      );
    } catch (error) {
      if (active) showToast(describeError(error), 'error');
    }
  }

  async function decide(action, request, label) {
    try {
      await action(request.id);
      showToast(`Solicitação de ${request.name} ${label}`, 'success');
    } catch (error) {
      showToast(describeError(error), 'error');
    }
    await load();
  }

  load();
  const unsubscribers = [
    onRealtime('registration:created', load),
    onRealtime('registration:resolved', load),
  ];

  return () => {
    active = false;
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}
