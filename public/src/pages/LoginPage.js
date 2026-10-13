import { homeRouteFor } from '../models/constants.js';
import * as authService from '../services/authService.js';
import * as registrationService from '../services/registrationService.js';
import { getUser } from '../services/sessionStore.js';
import { LoginView } from '../views/LoginView.js';

export function mountLoginPage(container, { navigate }) {
  const view = LoginView({
    onLogin: async ({ email, password }) => {
      await authService.login(email, password);
      navigate(homeRouteFor(getUser().role));
    },
    onRequestAccess: async (values) => {
      registrationService.rememberPending(await registrationService.submit(values));
      navigate('/aguardando');
    },
  });

  container.append(view);
}
