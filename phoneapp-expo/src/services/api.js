import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.0.20:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/token/', {
      username,
      password,
    });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/writer/register/', userData);
    return response.data;
  },

  getUserProfile: async () => {
    const response = await api.get('/writer/api/users/');
    return response.data;
  },
};

export const projectsAPI = {
  getProjects: async () => {
    const response = await api.get('/writer/api/projects/');
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post('/writer/api/projects/', projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await api.put(`/writer/api/projects/${id}/`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    await api.delete(`/writer/api/projects/${id}/`);
  },
};

export const documentsAPI = {
  getDocuments: async () => {
    const response = await api.get('/writer/api/documents/');
    return response.data;
  },

  createDocument: async (documentData) => {
    const response = await api.post('/writer/api/documents/', documentData);
    return response.data;
  },

  updateDocument: async (id, documentData) => {
    const response = await api.put(`/writer/api/documents/${id}/`, documentData);
    return response.data;
  },

  deleteDocument: async (id) => {
    await api.delete(`/writer/api/documents/${id}/`);
  },
};

export default api;