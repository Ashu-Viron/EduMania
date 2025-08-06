export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'USER' | 'CONSULTANT';
  createdAt: string;
  updatedAt: string;
  phone?: string;
  company?: string;
  notifications?: NotificationSettings;
}


export interface ConsultantDashboardStats {
  totalConsultations: number;
  upcomingConsultations: number;
  totalHours: number;
  monthlyStats: { name: string; count: number }[];
}
// Add this new interface to your types file
export interface ConsultantListItem {
  id: string;
  name: string;
  avatar?: string;
  ConsultantProfile: {
    id: string;
    bio?: string;
    specialties: string[];
    hourlyRate?: number;
    isAvailable: boolean;
  };
}

// FIX: Updated to correctly reflect the nested 'user' data
export interface ConsultantProfile {
  id: string;
  bio?: string;
  specialties: string[];
  hourlyRate?: number;
  isAvailable: boolean;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
}

export interface Estimate {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  amount: number;
  estimatedDuration: string;
  clientName: string;
  clientEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  title: string;
  description: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  duration: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  consultantId: string;
  user: {
    name: string;
    avatar?: string;
  };
  consultant: {
    id: string;
    user: {
      name: string;
      avatar?: string;
    };
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

export interface ConsultantRegisterCredentials extends RegisterCredentials {
  bio: string;
  specialties: string[];
}

export interface DashboardStats {
  totalEstimates: number;
  pendingEstimates: number;
  totalConsultations: number;
  completedConsultations: number;
  totalEarnings: number;
  monthlyGrowth: number;
  estimateStatusStats: { name: string; value: number }[];
}

export interface Notification {
  id: string;
  title: string;
  read: boolean;
  createdAt: string;
}

export type NotificationSettings = {
  email: boolean;
  push: boolean;
  sms: boolean;
  newEstimates: boolean;
  estimateUpdates: boolean;
  newConsultations: boolean;
  consultationReminders: boolean;
};

// NEW: Interfaces for real-time call signaling
export interface CallSession {
  id: string;
  consultationId: string;
  initiatorId: string;
  calleeId: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED';
  createdAt: string;
  updatedAt: string;
}

export interface CallOfferPayload {
  consultationId: string;
  offer: RTCSessionDescriptionInit;
}

export interface CallAnswerPayload {
  consultationId: string;
  answer: RTCSessionDescriptionInit;
}