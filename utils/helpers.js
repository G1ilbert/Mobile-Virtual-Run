import { MOCK_RANKINGS } from '../constants/MockData';

/**
 * Get the current user's data from rankings.
 * Used in: (tabs)/rank.js
 */
export const getCurrentUser = () =>
  MOCK_RANKINGS.find(r => r.name === 'You') || MOCK_RANKINGS[0];

/**
 * Get the current user's rank (1-based index).
 * Used in: (tabs)/rank.js
 */
export const getCurrentUserRank = () => {
  const user = getCurrentUser();
  return MOCK_RANKINGS.findIndex(r => r.id === user?.id) + 1;
};
