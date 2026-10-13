export const ROLES = Object.freeze({
  ADMIN: 'admin',
  OPERATOR: 'operator',
});

export const REGISTRATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const REGISTRATION_STATUS_LABELS = Object.freeze({
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
});

export const CONTACT_CATEGORIES = Object.freeze([
  { value: 'lead', label: 'Lead' },
  { value: 'client', label: 'Cliente' },
  { value: 'partner', label: 'Parceiro' },
]);

export const BR_STATES = Object.freeze([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]);

export const ACTIVITY_LABELS = Object.freeze({
  'auth.login_success': 'Login realizado',
  'auth.login_failed': 'Tentativa de login falhou',
  'auth.refresh_reuse_detected': 'Reuso de token detectado',
  'registration.submitted': 'Solicitação de cadastro enviada',
  'registration.approved': 'Solicitação aprovada',
  'registration.rejected': 'Solicitação rejeitada',
  'user.created': 'Usuário criado',
  'user.activated': 'Usuário ativado',
  'user.deactivated': 'Usuário desativado',
  'contact.created': 'Contato cadastrado',
});

export const PAGE_SIZE = 10;

export const categoryLabel = (value) =>
  CONTACT_CATEGORIES.find((category) => category.value === value)?.label ?? value;

export const roleLabel = (role) => (role === ROLES.ADMIN ? 'Administrador' : 'Operador');

export const homeRouteFor = (role) => (role === ROLES.ADMIN ? '/dashboard' : '/contatos');
