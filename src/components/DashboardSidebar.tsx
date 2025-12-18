'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Bot,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chats', href: '/dashboard/chats', icon: MessageSquare },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { name: 'AI Settings', href: '/dashboard/ai', icon: Bot },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export const DashboardSidebar = () => {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useAdminStore()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          width: sidebarOpen ? 256 : 64,
          x: 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`
          fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                ChatBot Admin
              </span>
            </motion.div>
          )}
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  sidebar-item
                  ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                  ${!sidebarOpen ? 'justify-center' : ''}
                `}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3"
                  >
                    {item.name}
                  </motion.span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Admin Dashboard v1.0
            </div>
          </motion.div>
        )}
      </motion.div>
    </>
  )
}