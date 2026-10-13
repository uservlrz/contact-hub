import * as contactRepository from '../repositories/contactRepository.js';
import * as registrationRepository from '../repositories/registrationRepository.js';
import * as userRepository from '../repositories/userRepository.js';

const DAYS_WINDOW = 7;
const TOP_LIMIT = 5;

export async function getOverview() {
  const [summary, perDay, byCategory, byState, byOperator, pendingRequests, activeUsers] =
    await Promise.all([
      contactRepository.getSummary(),
      contactRepository.countPerDay(DAYS_WINDOW),
      contactRepository.countByCategory(),
      contactRepository.countByState(TOP_LIMIT),
      contactRepository.countByOperator(TOP_LIMIT),
      registrationRepository.countPending(),
      userRepository.countActive(),
    ]);

  return {
    totals: { contacts: summary.total, today: summary.today, pendingRequests, activeUsers },
    perDay,
    byCategory,
    byState,
    byOperator,
  };
}
