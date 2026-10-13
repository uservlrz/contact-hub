import { ROLES } from './models/constants.js';
import { mountActivityPage } from './pages/ActivityPage.js';
import { mountContactsPage } from './pages/ContactsPage.js';
import { mountDashboardPage } from './pages/DashboardPage.js';
import { mountLoginPage } from './pages/LoginPage.js';
import { mountRequestsPage } from './pages/RequestsPage.js';
import { mountUsersPage } from './pages/UsersPage.js';
import { mountWaitingPage } from './pages/WaitingPage.js';

const ALL = [ROLES.ADMIN, ROLES.OPERATOR];
const ADMIN_ONLY = [ROLES.ADMIN];

/** Tabela de rotas: `roles` define quem acessa; `nav` define se aparece no menu. */
export const routes = [
  { path: '/login', mount: mountLoginPage, isPublic: true },
  { path: '/aguardando', mount: mountWaitingPage, isPublic: true },
  { path: '/dashboard', mount: mountDashboardPage, roles: ADMIN_ONLY, title: 'Dashboard', nav: true },
  { path: '/contatos', mount: mountContactsPage, roles: ALL, title: 'Contatos', nav: true },
  { path: '/solicitacoes', mount: mountRequestsPage, roles: ADMIN_ONLY, title: 'Solicitações', nav: true },
  { path: '/usuarios', mount: mountUsersPage, roles: ADMIN_ONLY, title: 'Usuários', nav: true },
  { path: '/atividade', mount: mountActivityPage, roles: ADMIN_ONLY, title: 'Atividade', nav: true },
];
