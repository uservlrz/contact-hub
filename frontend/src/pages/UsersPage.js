import { showToast } from '../components/Toast/Toast.js';
import * as userService from '../services/userService.js';
import { describeError } from '../utils/form.js';
import { UsersView } from '../views/UsersView.js';

export function mountUsersPage(container, { user }) {
  let active = true;

  async function load() {
    try {
      const users = await userService.list();
      if (!active) return;
      container.replaceChildren(
        UsersView({
          users,
          currentUserId: user.id,
          onCreate: async (values) => {
            await userService.create(values);
            showToast('Usuário cadastrado com sucesso', 'success');
            await load();
          },
          onToggleActive: async (target) => {
            try {
              await userService.setActive(target.id, !target.active);
              await load();
            } catch (error) {
              showToast(describeError(error), 'error');
            }
          },
        }),
      );
    } catch (error) {
      if (active) showToast(describeError(error), 'error');
    }
  }

  load();
  return () => {
    active = false;
  };
}
