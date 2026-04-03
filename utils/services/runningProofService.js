import api from '../api';

/**
 * Upload running proof image via backend
 * @param {object} file - { uri, name, type }
 * @returns {Promise<{path: string}>}
 */
export async function uploadProofImage(file) {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name || 'proof.jpg',
    type: file.type || 'image/jpeg',
  });
  const res = await api.post('/files/upload/running-proofs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/**
 * Create a running proof
 * @param {object} data - { imageUrl, distance, duration? }
 * @returns {Promise<object>}
 */
export async function createRunningProof(data) {
  const res = await api.post('/running-proofs', data);
  return res.data;
}

/**
 * Create a running result (link proof to registration)
 * @param {object} data - { registrationId, runningProofId }
 * @returns {Promise<object>}
 */
export async function createRunningResult(data) {
  const res = await api.post('/running-results', data);
  return res.data;
}

/**
 * Get user's running proofs
 * @returns {Promise<Array>}
 */
export async function getMyRunningProofs() {
  const res = await api.get('/running-proofs/my');
  return res.data;
}

/**
 * Get user's running results
 * @returns {Promise<Array>}
 */
export async function getMyRunningResults() {
  const res = await api.get('/running-results/my');
  return res.data;
}
