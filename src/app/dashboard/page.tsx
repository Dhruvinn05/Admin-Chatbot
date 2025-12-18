'use client'

import React from 'react'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  MessageSquare, 
  Activity, 
  TrendingUp,
  Clock,
  Bot
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { adminAPI } from '@/services/api'
import { StatsCard } from '@/components/StatsCard'
import { RecentActivity } from '@/components/RecentActivity'
import { ActiveChats } from '@/components/ActiveChats'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { stats, setStats } = useAdminStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const dashboardStats = await adminAPI.getDashboardStats()
      setStats(dashboardStats)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your chatbot performance and user interactions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Sessions"
          value={stats?.totalSessions || 0}
          change={stats?.todaySessions || 0}
          changeLabel="today"
          icon={<Users className="w-6 h-6" />}
          color="primary"
        />
        
        <StatsCard
          title="Active Chats"
          value={stats?.activeChats || 0}
          change={stats?.totalChats || 0}
          changeLabel="total"
          icon={<MessageSquare className="w-6 h-6" />}
          color="secondary"
        />
        
        <StatsCard
          title="Messages Today"
          value={stats?.todayMessages || 0}
          change={stats?.totalMessages || 0}
          changeLabel="total"
          icon={<Activity className="w-6 h-6" />}
          color="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RecentActivity />
        </motion.div>

        {/* Active Chats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ActiveChats />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="admin-card p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="admin-button admin-button-primary flex items-center justify-center space-x-2 py-3">
            <Bot className="w-4 h-4" />
            <span>AI Settings</span>
          </button>
          
          <button className="admin-button admin-button-secondary flex items-center justify-center space-x-2 py-3">
            <TrendingUp className="w-4 h-4" />
            <span>View Analytics</span>
          </button>
          
          <button className="admin-button admin-button-secondary flex items-center justify-center space-x-2 py-3">
            <Clock className="w-4 h-4" />
            <span>Chat History</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}