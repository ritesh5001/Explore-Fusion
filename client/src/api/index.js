import axios from 'axios';

const normalizeApiBaseUrl = (raw) => {
  if (!raw) return raw;
  const base = String(raw).replace(/\/$/, '');
  if (base === '/api/v1' || base.endsWith('/api/v1')) return base;
  return `${base}/api/v1`;
};

const toast = (message, type = 'info', timeoutMs) => {
  try {
    window.dispatchEvent(new CustomEvent('fusion:toast', { detail: { message, type, timeoutMs } }));
  } catch {
    // noop
  }
};

const API = axios.create({
  // In production, never default to localhost. Prefer env override; otherwise use same-origin.
  baseURL:
    normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
    (import.meta.env.DEV ? 'http://localhost:5050/api/v1' : '/api/v1'),
  withCredentials: false,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('fusion:auth'));
      toast('Session expired. Please log in again.', 'error');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (!status) {
      // Network / CORS / offline
      toast('Network error. Check your connection and try again.', 'error');
    } else if (status >= 500) {
      toast('Server error. Please try again shortly.', 'error');
    }
    return Promise.reject(error);
  }
);

export default API;
