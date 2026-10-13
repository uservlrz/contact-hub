import { showToast } from '../components/Toast/Toast.js';
import * as adminService from '../services/adminService.js';
import { PAGE_SIZE } from '../models/constants.js';
import { describeError } from '../utils/form.js';
import { ActivityView } from '../views/ActivityView.js';

export function mountActivityPage(container) {
  let active = true;

  async function load(page = 1) {
    try {
      const result = await adminService.getActivity({ page, limit: PAGE_SIZE });
      if (active) container.replaceChildren(ActivityView({ result, onPageChange: load }));
    } catch (error) {
      if (active) showToast(describeError(error), 'error');
    }
  }

  load();
  return () => {
    active = false;
  };
}
