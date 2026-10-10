import axios, { AxiosError } from 'axios';

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://ecowaste-management-system.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_waste_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ||
        'An unexpected error occurred.';

      if (status === 401) {
        const currentPath = window.location.pathname;

        if (
          !currentPath.includes('/login') &&
          !currentPath.includes('/register') &&
          currentPath !== '/'
        ) {
          localStorage.removeItem('smart_waste_token');
          localStorage.removeItem('smart_waste_user');
          window.location.href = '/login?expired=true';
        }
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(
        new Error(
          'Cannot connect to the server. Please ensure the backend is running.'
        )
      );
    }

    return Promise.reject(error);
  }
);

export default api;