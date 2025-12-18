'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Settings, 
  Toggle,
  Zap,
  MessageSquare,
  Brain,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { adminAPI } from '@/services/api'
import toast from 'react-hot-toast'

interface AISettings {
  enabled: boolean
  autoReply: boolean
  responseDelay: number
  maxTokens: number
  temperature: number
  model: string
  systemPrompt: string
  fallbackEnabled: boolean
  fallbackMessage: string
}

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings>({
    enabled: true,
    autoReply: true,
    responseDelay: 2000,
    maxTokens: 150,
    temperature: 0.7,
    model: 'gpt-3.5-turbo',
    systemPrompt: 'You are a helpful customer support assistant. Be friendly, professional, and concise in your responses.',
    fallbackEnabled: true,
    fallbackMessage: 'Thank you for your message! Our team will get back to you shortly.'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    loadAISettings()
  }, [])

  const loadAISettings = async () => {
    try {
      const aiSettings = await adminAPI.getAISettings()
      setSettings(aiSettings)
    } catch (error) {
      console.error('Failed to load AI settings:', error)
      toast.error('Failed to load AI settings')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await adminAPI.updateAISettings(settings)
      toast.success('AI settings saved successfully!')
    } catch (error) {
      console.error('Failed to save AI settings:', error)
      toast.error('Failed to save AI settings')
    } finally {
      setIsSaving(false)
    }
  }

  const testAI = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a test message')
      return
    }

    setIsTesting(true)
    try {
      const response = await adminAPI.testAI(testMessage)
      setTestResponse(response.message)
      toast.success('AI test completed!')
    } catch (error) {
      console.error('Failed to test AI:', error)
      toast.error('Failed to test AI')
      setTestResponse('Error: Could not get AI response')
    } finally {
      setIsTesting(false)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure AI behavior and responses for your chatbot
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
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-6">
              <Bot className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                General AI Settings
              </h3>
            </div>

            <div className="space-y-6">
              {/* AI Enabled Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable AI Responses
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow AI to automatically respond to customer messages
                  </p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.enabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Auto Reply Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Auto Reply
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically send AI responses without admin approval
                  </p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, autoReply: !prev.autoReply }))}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.autoReply ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.autoReply ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Response Delay */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Response Delay (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="500"
                  value={settings.responseDelay}
                  onChange={(e) => setSettings(prev => ({ ...prev, responseDelay: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Delay before AI sends response (simulates typing)
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  AI Model
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Recommended)</option>
                  <option value="gpt-4">GPT-4 (Premium)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (Latest)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Advanced Configuration
              </h3>
            </div>

            <div className="space-y-6">
              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Max Tokens: {settings.maxTokens}
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Maximum length of AI responses
                </p>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Temperature: {settings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Controls randomness (0 = focused, 1 = creative)
                </p>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  System Prompt
                </label>
                <textarea
                  rows={4}
                  value={settings.systemPrompt}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Define how the AI should behave..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Instructions that guide AI behavior and personality
                </p>
              </div>
            </div>
          </motion.div>

          {/* Fallback Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-6">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fallback Configuration
              </h3>
            </div>

            <div className="space-y-6">
              {/* Fallback Enabled */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Enable Fallback Messages
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Show fallback message when AI is unavailable
                  </p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, fallbackEnabled: !prev.fallbackEnabled }))}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${settings.fallbackEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                      ${settings.fallbackEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                  />
                </button>
              </div>

              {/* Fallback Message */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Fallback Message
                </label>
                <textarea
                  rows={3}
                  value={settings.fallbackMessage}
                  onChange={(e) => setSettings(prev => ({ ...prev, fallbackMessage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Message to show when AI is unavailable..."
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Test Panel */}
        <div className="space-y-6">
          {/* AI Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Status
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {settings.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Model</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {settings.model}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Auto Reply</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {settings.autoReply ? 'On' : 'Off'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {settings.responseDelay}ms
                </span>
              </div>
            </div>
          </motion.div>

          {/* Test AI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-card p-6"
          >
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Test AI Response
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Test Message
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter a test message..."
                />
              </div>

              <button
                onClick={testAI}
                disabled={isTesting || !testMessage.trim()}
                className="w-full admin-button admin-button-primary flex items-center justify-center space-x-2"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                <span>{isTesting ? 'Testing...' : 'Test AI'}</span>
              </button>

              {testResponse && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    AI Response:
                  </label>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {testResponse}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}