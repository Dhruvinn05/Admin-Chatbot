'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
}

export const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  color 
}: StatsCardProps) => {
  const colorClasses = {
    primary: 'bg-primary-500 text-primary-100',
    secondary: 'bg-secondary-500 text-secondary-100',
    success: 'bg-green-500 text-green-100',
    warning: 'bg-yellow-500 text-yellow-100',
    danger: 'bg-red-500 text-red-100'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="admin-card p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(value)}
          </p>
          
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <div className="flex items-center text-sm">
                {change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`font-medium ${
                  change > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatNumber(Math.abs(change))}
                </span>
                {changeLabel && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    {changeLabel}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}