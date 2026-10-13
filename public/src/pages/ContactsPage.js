import { showToast } from '../components/Toast/Toast.js';
import { PAGE_SIZE, ROLES } from '../models/constants.js';
import * as contactService from '../services/contactService.js';
import { onRealtime } from '../services/realtimeService.js';
import { describeError } from '../utils/form.js';
import { ContactsView } from '../views/ContactsView.js';

export function mountContactsPage(container, { user }) {
  let active = true;
  let query = { page: 1, search: '' };

  const view = ContactsView({
    canCreate: user.role === ROLES.OPERATOR,
    onCreate: async (values) => {
      await contactService.create(values);
      showToast('Contato cadastrado com sucesso', 'success');
      query = { ...query, page: 1 };
      await load();
    },
    onSearch: (search) => {
      query = { page: 1, search };
      load();
    },
  });
  container.append(view.element);

  async function load() {
    try {
      const result = await contactService.list({ ...query, limit: PAGE_SIZE });
      if (!active) return;
      view.setList(result, (page) => {
        query = { ...query, page };
        load();
      });
    } catch (error) {
      if (active) showToast(describeError(error), 'error');
    }
  }

  load();
  // Admin vê novos contatos aparecerem na primeira página sem recarregar.
  const unsubscribe = onRealtime('contact:created', () => {
    if (query.page === 1 && !query.search) load();
  });

  return () => {
    active = false;
    unsubscribe();
  };
}
