'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  MessageSquare, 
  Users,
  Clock,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { adminAPI } from '@/services/api'
import toast from 'react-hot-toast'

interface ActivityData {
  totalMessages: number
  totalSessions: number
  todayMessages: number
  todaySessions: number
  hourlyStats: Array<{
    hour: number
    messages: number
    sessions: number
  }>
  dailyStats: Array<{
    date: string
    messages: number
    sessions: number
  }>
}

export default function ActivityPage() {
  const [activityData, setActivityData] = useState<ActivityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // 24h, 7d, 30d

  useEffect(() => {
    loadActivityData()
  }, [timeRange])

  const loadActivityData = async () => {
    try {
      const data = await adminAPI.getActivityStats(timeRange)
      setActivityData(data)
    } catch (error) {
      console.error('Failed to load activity data:', error)
      toast.error('Failed to load activity data')
    } finally {
      setIsLoading(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor user engagement and system performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activityData?.totalMessages || 0}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{activityData?.todayMessages || 0} today
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-card p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activityData?.totalSessions || 0}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{activityData?.todaySessions || 0} today
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="admin-card p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Messages/Session</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {activityData?.totalSessions ? Math.round((activityData.totalMessages / activityData.totalSessions) * 10) / 10 : 0}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Per conversation
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="admin-card p-6"
        >
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">98.5%</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Excellent
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="admin-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Message Activity
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {timeRange === '24h' ? (
              // Hourly chart for 24h
              activityData?.hourlyStats?.slice(0, 12).map((stat, index) => (
                <div key={stat.hour} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.hour}:00
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((stat.messages / Math.max(...(activityData?.hourlyStats?.map(s => s.messages) || [1]))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stat.messages}
                  </span>
                </div>
              ))
            ) : (
              // Daily chart for 7d/30d
              activityData?.dailyStats?.slice(0, 7).map((stat, index) => (
                <div key={stat.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((stat.messages / Math.max(...(activityData?.dailyStats?.map(s => s.messages) || [1]))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stat.messages}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Session Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="admin-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session Distribution
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">New Users</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">65%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Returning Users</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
            </div>
            
            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-l-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="admin-card"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity Feed
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {[
              { type: 'message', user: 'User #1234', action: 'sent a message', time: '2 minutes ago', icon: MessageSquare },
              { type: 'session', user: 'User #5678', action: 'started a new session', time: '5 minutes ago', icon: Users },
              { type: 'message', user: 'Admin', action: 'replied to User #1234', time: '7 minutes ago', icon: MessageSquare },
              { type: 'session', user: 'User #9012', action: 'ended session', time: '12 minutes ago', icon: Clock },
              { type: 'message', user: 'AI Bot', action: 'auto-replied to User #3456', time: '15 minutes ago', icon: Activity },
            ].map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`
                    p-2 rounded-lg
                    ${activity.type === 'message' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}
                  `}>
                    <Icon className={`
                      w-4 h-4
                      ${activity.type === 'message' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}
                    `} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}