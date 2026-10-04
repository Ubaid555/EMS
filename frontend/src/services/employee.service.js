import apiClient from './api.client';

export const employeeService = {
  // 1. Basic Info Form (Singleton)
  async getBasicInfo() {
    const res = await apiClient.get('/employee/basic-info');
    return res?.data;
  },
  async updateBasicInfo(data) {
    const res = await apiClient.put('/employee/basic-info', data);
    return res?.data;
  },

  // 2. CNIC Form (Singleton)
  async getCnic() {
    const res = await apiClient.get('/employee/cnic');
    return res?.data;
  },
  async updateCnic(data) {
    const res = await apiClient.put('/employee/cnic', data);
    return res?.data;
  },

  // 3. Present Address (Singleton)
  async getPresentAddress() {
    const res = await apiClient.get('/employee/addresses/present');
    return res?.data;
  },
  async updatePresentAddress(data) {
    const res = await apiClient.put('/employee/addresses/present', data);
    return res?.data;
  },

  // 4. Permanent Address (Singleton)
  async getPermanentAddress() {
    const res = await apiClient.get('/employee/addresses/permanent');
    return res?.data;
  },
  async updatePermanentAddress(data) {
    const res = await apiClient.put('/employee/addresses/permanent', data);
    return res?.data;
  },

  // 5. Contacts (Multiple Data Collection)
  async getContacts() {
    const res = await apiClient.get('/employee/contacts');
    return res?.data || [];
  },
  async createContact(data) {
    const res = await apiClient.post('/employee/contacts', data);
    return res?.data;
  },
  async updateContact(id, data) {
    const res = await apiClient.put(`/employee/contacts/${id}`, data);
    return res?.data;
  },
  async deleteContact(id) {
    const res = await apiClient.delete(`/employee/contacts/${id}`);
    return res?.data;
  },

  // 6. Languages (Multiple Data Collection)
  async getLanguages() {
    const res = await apiClient.get('/employee/languages');
    return res?.data || [];
  },
  async createLanguage(data) {
    const res = await apiClient.post('/employee/languages', data);
    return res?.data;
  },
  async updateLanguage(id, data) {
    const res = await apiClient.put(`/employee/languages/${id}`, data);
    return res?.data;
  },
  async deleteLanguage(id) {
    const res = await apiClient.delete(`/employee/languages/${id}`);
    return res?.data;
  },
};

export default employeeService;
