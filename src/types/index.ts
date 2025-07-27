export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Estimate {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  amount: number
  estimatedDuration: string
  clientName: string
  clientEmail: string
  createdAt: string
  updatedAt: string
}

export interface Consultation {
  id: string
  title: string
  description: string
  status: 'scheduled' | 'completed' | 'cancelled'
  consultantName: string
  scheduledAt: string
  duration: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

export interface DashboardStats {
  totalEstimates: number
  pendingEstimates: number
  totalConsultations: number
  completedConsultations: number
  totalEarnings: number
  monthlyGrowth: number
}