'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, User, Bot, Clock } from 'lucide-react'
import { adminAPI } from '@/services/api'
import { Message } from '@/types/admin'
import { formatDistanceToNow } from 'date-fns'

export const RecentActivity = () => {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      const data = await adminAPI.getRecentActivity(10)
      setActivities(data)
    } catch (error) {
      console.error('Failed to load recent activity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (sender: string) => {
    switch (sender) {
      case 'USER':
        return <User className="w-4 h-4 text-blue-500" />
      case 'ADMIN':
        return <MessageSquare className="w-4 h-4 text-green-500" />
      case 'AI':
        return <Bot className="w-4 h-4 text-purple-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const getSenderLabel = (sender: string) => {
    switch (sender) {
      case 'USER':
        return 'User'
      case 'ADMIN':
        return 'Admin'
      case 'AI':
        return 'AI Assistant'
      default:
        return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <div className="admin-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button
          onClick={loadRecentActivity}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.sender)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getSenderLabel(activity.sender)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {activity.content}
                </p>
                
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Session: {activity.chat.sessionId.slice(0, 8)}...
                  </span>
                  {activity.isAI && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      AI
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}