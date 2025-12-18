import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'
import { useAdminStore } from '@/store/adminStore'
import { AdminSocketEvents, Message } from '@/types/admin'
import toast from 'react-hot-toast'

export const useAdminSocket = () => {
  const socketRef = useRef<Socket | null>(null)
  const { admin, token, isAuthenticated } = useAuthStore()
  const {
    setActiveSessions,
    addActiveSession,
    removeActiveSession,
    addMessage,
    setUserTyping,
    toggleAI
  } = useAdminStore()

  useEffect(() => {
    if (!isAuthenticated || !admin || !token) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
    
    // Initialize socket connection
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    const socket = socketRef.current

    // Connection events
    socket.on('connect', () => {
      console.log('Admin socket connected:', socket.id)
      
      // Connect as admin
      socket.emit('admin:connect', {
        adminId: admin.id,
        token
      })
    })

    socket.on('disconnect', () => {
      console.log('Admin socket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('Admin socket connection error:', error)
      toast.error('Connection error. Please refresh the page.')
    })

    // Admin events
    socket.on('admin:connected', (data: { activeSessions: string[] }) => {
      console.log('Admin connected, active sessions:', data.activeSessions)
      setActiveSessions(data.activeSessions)
    })

    // User events
    socket.on('user:connected', (data: { sessionId: string; socketId: string; timestamp: string }) => {
      console.log('User connected:', data.sessionId)
      addActiveSession(data.sessionId)
      toast.success(`New user connected: ${data.sessionId.slice(0, 8)}...`)
    })

    socket.on('user:disconnected', (data: { sessionId: string; timestamp: string }) => {
      console.log('User disconnected:', data.sessionId)
      removeActiveSession(data.sessionId)
      setUserTyping(data.sessionId, false)
    })

    socket.on('user:message', (message: Message & { sessionId: string; chatId: string }) => {
      console.log('User message received:', message)
      addMessage(message)
      toast(`New message from ${message.sessionId.slice(0, 8)}...`, {
        icon: '💬',
      })
    })

    socket.on('user:typing', (data: { sessionId: string; isTyping: boolean }) => {
      setUserTyping(data.sessionId, data.isTyping)
    })

    // AI events
    socket.on('ai:message', (message: Message & { sessionId: string; chatId: string }) => {
      console.log('AI message:', message)
      addMessage(message)
    })

    socket.on('ai:toggled', (data: { chatId: string; enabled: boolean }) => {
      console.log('AI toggled:', data)
      toggleAI(data.chatId, data.enabled)
    })

    // Error handling
    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message)
      toast.error(data.message)
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [isAuthenticated, admin, token, setActiveSessions, addActiveSession, removeActiveSession, addMessage, setUserTyping, toggleAI])

  // Socket methods
  const sendReply = (sessionId: string, chatId: string, content: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('admin:reply', { sessionId, chatId, content })
    }
  }

  const startTyping = (sessionId: string, chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:start', { sessionId, chatId })
    }
  }

  const stopTyping = (sessionId: string, chatId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', { sessionId, chatId })
    }
  }

  const toggleChatAI = (chatId: string, enabled: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('admin:toggle-ai', { chatId, enabled })
    }
  }

  return {
    socket: socketRef.current,
    sendReply,
    startTyping,
    stopTyping,
    toggleChatAI,
    isConnected: socketRef.current?.connected || false
  }
}