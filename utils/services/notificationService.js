import api from '../api';

/**
 * Get user's notifications
 * @returns {Promise<Array>}
 */
export async function getMyNotifications() {
  const res = await api.get('/notifications/my');
  return res.data;
}

/**
 * Get unread notification count
 * @returns {Promise<{count: number}>}
 */
export async function getUnreadCount() {
  const res = await api.get('/notifications/unread-count');
  return res.data;
}

/**
 * Mark notification as read
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function markAsRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

/**
 * Mark all notifications as read
 * @returns {Promise<object>}
 */
export async function markAllAsRead() {
  const res = await api.patch('/notifications/read-all');
  return res.data;
}
