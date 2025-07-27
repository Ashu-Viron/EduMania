import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  Estimate,
  Consultation,
  DashboardStats,
} from '../types'

const API_BASE_URL = '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

// Dashboard API
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
}

// Estimates API
export const estimatesAPI = {
  getAll: async (): Promise<Estimate[]> => {
    const response = await api.get('/estimates')
    return response.data
  },

  getById: async (id: string): Promise<Estimate> => {
    const response = await api.get(`/estimates/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: Estimate['status']): Promise<Estimate> => {
    const response = await api.patch(`/estimates/${id}/status`, { status })
    return response.data
  },
}

// Consultations API
export const consultationsAPI = {
  getAll: async (): Promise<Consultation[]> => {
    const response = await api.get('/consultations')
     return response.data.map((consultation: any) => ({
      ...consultation,
      status: consultation.status.toLowerCase() as Consultation['status']
    }));
  },

  getById: async (id: string): Promise<Consultation> => {
    const response = await api.get(`/consultations/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: Consultation['status']): Promise<Consultation> => {
    const response = await api.patch(`/consultations/${id}/status`, { status })
    return response.data
  },

  addNotes: async (id: string, notes: string): Promise<Consultation> => {
    const response = await api.patch(`/consultations/${id}/notes`, { notes })
    return response.data
  },
}