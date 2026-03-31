import { COLORS } from '../constants/GlobalStyles';
import { MOCK_EVENTS, MOCK_RANKINGS } from '../constants/MockData';

/**
 * Look up an event by ID from MOCK_EVENTS.
 * Used in: event/[id].js, event/register.js
 */
export const getEventById = (id) =>
  MOCK_EVENTS.find(e => e.id === id) || null;

/**
 * Get all events with status 'Complete'.
 * Used in: (tabs)/profile.js, profile/completed.js
 */
export const getCompletedEvents = () =>
  MOCK_EVENTS.filter(e => e.status === 'Complete');

/**
 * Get the current user's data from rankings.
 * Used in: (tabs)/profile.js, (tabs)/rank.js
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

/**
 * Calculate run progress percentage (0-100).
 * Used in: (tabs)/run.js, run/[id].js
 */
export const calcProgress = (current, target) =>
  target > 0 ? (current / target) * 100 : 0;

/**
 * Map event status to badge color, label text, and subtext.
 * Used in: (tabs)/index.js
 */
export const getStatusConfig = (status) => {
  switch (status) {
    case 'Open':     return { bg: COLORS.SUCCESS, text: 'REGISTER NOW', subText: 'Ends in' };
    case 'Ongoing':  return { bg: COLORS.PRIMARY_YELLOW, text: 'ONGOING', subText: 'Submit in' };
    case 'Complete': return { bg: COLORS.GRAY_400, text: 'FINISHED', subText: null };
    default:         return { bg: COLORS.GRAY_400, text: status, subText: null };
  }
};
