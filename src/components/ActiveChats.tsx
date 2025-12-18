'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Users, Eye, Bot, X } from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { adminAPI } from '@/services/api'
import { Chat } from '@/types/admin'
import { formatDistanceToNow } from 'date-fns'

export const ActiveChats = () => {
  const { chats, setChats, activeSessions, userTyping } = useAdminStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActiveChats()
  }, [])

  const loadActiveChats = async () => {
    try {
      const { chats: activeChats } = await adminAPI.getChats({
        status: 'active',
        limit: 10
      })
      setChats(activeChats)
    } catch (error) {
      console.error('Failed to load active chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewChat = (chat: Chat) => {
    // Navigate to chat details or open chat panel
    window.location.href = `/dashboard/chats/${chat.id}`
  }

  if (isLoading) {
    return (
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Chats
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const activeChats = chats.filter(chat => chat.isActive)

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Active Chats
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{activeSessions.length} online</span>
          </div>
          <button
            onClick={loadActiveChats}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        {activeChats.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No active chats</p>
          </div>
        ) : (
          activeChats.map((chat, index) => {
            const isOnline = activeSessions.includes(chat.sessionId)
            const isUserTyping = userTyping[chat.sessionId]

            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                onClick={() => handleViewChat(chat)}
              >
                {/* Avatar with status */}
                <div className="relative">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      Session {chat.sessionId.slice(0, 8)}...
                    </p>
                    <div className="flex items-center space-x-1">
                      {chat.isAIEnabled ? (
                        <Bot className="w-3 h-3 text-purple-500" title="AI Enabled" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400" title="AI Disabled" />
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {chat.messageCount} msgs
                      </span>
                    </div>
                  </div>

                  {/* Last message or typing indicator */}
                  <div className="flex items-center justify-between">
                    {isUserTyping ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          User is typing...
                        </span>
                      </div>
                    ) : chat.lastMessage ? (
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {chat.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        No messages yet
                      </p>
                    )}

                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center mt-1 space-x-2">
                    {isOnline && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Online
                      </span>
                    )}
                    {chat.userSession.ip && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {chat.userSession.ip}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewChat(chat)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })
        )}
      </div>

      {activeChats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => window.location.href = '/dashboard/chats'}
            className="w-full text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            View All Chats →
          </button>
        </div>
      )}
    </div>
  )
}