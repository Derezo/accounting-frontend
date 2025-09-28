import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'invoice' | 'payment' | 'customer' | 'system' | 'security' | 'reminder'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actions?: NotificationAction[]
  metadata?: {
    entityType?: string
    entityId?: string
    amount?: number
    currency?: string
    dueDate?: string
    [key: string]: any
  }
}

export interface NotificationAction {
  id: string
  label: string
  type: 'primary' | 'secondary' | 'destructive'
  onClick: () => void
}

export interface NotificationSettings {
  enablePush: boolean
  enableSound: boolean
  enableDesktop: boolean
  categories: {
    invoice: boolean
    payment: boolean
    customer: boolean
    system: boolean
    security: boolean
    reminder: boolean
  }
  priorities: {
    low: boolean
    medium: boolean
    high: boolean
    urgent: boolean
  }
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export interface UseNotificationsOptions {
  autoConnect?: boolean
  reconnectInterval?: number
  maxRetries?: number
  enableRealTime?: boolean
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  error: string | null
  settings: NotificationSettings
  lastFetch: string | null
}

// Mock WebSocket for real-time notifications
class NotificationWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000
  private onMessage: (notification: Notification) => void
  private onConnect: () => void
  private onDisconnect: () => void
  private onError: (error: Event) => void

  constructor(
    url: string,
    options: {
      onMessage: (notification: Notification) => void
      onConnect: () => void
      onDisconnect: () => void
      onError: (error: Event) => void
    }
  ) {
    this.url = url
    this.onMessage = options.onMessage
    this.onConnect = options.onConnect
    this.onDisconnect = options.onDisconnect
    this.onError = options.onError
  }

