import api from '../api';

/**
 * Get user's shipments
 * @returns {Promise<Array>}
 */
export async function getMyShipments() {
  const res = await api.get('/shipments/my');
  return res.data;
}

/**
 * Get shipment by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function getShipmentById(id) {
  const res = await api.get(`/shipments/${id}`);
  return res.data;
}

/**
 * Confirm delivery (user confirms receiving shipment)
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function confirmDelivery(id) {
  const res = await api.patch(`/shipments/${id}/confirm-delivery`);
  return res.data;
}
