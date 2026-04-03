import api from '../api';

/**
 * Get current user profile
 * @returns {Promise<object>}
 */
export async function getMyProfile() {
  const res = await api.get('/users/me');
  return res.data;
}

/**
 * Update current user profile
 * @param {object} data - { firstName?, lastName?, phoneNumber?, addressDetail?, subDistrictId? }
 * @returns {Promise<object>}
 */
export async function updateProfile(data) {
  const res = await api.patch('/users/me', data);
  return res.data;
}
