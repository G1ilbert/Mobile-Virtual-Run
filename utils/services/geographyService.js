import api from '../api';

/**
 * Get all provinces
 * @returns {Promise<Array<{id, nameTh, nameEn}>>}
 */
export async function getProvinces() {
  const res = await api.get('/provinces');
  return res.data;
}

/**
 * Get districts by province ID
 * @param {number} provinceId
 * @returns {Promise<Array<{id, nameTh, nameEn, provinceId}>>}
 */
export async function getDistricts(provinceId) {
  const res = await api.get('/districts', { params: { provinceId } });
  return res.data;
}

/**
 * Get sub-districts by district ID
 * @param {number} districtId
 * @returns {Promise<Array<{id, nameTh, nameEn, postalCode, districtId}>>}
 */
export async function getSubDistricts(districtId) {
  const res = await api.get('/sub-districts', { params: { districtId } });
  return res.data;
}
