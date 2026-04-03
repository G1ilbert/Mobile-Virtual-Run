import api from '../api';

/**
 * Login with Firebase ID token
 * @param {string} idToken - Firebase ID token
 * @returns {Promise<{user: object}>}
 */
export async function loginWithToken(idToken) {
  const res = await api.post('/auth/login', { idToken });
  return res.data;
}

/**
 * Register new user with Firebase ID token
 * @param {string} idToken
 * @param {string} username
 * @param {string} email
 * @param {string|null} firstName
 * @param {string|null} lastName
 * @returns {Promise<{user: object}>}
 */
export async function registerUser(idToken, username, email, firstName = null, lastName = null) {
  const res = await api.post('/auth/register', {
    idToken, username, email, firstName, lastName,
  });
  return res.data;
}
