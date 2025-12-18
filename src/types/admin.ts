export interface Admin {
  id: string
  email: string
  name?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data: {
    token: string
    admin: Admin
  }
}

export interface Message {
  id: string
  content: string
  sender: 'USER' | 'ADMIN' | 'AI'
  timestamp: string
  isAI?: boolean
  metadata?: any
}

export interface Chat {
  id: string
  sessionId: string
  isActive: boolean
  isAIEnabled: boolean
  messageCount: number
  lastMessage?: Message | null
  userSession: {
    sessionId: string
    ip?: string
    userAgent?: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface ChatDetails extends Chat {
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

export interface DashboardStats {
  totalSessions: number
  todaySessions: number
  totalChats: number
  activeChats: number
  totalMessages: number
  todayMessages: number
}

export interface AdminSocketEvents {
  // Admin events
  'admin:connect': (data: { adminId: string; token: string }) => void
  'admin:reply': (data: { sessionId: string; content: string; chatId: string }) => void
  'admin:toggle-ai': (data: { chatId: string; enabled: boolean }) => void
  'typing:start': (data: { sessionId: string; chatId: string }) => void
  'typing:stop': (data: { sessionId: string; chatId: string }) => void
  
  // Server events
  'admin:connected': (data: { activeSessions: string[] }) => void
  'user:connected': (data: { sessionId: string; socketId: string; timestamp: string }) => void
  'user:disconnected': (data: { sessionId: string; timestamp: string }) => void
  'user:message': (message: Message & { sessionId: string; chatId: string }) => void
  'user:typing': (data: { sessionId: string; isTyping: boolean }) => void
  'admin:message': (message: Message & { sessionId: string; chatId: string }) => void
  'ai:message': (message: Message & { sessionId: string; chatId: string }) => void
  'ai:toggled': (data: { chatId: string; enabled: boolean }) => void
  'error': (data: { message: string }) => void
  'connect': () => void
  'disconnect': () => void
}