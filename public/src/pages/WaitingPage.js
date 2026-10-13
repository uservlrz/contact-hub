import { REGISTRATION_STATUS } from '../models/constants.js';
import { watchRegistration } from '../services/realtimeService.js';
import * as registrationService from '../services/registrationService.js';
import { WaitingApprovalView } from '../views/WaitingApprovalView.js';

/** Espera a decisão do admin via WebSocket: não depende de reload nem de polling. */
export function mountWaitingPage(container, { navigate }) {
  const pending = registrationService.recallPending();
  if (!pending) {
    navigate('/login');
    return undefined;
  }

  const backToLogin = () => {
    registrationService.forgetPending();
    navigate('/login');
  };
  const render = (status) =>
    container.replaceChildren(WaitingApprovalView({ status, onBackToLogin: backToLogin }));

  render(REGISTRATION_STATUS.PENDING);
  return watchRegistration(pending, { onStatus: render, onInvalid: backToLogin });
}
