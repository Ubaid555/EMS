import axios from 'axios';
import { AppApiError, parseApiError } from '@/utils/api-error';
import { ENV } from '@/config/env.config';

/**
 * Enterprise Axios API Client
 * - Targets backend baseURL from .env (VITE_API_BASE_URL)
 * - Sends HTTP-Only cookies withCredentials: true
 * - Automatically handles 401 token refresh queue
 * - Unwraps ApiResponse and throws uniform AppApiError
 */
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Flag & queue to prevent duplicate refresh calls when multiple requests 401 at the same time
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Custom headers or trace IDs can be attached here
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Unpack data if backend sent ApiResponse standard format: { success, statusCode, data, message }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if 401 Unauthorized and not already retried
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call backend refresh endpoint (cookies sent automatically)
        await axios.post(`${ENV.API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Optional custom event for auth listeners (e.g. AuthContext)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
        return Promise.reject(new AppApiError('Session expired. Please log in again.', 401));
      } finally {
        isRefreshing = false;
      }
    }

    // Standardize error into AppApiError
    const parsed = parseApiError(error);
    return Promise.reject(new AppApiError(parsed.message, parsed.status, parsed.errors, parsed.fieldErrors));
  }
);

export default apiClient;
