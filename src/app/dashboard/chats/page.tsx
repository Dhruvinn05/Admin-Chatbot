'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Search, 
  Filter,
  Clock,
  User,
  Bot,
  Send
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { adminAPI } from '@/services/api'
import { Chat, ChatDetails } from '@/types/admin'
import toast from 'react-hot-toast'

export default function ChatsPage() {
  const { chats, setChats } = useAdminStore()
  const [selectedChat, setSelectedChat] = useState<ChatDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const response = await adminAPI.getChats()
      setChats(response.chats)
    } catch (error) {
      console.error('Failed to load chats:', error)
      toast.error('Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatDetails = async (chat: Chat) => {
    try {
      const chatDetails = await adminAPI.getChatDetails(chat.id)
      setSelectedChat(chatDetails)
    } catch (error) {
      console.error('Failed to load chat details:', error)
      toast.error('Failed to load chat details')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    try {
      await adminAPI.sendMessage(selectedChat.id, newMessage)
      setNewMessage('')
      toast.success('Message sent!')
      // Reload chat details to get updated conversation
      await loadChatDetails(selectedChat)
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chat.userSession.ip && chat.userSession.ip.includes(searchTerm))
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chat Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all customer conversations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button className="admin-button admin-button-secondary flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <div className="admin-card h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Chats ({filteredChats.length})
              </h3>
            </div>
            <div className="overflow-y-auto h-full">
              {filteredChats.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No chats found</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredChats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => loadChatDetails(chat)}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-colors
                        ${selectedChat?.id === chat.id 
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {chat.sessionId.slice(0, 8)}...
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(chat.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{chat.userSession.ip}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {chat.messageCount} messages
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Conversation */}
        <div className="lg:col-span-2">
          <div className="admin-card h-full flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Chat with {selectedChat.sessionId.slice(0, 8)}...
                      </h3>
                      <p className="text-sm text-gray-500">
                        Started {new Date(selectedChat.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        {selectedChat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                          ${message.sender === 'USER'
                            ? 'bg-primary-500 text-white'
                            : message.isAI
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          {message.sender === 'USER' ? (
                            <User className="w-3 h-3" />
                          ) : message.isAI ? (
                            <Bot className="w-3 h-3" />
                          ) : (
                            <MessageSquare className="w-3 h-3" />
                          )}
                          <span className="text-xs opacity-75">
                            {message.sender === 'USER' ? 'User' : message.isAI ? 'AI' : 'Admin'}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-75">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="Type your reply..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="admin-button admin-button-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a chat to view conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose a chat from the list to start managing the conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}