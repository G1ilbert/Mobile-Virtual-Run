import axios from 'axios';
import { getToken, clearToken } from './storage';

const API_URL = 'https://virtual-run-production.up.railway.app/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach Firebase token to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  return config;
});

// Handle response errors
// IMPORTANT: Do NOT clear token on 401 for auth endpoints (login/register)
// because those endpoints are @Public() and the 401 means "not registered yet"
// which triggers auto-register flow. Clearing the token would break subsequent calls.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Only clear token for non-auth endpoints (actual expired token)
      await clearToken();
    }
    return Promise.reject(error);
  }
);

export { API_URL };
export default api;
