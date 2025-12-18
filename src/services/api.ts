import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { LoginCredentials, AuthResponse, DashboardStats, Chat, ChatDetails } from '@/types/admin'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
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
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/admin/login', credentials)
    return response.data
  },

  createDefaultAdmin: async () => {
    const response = await api.post('/auth/admin/create-default')
    return response.data
  }
}

// Admin API
export const adminAPI = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard/stats')
    return response.data.data
  },

  getChats: async (params: {
    page?: number
    limit?: number
    status?: 'all' | 'active' | 'inactive'
  } = {}): Promise<{
    chats: Chat[]
    pagination: any
  }> => {
    const response = await api.get('/admin/chats', { params })
    return response.data.data
  },

  getChatDetails: async (chatId: string, params: {
    page?: number
    limit?: number
  } = {}): Promise<ChatDetails> => {
    const response = await api.get(`/admin/chats/${chatId}`, { params })
    return response.data.data
  },

  toggleChatAI: async (chatId: string, enabled: boolean) => {
    const response = await api.patch(`/admin/chats/${chatId}/ai`, { enabled })
    return response.data.data
  },

  closeChat: async (chatId: string) => {
    const response = await api.patch(`/admin/chats/${chatId}/close`)
    return response.data.data
  },

  getRecentActivity: async (limit: number = 20) => {
    const response = await api.get('/admin/activity', { params: { limit } })
    return response.data.data
  },

  // Users API
  getUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data.data || []
  },

  // Activity API
  getActivityStats: async (timeRange: string = '7d') => {
    const response = await api.get('/admin/activity/stats', { params: { timeRange } })
    return response.data.data || {
      totalMessages: 0,
      totalSessions: 0,
      todayMessages: 0,
      todaySessions: 0,
      hourlyStats: [],
      dailyStats: []
    }
  },

  // AI Settings API
  getAISettings: async () => {
    const response = await api.get('/admin/ai/settings')
    return response.data.data || {
      enabled: true,
      autoReply: true,
      responseDelay: 2000,
      maxTokens: 150,
      temperature: 0.7,
      model: 'gpt-3.5-turbo',
      systemPrompt: 'You are a helpful customer support assistant. Be friendly, professional, and concise in your responses.',
      fallbackEnabled: true,
      fallbackMessage: 'Thank you for your message! Our team will get back to you shortly.'
    }
  },

  updateAISettings: async (settings: any) => {
    const response = await api.put('/admin/ai/settings', settings)
    return response.data.data
  },

  testAI: async (message: string) => {
    const response = await api.post('/admin/ai/test', { message })
    return response.data.data || { message: 'AI test response would appear here.' }
  },

  // Admin Settings API
  getAdminSettings: async () => {
    const response = await api.get('/admin/settings')
    return response.data.data || {
      profile: {
        name: 'Admin User',
        email: 'admin@chatbot.com',
        avatar: ''
      },
      notifications: {
        newMessages: true,
        newUsers: true,
        systemAlerts: true,
        emailNotifications: false
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      appearance: {
        darkMode: false,
        sidebarCollapsed: false,
        language: 'en',
        timezone: 'UTC'
      }
    }
  },

  updateAdminSettings: async (settings: any) => {
    const response = await api.put('/admin/settings', settings)
    return response.data.data
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/admin/change-password', {
      currentPassword,
      newPassword
    })
    return response.data.data
  },

  // Messages API
  sendMessage: async (chatId: string, message: string) => {
    const response = await api.post(`/admin/chats/${chatId}/messages`, {
      content: message,
      sender: 'admin'
    })
    return response.data.data
  }
}

export default api