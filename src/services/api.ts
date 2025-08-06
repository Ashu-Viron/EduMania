import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Estimate,
  Consultation,
  DashboardStats,
  Notification,
  NotificationSettings,
  ConsultantProfile,
  ConsultantRegisterCredentials,
  ConsultantDashboardStats,
  ConsultantListItem
} from '../types';

const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const SOCKET_BASE_URL = isProduction ? window.location.origin : 'http://localhost:3002';

export const getSocketUrl = () => SOCKET_BASE_URL;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const OriginalRequest = error.config;
    if (error.response?.status === 401 && !OriginalRequest._retry) {
      OriginalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        const response = await authAPI.refreshToken(refreshToken);
        useAuthStore.getState().setTokens(
          response.accessToken,
          response.refreshToken
        );
        OriginalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        return api(OriginalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  registerConsultant: async (credentials: ConsultantRegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/consultant', credentials);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.patch('/auth/password', data);
  },

  updateNotificationSettings: async (settings: NotificationSettings) => {
    await api.patch('/auth/notifications', settings);
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const consultantsAPI = {
  getAll: async (): Promise<ConsultantListItem[]> => {
    const response = await api.get('/consultants');
    return response.data;
  },
  getById: async (id: string): Promise<ConsultantProfile> => {
    const response = await api.get(`/consultants/${id}`);
    return response.data;
  },
  // NEW: Dedicated endpoint for getting the logged-in consultant's profile
  getProfileForUser: async (userId: string): Promise<ConsultantProfile> => {
    const response = await api.get(`/consultants/profile`);
    return response.data;
  },
  updateProfile: async (data: Partial<ConsultantProfile>) => {
    const response = await api.patch('/consultants/profile', data);
    return response.data;
  },
};

// In the dashboardAPI section
export const dashboardAPI = {
  getUserStats: async (): Promise<DashboardStats> => {
    const response = await api.get(`/dashboard/user-stats`);
    return response.data;
  },
  getConsultantStats: async (): Promise<ConsultantDashboardStats> => {
    const response = await api.get(`/dashboard/consultant-stats`);
    return response.data;
  },
};

export const estimatesAPI = {
  getAll: async (): Promise<Estimate[]> => {
    const response = await api.get('/estimates');
    return response.data;
  },
  getById: async (id: string): Promise<Estimate> => {
    const response = await api.get(`/estimates/${id}`);
    return response.data;
  },
  create: async (data: any): Promise<Estimate> => {
    const response = await api.post('/estimates', data);
    return response.data;
  },
  update: async (id: string, data: any): Promise<Estimate> => {
    const response = await api.patch(`/estimates/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: string, status: Estimate['status']): Promise<Estimate> => {
    const response = await api.patch(`/estimates/${id}/status`, { status });
    return response.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/estimates/${id}`);
  },
};

export const consultationsAPI = {
  getAll: async (): Promise<Consultation[]> => {
    const response = await api.get('/consultations');
    // FIX: Remove manual status mapping, let backend handle it
    return response.data;
  },
  getAllForConsultant: async (): Promise<Consultation[]> => {
    const response = await api.get('/consultations/for-consultant');
    // FIX: Remove manual status mapping, let backend handle it
    return response.data;
  },
  // FIX: This method will now return a Consultation object directly
  getById: async (id: string): Promise<Consultation> => {
    const response = await api.get(`/consultations/${id}`);
    return response.data;
  },
  updateStatus: async (id: string, status: Consultation['status']): Promise<Consultation> => {
    const response = await api.patch(`/consultations/${id}/status`, { status });
    return response.data;
  },
  addNotes: async (id: string, notes: string): Promise<Consultation> => {
    const response = await api.patch(`/consultations/${id}/notes`, { notes });
    return response.data;
  },
  create: async (data: any): Promise<Consultation> => {
    const response = await api.post('/consultations', data);
    return response.data;
  },
  update: async (id: string, data: any): Promise<Consultation> => {
    const response = await api.patch(`/consultations/${id}`, data);
    return response.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/consultations/${id}`);
  },
};

export const notificationAPI = {
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
  getall: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
  create: async (title: string): Promise<void> => {
    await api.post('/notifications', { title });
  },
};

// NEW: API for real-time video/voice call signaling
export const realtimeAPI = {
  createCall: async (consultationId: string, type: 'video' | 'voice') => {
    const response = await api.post(`/realtime/calls/create`, { consultationId, type });
    return response.data;
  },
  getCallToken: async (callId: string) => {
    const response = await api.post(`/realtime/calls/${callId}/token`);
    return response.data;
  },
};