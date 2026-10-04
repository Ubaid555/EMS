import apiClient from './api.client';

/**
 * Authentication Service
 * Communicates with backend /api/v1/auth routes
 */
export const authService = {
  /**
   * Log in employee
   * POST /api/v1/auth/login
   * @param {{ role: string, subCategory?: string, assignedNumber: string, password: string }} credentials
   */
  async login(credentials) {
    const payload = {
      role: credentials.role,
      subCategory: credentials.role === 'TEACHER' ? credentials.subCategory : null,
      assignedNumber: String(credentials.assignedNumber).trim(),
      password: credentials.password,
    };
    const res = await apiClient.post('/auth/login', payload);
    return res?.data;
  },

  /**
   * Register new employee
   * POST /api/v1/auth/register
   * @param {{ role: string, subCategory?: string, assignedNumber: string, email?: string, password: string }} data
   */
  async register(data) {
    const payload = {
      role: data.role,
      subCategory: data.role === 'TEACHER' ? data.subCategory : null,
      assignedNumber: String(data.assignedNumber).trim(),
      email: data.email ? String(data.email).trim().toLowerCase() : '',
      password: data.password,
    };
    const res = await apiClient.post('/auth/register', payload);
    return res?.data;
  },

  /**
   * Fetch currently authenticated employee
   * GET /api/v1/auth/me
   */
  async getCurrentEmployee() {
    const res = await apiClient.get('/auth/me');
    return res?.data;
  },

  /**
   * Log out employee & clear cookies
   * POST /api/v1/auth/logout
   */
  async logout() {
    const res = await apiClient.post('/auth/logout');
    return res?.data;
  },
};

export default authService;
