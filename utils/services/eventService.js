import api from '../api';

/**
 * Get paginated public events with smart sorting
 * @param {number} page
 * @param {number} limit
 * @param {string} search
 * @returns {Promise<{data: Array, meta: {total, page, limit, totalPages, hasMore}}>}
 */
export async function getPublicEvents(page = 1, limit = 10, search = '') {
  const params = { page, limit };
  if (search) params.search = search;
  const res = await api.get('/events/public', { params });
  return res.data;
}

/**
 * Get most popular currently-open event
 * @returns {Promise<object|null>}
 */
export async function getPopularEvent() {
  const res = await api.get('/events/public/popular');
  return res.data;
}

/**
 * Get event by ID with full details
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getEventById(id) {
  const res = await api.get(`/events/${id}`);
  return res.data;
}

/**
 * Get packages for an event
 * @param {number} eventId
 * @returns {Promise<Array>}
 */
export async function getEventPackages(eventId) {
  const res = await api.get(`/packages/event/${eventId}`);
  return res.data;
}

/**
 * Get items for an event (with variants)
 * @param {number} eventId
 * @returns {Promise<Array>}
 */
export async function getEventItems(eventId) {
  const res = await api.get(`/items/event/${eventId}`);
  return res.data;
}