  connect(token: string) {
    try {
      this.ws = new WebSocket(`${this.url}?token=${token}`)

      this.ws.onopen = () => {
        console.log('Notification WebSocket connected')
        this.reconnectAttempts = 0
        this.onConnect()
      }

      this.ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data) as Notification
          this.onMessage(notification)
        } catch (error) {
          console.error('Failed to parse notification:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('Notification WebSocket disconnected')
        this.onDisconnect()
        this.attemptReconnect(token)
      }

      this.ws.onerror = (error) => {
        console.error('Notification WebSocket error:', error)
        this.onError(error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.onError(error as Event)
    }
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

      setTimeout(() => {
        this.connect(token)
      }, this.reconnectInterval * this.reconnectAttempts)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }
}

const defaultSettings: NotificationSettings = {
  enablePush: true,
  enableSound: true,
  enableDesktop: false,
  categories: {
    invoice: true,
    payment: true,
    customer: true,
    system: true,
    security: true,
    reminder: true
  },
  priorities: {
    low: false,
    medium: true,
    high: true,
    urgent: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
}

// Mock notifications for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    category: 'invoice',
    title: 'Invoice Overdue',
    message: 'Invoice INV-2024-001 from Tech Solutions Inc. is 5 days overdue.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'high',
    metadata: {
      entityType: 'invoice',
      entityId: 'inv_001',
      amount: 12832.50,
      currency: 'USD',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    actions: [
      {
        id: 'view_invoice',
        label: 'View Invoice',
        type: 'primary',
        onClick: () => console.log('View invoice clicked')
      },
      {
        id: 'send_reminder',
        label: 'Send Reminder',
        type: 'secondary',
        onClick: () => console.log('Send reminder clicked')
      }
    ]
  },
  {
    id: '2',
    type: 'success',
    category: 'payment',
    title: 'Payment Received',
    message: 'Payment of $8,450.00 received from Digital Marketing Co.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'medium',
    metadata: {
      entityType: 'payment',
      entityId: 'pay_002',
      amount: 8450.00,
      currency: 'USD'
    },
    actions: [
      {
        id: 'view_payment',
        label: 'View Payment',
        type: 'primary',
        onClick: () => console.log('View payment clicked')
      }
    ]
  },
  {
    id: '3',
    type: 'info',
    category: 'customer',
    title: 'New Customer Registered',
    message: 'StartupXYZ has completed their registration and profile setup.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: true,
    priority: 'low',
    metadata: {
      entityType: 'customer',
      entityId: 'cust_003'
    }
  },
  {
    id: '4',
    type: 'error',
    category: 'system',
    title: 'Export Failed',
    message: 'Monthly financial report export failed due to insufficient storage space.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'urgent',
    metadata: {
      entityType: 'report',
      entityId: 'rep_004'
    },
    actions: [
      {
        id: 'retry_export',
        label: 'Retry Export',
        type: 'primary',
        onClick: () => console.log('Retry export clicked')
      },
      {
        id: 'manage_storage',
        label: 'Manage Storage',
        type: 'secondary',
        onClick: () => console.log('Manage storage clicked')
      }
    ]
  },
  {
    id: '5',
    type: 'warning',
    category: 'reminder',
    title: 'Quote Expiring Soon',
    message: 'Quote QUO-2024-015 for Enterprise Corp expires in 2 days.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'medium',
    metadata: {
      entityType: 'quote',
      entityId: 'quo_005',
      amount: 25000.00,
      currency: 'USD',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  }
]

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user } = useAuth()
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxRetries = 5,
    enableRealTime = true
  } = options

  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    isLoading: false,
    error: null,
    settings: defaultSettings,
    lastFetch: null
  })

  const wsRef = useRef<NotificationWebSocket | null>(null)
  const permissionRef = useRef<NotificationPermission>('default')

  // Request desktop notification permission
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        permissionRef.current = permission
      })
    }
  }, [])

  // Initialize WebSocket connection
  useEffect(() => {
    if (autoConnect && enableRealTime && user?.token) {
      connectWebSocket()
    }

    return () => {
      disconnectWebSocket()
    }
  }, [autoConnect, enableRealTime, user?.token])

  // Load initial notifications
  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const connectWebSocket = useCallback(() => {
    if (!user?.token || wsRef.current) return

    const wsUrl = process.env.NODE_ENV === 'development'
      ? 'ws://localhost:3001/notifications'
      : 'wss://api.example.com/notifications'

    wsRef.current = new NotificationWebSocket(wsUrl, {
      onMessage: (notification) => {
        addNotification(notification)
        showDesktopNotification(notification)
      },
      onConnect: () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }))
      },
      onDisconnect: () => {
        setState(prev => ({ ...prev, isConnected: false }))
      },
      onError: (error) => {
        setState(prev => ({ ...prev, error: 'Failed to connect to notification service' }))
      }
    })

    wsRef.current.connect(user.token)
  }, [user?.token])

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
    }
    setState(prev => ({ ...prev, isConnected: false }))
  }, [])

  const fetchNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation:
      // const response = await notificationService.getNotifications()
      const notifications = mockNotifications

      setState(prev => ({
        ...prev,
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length,
        isLoading: false,
        lastFetch: new Date().toISOString()
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch notifications',
        isLoading: false
      }))
    }
  }, [])

  const addNotification = useCallback((notification: Notification) => {
    setState(prev => {
      const exists = prev.notifications.some(n => n.id === notification.id)
      if (exists) return prev

      const newNotifications = [notification, ...prev.notifications]
      return {
        ...prev,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.isRead).length
      }
    })
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    setState(prev => {
      const updatedNotifications = prev.notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length
      }
    })

    try {
      // In real implementation:
      // await notificationService.markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }))

    try {
      // In real implementation:
      // await notificationService.markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    setState(prev => {
      const updatedNotifications = prev.notifications.filter(n => n.id !== notificationId)
      return {
        ...prev,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.isRead).length
      }
    })

    try {
      // In real implementation:
      // await notificationService.deleteNotification(notificationId)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [])

  const clearAll = useCallback(async () => {
    setState(prev => ({
      ...prev,
      notifications: [],
      unreadCount: 0
    }))

    try {
      // In real implementation:
      // await notificationService.clearAllNotifications()
    } catch (error) {
      console.error('Failed to clear all notifications:', error)
    }
  }, [])

  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...state.settings, ...newSettings }

    setState(prev => ({
      ...prev,
      settings: updatedSettings
    }))

    try {
      // In real implementation:
      // await notificationService.updateSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update notification settings:', error)
    }
  }, [state.settings])

  const showDesktopNotification = useCallback((notification: Notification) => {
    if (!state.settings.enableDesktop || permissionRef.current !== 'granted') return

    // Check if it's quiet hours
    if (state.settings.quietHours.enabled) {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      const { start, end } = state.settings.quietHours

      if (currentTime >= start || currentTime <= end) {
        return
      }
    }

    // Check if category is enabled
    if (!state.settings.categories[notification.category]) return

    // Check if priority is enabled
    if (!state.settings.priorities[notification.priority]) return

    const desktopNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent'
    })

    desktopNotification.onclick = () => {
      window.focus()
      markAsRead(notification.id)
      desktopNotification.close()
    }

    // Auto-close after 5 seconds for non-urgent notifications
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        desktopNotification.close()
      }, 5000)
    }
  }, [state.settings, markAsRead])

  const createNotification = useCallback((
    type: Notification['type'],
    category: Notification['category'],
    title: string,
    message: string,
    options: {
      priority?: Notification['priority']
      metadata?: Notification['metadata']
      actions?: NotificationAction[]
    } = {}
  ) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      category,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      priority: options.priority || 'medium',
      metadata: options.metadata,
      actions: options.actions
    }

    addNotification(notification)
    showDesktopNotification(notification)

    return notification
  }, [addNotification, showDesktopNotification])

  const getNotificationsByCategory = useCallback((category: string) => {
    return state.notifications.filter(n => n.category === category)
  }, [state.notifications])

  const getUnreadNotifications = useCallback(() => {
    return state.notifications.filter(n => !n.isRead)
  }, [state.notifications])

  const getUrgentNotifications = useCallback(() => {
    return state.notifications.filter(n => n.priority === 'urgent' && !n.isRead)
  }, [state.notifications])

  return {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isConnected: state.isConnected,
    isLoading: state.isLoading,
    error: state.error,
    settings: state.settings,
    lastFetch: state.lastFetch,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
    createNotification,

    // Connection management
    connectWebSocket,
    disconnectWebSocket,

    // Utilities
    getNotificationsByCategory,
    getUnreadNotifications,
    getUrgentNotifications,

    // Permission status
    desktopPermission: permissionRef.current
  }
}