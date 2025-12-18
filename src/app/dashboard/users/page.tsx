'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter,
  MapPin,
  Globe,
  Clock,
  MessageSquare,
  Activity
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { adminAPI } from '@/services/api'
import toast from 'react-hot-toast'

interface UserSession {
  id: string
  sessionId: string
  ip: string
  userAgent: string
  createdAt: string
  updatedAt: string
  _count: {
    chats: number
    messages: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const usersData = await adminAPI.getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return { name: 'Chrome', icon: '🌐' }
    if (userAgent.includes('Firefox')) return { name: 'Firefox', icon: '🦊' }
    if (userAgent.includes('Safari')) return { name: 'Safari', icon: '🧭' }
    if (userAgent.includes('Edge')) return { name: 'Edge', icon: '🌊' }
    return { name: 'Unknown', icon: '❓' }
  }

  const getDeviceType = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return 'Mobile'
    if (userAgent.includes('Tablet')) return 'Tablet'
    return 'Desktop'
  }

  const filteredUsers = users.filter(user =>
    user.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.ip.includes(searchTerm)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage user sessions and activity
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="admin-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Today</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {users.filter(u => new Date(u.updatedAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Chats</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {users.reduce((sum, user) => sum + (user._count?.chats || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Countries</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {new Set(users.map(u => u.ip.split('.')[0])).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Sessions ({filteredUsers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Seen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const browser = getBrowserInfo(user.userAgent)
                  const deviceType = getDeviceType(user.userAgent)
                  
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.sessionId.slice(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">{user.ip}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Unknown Location</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{browser.icon}</span>
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">{browser.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{deviceType}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 text-blue-500 mr-1" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {user._count?.chats || 0} chats
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {user._count?.messages || 0} messages
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(user.updatedAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(user.updatedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                          View Chats
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          Block
                        </button>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}