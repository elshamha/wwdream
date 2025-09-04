import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Different URLs for different environments
const getApiUrl = () => {
  // First try to use the configured URL from app.json
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Fallback URLs based on platform
  if (Platform.OS === 'android') {
    // For Android emulator
    return 'http://10.0.2.2:8000';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator
    return 'http://localhost:8000';
  } else {
    // For web or other platforms
    return 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiUrl();
console.log('API Base URL:', API_BASE_URL);

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
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/api-token-auth/`);
      console.log('Username:', username);
      
      const response = await this.client.post('/api-token-auth/', {
        username,
        password,
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        console.log('Token saved successfully');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      throw error;
    }
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

  async reorderChapter(projectId, chapterId, newOrder) {
    console.log(`Reordering chapter ${chapterId} to position ${newOrder} in project ${projectId}`);
    const response = await this.client.post(`/writer/projects/${projectId}/chapters/${chapterId}/order/`, { 
      order: newOrder 
    });
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

  // Project management methods
  async createProject(projectData) {
    try {
      console.log('Creating project with data:', projectData);
      const response = await this.client.post('/writer/api/projects/', projectData);
      console.log('Project created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Project creation failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // Collaboration methods
  async getCollaborators(projectId) {
    console.log(`Getting collaborators for project ${projectId}`);
    const response = await this.client.get(`/writer/projects/${projectId}/collaborators/`);
    return response.data;
  }

  async inviteCollaborator(projectId, email) {
    console.log(`Inviting ${email} to project ${projectId}`);
    const response = await this.client.post(`/writer/projects/${projectId}/collaborators/invite/`, {
      email: email
    });
    return response.data;
  }

  async removeCollaborator(projectId, collaboratorId) {
    console.log(`Removing collaborator ${collaboratorId} from project ${projectId}`);
    const response = await this.client.delete(`/writer/projects/${projectId}/collaborators/${collaboratorId}/`);
    return response.data;
  }

  async getProjectShareLink(projectId) {
    console.log(`Getting share link for project ${projectId}`);
    const response = await this.client.get(`/writer/projects/${projectId}/share/`);
    return response.data;
  }

  async updateCollaboratorRole(projectId, collaboratorId, role) {
    console.log(`Updating collaborator ${collaboratorId} role to ${role} in project ${projectId}`);
    const response = await this.client.put(`/writer/projects/${projectId}/collaborators/${collaboratorId}/`, {
      role: role
    });
    return response.data;
  }

  // Test connection method
  async testConnection() {
    try {
      console.log('Testing connection to:', API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/api-token-auth/`, {
        timeout: 5000
      });
      console.log('Connection test response:', response.status);
      return { success: true, url: API_BASE_URL };
    } catch (error) {
      console.error('Connection test failed:', {
        url: API_BASE_URL,
        error: error.message,
        code: error.code
      });
      return { 
        success: false, 
        url: API_BASE_URL,
        error: error.message 
      };
    }
  }
}

export default new ApiService();