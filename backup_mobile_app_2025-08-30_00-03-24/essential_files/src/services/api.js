import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:8000';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          // You might want to navigate to login screen here
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(username, password) {
    const response = await this.client.post('/api-token-auth/', {
      username,
      password,
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
  }

  async register(username, email, password) {
    const response = await this.client.post('/api/register/', {
      username,
      email,
      password,
    });
    
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  }

  // Bookshelf methods
  async getBookshelfProjects() {
    console.log('Making API request to /writer/projects/api/list/?bookshelf_only=true');
    const response = await this.client.get('/writer/projects/api/list/?bookshelf_only=true');
    console.log('API response status:', response.status);
    console.log('API response data keys:', Object.keys(response.data || {}));
    return response.data;
  }

  async getProject(projectId) {
    const response = await this.client.get(`/writer/api/projects/${projectId}/`);
    return response.data;
  }

  async getProjectChapters(projectId) {
    console.log(`Making API request to /writer/projects/${projectId}/chapters/list/`);
    const response = await this.client.get(`/writer/projects/${projectId}/chapters/list/`);
    console.log('Chapters API response status:', response.status);
    console.log('Chapters API response data keys:', Object.keys(response.data || {}));
    console.log('Chapters API response data:', response.data);
    return response.data;
  }

  async getChapter(projectId, chapterId) {
    const response = await this.client.get(`/writer/api/chapters/${chapterId}/`);
    return response.data;
  }

  async updateChapter(chapterId, data) {
    const response = await this.client.put(`/writer/api/chapters/${chapterId}/`, data);
    return response.data;
  }

  async createChapter(projectId, data) {
    console.log(`Making API request to /writer/projects/${projectId}/chapters/create/`);
    console.log('Request data:', data);
    const response = await this.client.post(`/writer/projects/${projectId}/chapters/create/`, data);
    console.log('Create chapter API response:', response.data);
    return response.data;
  }

  // Auto-save functionality
  async autoSave(chapterId, content) {
    try {
      await this.client.post('/writer/auto-save/', {
        chapter_id: chapterId,
        content: content,
      });
    } catch (error) {
      console.log('Auto-save failed:', error);
    }
  }

  async getUserProfile() {
    const response = await this.client.get('/writer/api/users/');
    return response.data;
  }
}

export default new ApiService();