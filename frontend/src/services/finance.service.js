import apiClient from './api.client';

export const financeService = {
  // Financial Summary
  async getSummary(year = null) {
    const params = year ? { year } : {};
    const res = await apiClient.get('/finance/summary', { params });
    return res?.data;
  },

  // Income Flow
  async getIncomes(year = null) {
    const params = year ? { year } : {};
    const res = await apiClient.get('/finance/incomes', { params });
    return res?.data || [];
  },
  async addIncome(data) {
    const res = await apiClient.post('/finance/incomes', data);
    return res?.data;
  },
  async updateIncome(id, data) {
    const res = await apiClient.put(`/finance/incomes/${id}`, data);
    return res?.data;
  },
  async deleteIncome(id) {
    const res = await apiClient.delete(`/finance/incomes/${id}`);
    return res?.data;
  },

  // Home Expenses Flow
  async getHomeExpenses(year = null) {
    const params = year ? { year } : {};
    const res = await apiClient.get('/finance/expenses/home', { params });
    return res?.data || [];
  },
  async addHomeExpense(data) {
    const res = await apiClient.post('/finance/expenses/home', data);
    return res?.data;
  },
  async updateHomeExpense(id, data) {
    const res = await apiClient.put(`/finance/expenses/home/${id}`, data);
    return res?.data;
  },
  async deleteHomeExpense(id) {
    const res = await apiClient.delete(`/finance/expenses/home/${id}`);
    return res?.data;
  },

  // Other Expenses Flow
  async getOtherExpenses(year = null) {
    const params = year ? { year } : {};
    const res = await apiClient.get('/finance/expenses/other', { params });
    return res?.data || [];
  },
  async addOtherExpense(data) {
    const res = await apiClient.post('/finance/expenses/other', data);
    return res?.data;
  },
  async updateOtherExpense(id, data) {
    const res = await apiClient.put(`/finance/expenses/other/${id}`, data);
    return res?.data;
  },
  async deleteOtherExpense(id) {
    const res = await apiClient.delete(`/finance/expenses/other/${id}`);
    return res?.data;
  },
};

export default financeService;
