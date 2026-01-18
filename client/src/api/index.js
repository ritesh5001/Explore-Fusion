import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;
if (!baseUrl) {
  throw new Error('❌ VITE_API_BASE_URL is missing');
}

const toast = (message, type = 'info', timeoutMs) => {
  try {
    window.dispatchEvent(new CustomEvent('fusion:toast', { detail: { message, type, timeoutMs } }));
  } catch {
    // noop
  }
};

const API = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
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
