import api from '../api';

/**
 * Get PromptPay QR code for a registration
 * @param {number} registrationId
 * @returns {Promise<{qrCode: string, amount: number, promptpayName: string}>}
 */
export async function getPaymentQR(registrationId) {
  const res = await api.get(`/payments/qr/${registrationId}`);
  return res.data;
}

/**
 * Submit payment slip
 * @param {number} registrationId
 * @param {string} slipUrl - URL of the uploaded slip image
 * @returns {Promise<object>}
 */
export async function submitSlip(registrationId, slipUrl) {
  const res = await api.post(`/payments/${registrationId}/submit-slip`, { slipUrl });
  return res.data;
}

/**
 * Upload payment slip image via backend
 * @param {object} file - { uri, name, type }
 * @returns {Promise<{path: string}>}
 */
export async function uploadSlipImage(file) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'slip.jpg',
    type: file.type || 'image/jpeg',
  });
  const res = await api.post('/files/upload/slips', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
