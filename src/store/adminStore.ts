import { create } from 'zustand'
import { Chat, ChatDetails, DashboardStats, Message } from '@/types/admin'

interface AdminState {
  // Dashboard
  stats: DashboardStats | null
  
  // Chats
  chats: Chat[]
  selectedChat: ChatDetails | null
  activeSessions: string[]
  
  // UI State
  sidebarOpen: boolean
  darkMode: boolean
  
  // Real-time data
  userTyping: Record<string, boolean> // sessionId -> isTyping
  
  // Actions
  setStats: (stats: DashboardStats) => void
  setChats: (chats: Chat[]) => void
  setSelectedChat: (chat: ChatDetails | null) => void
  addMessage: (message: Message & { sessionId: string; chatId: string }) => void
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  setActiveSessions: (sessions: string[]) => void
  addActiveSession: (sessionId: string) => void
  removeActiveSession: (sessionId: string) => void
  setSidebarOpen: (open: boolean) => void
  setDarkMode: (dark: boolean) => void
  setUserTyping: (sessionId: string, isTyping: boolean) => void
  
  // Chat management
  toggleAI: (chatId: string, enabled: boolean) => void
  closeChat: (chatId: string) => void
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  stats: null,
  chats: [],
  selectedChat: null,
  activeSessions: [],
  sidebarOpen: true,
  darkMode: false,
  userTyping: {},

  // Actions
  setStats: (stats) => set({ stats }),
  
  setChats: (chats) => set({ chats }),
  
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  
  addMessage: (message) => set((state) => {
    // Update selected chat if it matches
    if (state.selectedChat && state.selectedChat.id === message.chatId) {
      return {
        selectedChat: {
          ...state.selectedChat,
          messages: [...state.selectedChat.messages, message]
        }
      }
    }
    
    // Update chat in list
    const updatedChats = state.chats.map(chat => {
      if (chat.id === message.chatId) {
        return {
          ...chat,
          lastMessage: message,
          messageCount: chat.messageCount + 1,
          updatedAt: message.timestamp
        }
      }
      return chat
    })
    
    return { chats: updatedChats }
  }),
  
  updateChat: (chatId, updates) => set((state) => ({
    chats: state.chats.map(chat => 
      chat.id === chatId ? { ...chat, ...updates } : chat
    ),
    selectedChat: state.selectedChat?.id === chatId 
      ? { ...state.selectedChat, ...updates }
      : state.selectedChat
  })),
  
  setActiveSessions: (sessions) => set({ activeSessions: sessions }),
  
  addActiveSession: (sessionId) => set((state) => ({
    activeSessions: [...new Set([...state.activeSessions, sessionId])]
  })),
  
  removeActiveSession: (sessionId) => set((state) => ({
    activeSessions: state.activeSessions.filter(s => s !== sessionId)
  })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setDarkMode: (dark) => set({ darkMode: dark }),
  
  setUserTyping: (sessionId, isTyping) => set((state) => ({
    userTyping: {
      ...state.userTyping,
      [sessionId]: isTyping
    }
  })),
  
  toggleAI: (chatId, enabled) => set((state) => ({
    chats: state.chats.map(chat => 
      chat.id === chatId ? { ...chat, isAIEnabled: enabled } : chat
    ),
    selectedChat: state.selectedChat?.id === chatId 
      ? { ...state.selectedChat, isAIEnabled: enabled }
      : state.selectedChat
  })),
  
  closeChat: (chatId) => set((state) => ({
    chats: state.chats.map(chat => 
      chat.id === chatId ? { ...chat, isActive: false } : chat
    ),
    selectedChat: state.selectedChat?.id === chatId 
      ? { ...state.selectedChat, isActive: false }
      : state.selectedChat
  }))
}))