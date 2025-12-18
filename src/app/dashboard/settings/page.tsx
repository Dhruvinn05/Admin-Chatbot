'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Moon,
  Sun
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { adminAPI } from '@/services/api'
import toast from 'react-hot-toast'

interface AdminSettings {
  profile: {
    name: string
    email: string
    avatar: string
  }
  notifications: {
    newMessages: boolean
    newUsers: boolean
    systemAlerts: boolean
    emailNotifications: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    passwordExpiry: number
  }
  appearance: {
    darkMode: boolean
    sidebarCollapsed: boolean
    language: string
    timezone: string
  }
}

export default function SettingsPage() {
  const { darkMode, setDarkMode } = useAdminStore()
  const { user } = useAuthStore()
  const [settings, setSettings] = useState<AdminSettings>({
    profile: {
      name: 'Admin User',
      email: 'admin@chatbot.com',
      avatar: ''
    },
    notifications: {
      newMessages: true,
      newUsers: true,
      systemAlerts: true,
      emailNotifications: false
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    appearance: {
      darkMode: false,
      sidebarCollapsed: false,
      language: 'en',
      timezone: 'UTC'
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const adminSettings = await adminAPI.getAdminSettings()
      setSettings(adminSettings)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await adminAPI.updateAdminSettings(settings)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      await adminAPI.changePassword(passwordData.currentPassword, passwordData.newPassword)
      toast.success('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Failed to change password')
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !settings.appearance.darkMode
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, darkMode: newDarkMode }
    }))
    setDarkMode(newDarkMode)
    
    // Apply dark mode to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and application preferences
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="admin-button admin-button-primary flex items-center space-x-2"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <button className="admin-button admin-button-secondary text-sm">
                    Change Avatar
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      profile: { ...prev.profile, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security & Privacy
              </h3>
            </div>

            <div className="space-y-6">
              {/* Change Password */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Change Password
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        New Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={changePassword}
                    className="admin-button admin-button-secondary"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }
                  }))}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.security.twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Session Timeout (minutes)
                </label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-6">
              <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
            </div>

            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {key === 'newMessages' && 'Get notified when new messages arrive'}
                      {key === 'newUsers' && 'Get notified when new users join'}
                      {key === 'systemAlerts' && 'Receive system and security alerts'}
                      {key === 'emailNotifications' && 'Send notifications to your email'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, [key]: !value }
                    }))}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${value ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${value ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Appearance Settings */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-6">
              <Palette className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h3>
            </div>

            <div className="space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark Mode
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Switch between light and dark themes
                  </p>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.appearance.darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform flex items-center justify-center
                      ${settings.appearance.darkMode ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  >
                    {settings.appearance.darkMode ? (
                      <Moon className="w-2 h-2 text-primary-600" />
                    ) : (
                      <Sun className="w-2 h-2 text-yellow-600" />
                    )}
                  </span>
                </button>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Language
                </label>
                <select
                  value={settings.appearance.language}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, language: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Timezone
                </label>
                <select
                  value={settings.appearance.timezone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, timezone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* System Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-6">
              <Globe className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                System Information
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Dec 18, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Environment</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Connected</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}