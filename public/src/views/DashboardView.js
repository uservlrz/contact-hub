import { BarList } from '../components/BarList/BarList.js';
import { StatCard } from '../components/StatCard/StatCard.js';
import { categoryLabel } from '../models/constants.js';
import { h } from '../utils/dom.js';
import { formatDay } from '../utils/format.js';

export function DashboardView({ stats }) {
  const { totals } = stats;

  return h(
    'div',
    {},
    h('h2', { class: 'page-title' }, 'Dashboard'),
    h(
      'div',
      { class: 'grid grid--stats' },
      StatCard({ label: 'Contatos cadastrados', value: totals.contacts }),
      StatCard({ label: 'Cadastrados hoje', value: totals.today }),
      StatCard({ label: 'Solicitações pendentes', value: totals.pendingRequests }),
      StatCard({ label: 'Usuários ativos', value: totals.activeUsers }),
    ),
    h(
      'div',
      { class: 'grid grid--charts' },
      BarList({
        title: 'Contatos por dia (7 dias)',
        items: stats.perDay.map((item) => ({ label: formatDay(item.label), total: item.total })),
      }),
      BarList({
        title: 'Por categoria',
        items: stats.byCategory.map((item) => ({ label: categoryLabel(item.label), total: item.total })),
      }),
      BarList({ title: 'Top estados', items: stats.byState }),
      BarList({ title: 'Por operador', items: stats.byOperator }),
    ),
  );
}
