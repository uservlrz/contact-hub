import { createLayout } from './components/Layout/Layout.js';
import { homeRouteFor } from './models/constants.js';
import { routes } from './routes.js';
import * as authService from './services/authService.js';
import * as sessionStore from './services/sessionStore.js';

/** Router por hash com guardas de autenticação e papel (RBAC no cliente; o servidor é a autoridade). */
export function createRouter(root) {
  let layout = null;
  let unmountCurrent = null;
  let renderId = 0;

  const navigate = (path) => {
    if (window.location.hash === `#${path}`) render();
    else window.location.hash = path;
  };

  function destroyLayout() {
    layout?.destroy();
    layout = null;
  }

  function ensureLayout(user) {
    if (layout) return layout;
    layout = createLayout({
      user,
      navItems: routes.filter((route) => route.nav && route.roles.includes(user.role)),
      onLogout: () => authService.logout(),
    });
    root.replaceChildren(layout.element);
    return layout;
  }

  function resolveRedirect(route, user) {
    if (!route) return user ? homeRouteFor(user.role) : '/login';
    if (route.isPublic) return user ? homeRouteFor(user.role) : null;
    if (!user) return '/login';
    return route.roles.includes(user.role) ? null : homeRouteFor(user.role);
  }

  async function render() {
    const currentRender = ++renderId;
    const path = window.location.hash.slice(1) || '/';
    const user = sessionStore.getUser();
    const route = routes.find((candidate) => candidate.path === path);

    const redirect = resolveRedirect(route, user);
    if (redirect) return navigate(redirect);

    unmountCurrent?.();
    unmountCurrent = null;

    let target;
    if (route.isPublic) {
      destroyLayout();
      root.replaceChildren();
      target = root;
    } else {
      const shell = ensureLayout(user);
      shell.setActive(path);
      shell.outlet.replaceChildren();
      target = shell.outlet;
    }

    const unmount = await route.mount(target, { navigate, user });
    if (currentRender === renderId) unmountCurrent = unmount ?? null;
    else unmount?.();
    return undefined;
  }

  return {
    start() {
      window.addEventListener('hashchange', render);
      // Sessão encerrada (logout, expiração, usuário desativado): volta ao login.
      sessionStore.subscribe(({ user }) => {
        if (!user) {
          destroyLayout();
          navigate('/login');
        }
      });
      render();
    },
  };
}
