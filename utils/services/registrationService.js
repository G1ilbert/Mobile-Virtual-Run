import api from '../api';

/**
 * Register for an event package
 * @param {object} data - { packageId, addressDetail?, subDistrictId?, itemVariants?: [{itemId, itemVariantId}] }
 * @returns {Promise<object>} registration
 */
export async function createRegistration(data) {
  const res = await api.post('/registrations', data);
  return res.data;
}

/**
 * Get current user's registrations
 * @returns {Promise<Array>}
 */
export async function getMyRegistrations() {
  const res = await api.get('/registrations/my');
  return res.data;
}

/**
 * Get registration by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getRegistrationById(id) {
  const res = await api.get(`/registrations/${id}`);
  return res.data;
}

/**
 * Cancel a registration (only if paymentStatus = pending)
 * @param {number} id
 * @param {string} reason
 * @returns {Promise<object>}
 */
export async function cancelRegistration(id, reason = '') {
  const res = await api.post(`/registrations/${id}/cancel`, { reason });
  return res.data;
}

/**
 * Update registration (address, etc.)
 * @param {number} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateRegistration(id, data) {
  const res = await api.patch(`/registrations/${id}/user-update`, data);
  return res.data;
}
