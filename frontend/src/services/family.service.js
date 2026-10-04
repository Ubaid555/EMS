import apiClient from './api.client';

export const familyService = {
  // Family Summary Overview
  async getSummary() {
    const res = await apiClient.get('/family/summary');
    return res?.data;
  },

  // -------------------------------------------------------------
  // Spouses Flow
  // -------------------------------------------------------------
  async getSpouses() {
    const res = await apiClient.get('/family/spouses');
    return res?.data || [];
  },
  async addSpouse(data) {
    const res = await apiClient.post('/family/spouses', data);
    return res?.data;
  },
  async updateSpouse(id, data) {
    const res = await apiClient.put(`/family/spouses/${id}`, data);
    return res?.data;
  },
  async deleteSpouse(id) {
    const res = await apiClient.delete(`/family/spouses/${id}`);
    return res?.data;
  },

  // Spouse CNIC
  async getSpouseCnic(spouseId) {
    const res = await apiClient.get(`/family/spouses/${spouseId}/cnic`);
    return res?.data;
  },
  async saveSpouseCnic(spouseId, data) {
    const res = await apiClient.post(`/family/spouses/${spouseId}/cnic`, data);
    return res?.data;
  },

  // Spouse Passport
  async getSpousePassport(spouseId) {
    const res = await apiClient.get(`/family/spouses/${spouseId}/passport`);
    return res?.data;
  },
  async saveSpousePassport(spouseId, data) {
    const res = await apiClient.post(`/family/spouses/${spouseId}/passport`, data);
    return res?.data;
  },

  // Spouse Education
  async getSpouseEducations(spouseId) {
    const res = await apiClient.get(`/family/spouses/${spouseId}/education`);
    return res?.data || [];
  },
  async addSpouseEducation(spouseId, data) {
    const res = await apiClient.post(`/family/spouses/${spouseId}/education`, data);
    return res?.data;
  },
  async deleteSpouseEducation(spouseId, id) {
    const res = await apiClient.delete(`/family/spouses/${spouseId}/education/${id}`);
    return res?.data;
  },

  // -------------------------------------------------------------
  // Children Flow
  // -------------------------------------------------------------
  async getChildren() {
    const res = await apiClient.get('/family/children');
    return res?.data || [];
  },
  async addChild(data) {
    const res = await apiClient.post('/family/children', data);
    return res?.data;
  },
  async updateChild(id, data) {
    const res = await apiClient.put(`/family/children/${id}`, data);
    return res?.data;
  },
  async deleteChild(id) {
    const res = await apiClient.delete(`/family/children/${id}`);
    return res?.data;
  },
  async getChildCnic(childId) {
    const res = await apiClient.get(`/family/children/${childId}/cnic`);
    return res?.data;
  },
  async saveChildCnic(childId, data) {
    const res = await apiClient.post(`/family/children/${childId}/cnic`, data);
    return res?.data;
  },

  // -------------------------------------------------------------
  // Parents Flow
  // -------------------------------------------------------------
  async getParents() {
    const res = await apiClient.get('/family/parents');
    return res?.data || [];
  },
  async addParent(data) {
    const res = await apiClient.post('/family/parents', data);
    return res?.data;
  },
  async updateParent(id, data) {
    const res = await apiClient.put(`/family/parents/${id}`, data);
    return res?.data;
  },
  async deleteParent(id) {
    const res = await apiClient.delete(`/family/parents/${id}`);
    return res?.data;
  },
  async getParentCnic(parentId) {
    const res = await apiClient.get(`/family/parents/${parentId}/cnic`);
    return res?.data;
  },
  async saveParentCnic(parentId, data) {
    const res = await apiClient.post(`/family/parents/${parentId}/cnic`, data);
    return res?.data;
  },
};

export default familyService;
