import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Settings,
  Check,
  Trash2,
  Filter,
  Clock,
  User,
  FileText,
  CreditCard,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

export interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onDelete?: (notificationId: string) => void
  onClearAll?: () => void
  onActionClick?: (notificationId: string, actionId: string) => void
  maxVisible?: number
  showBadge?: boolean
  className?: string
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onActionClick,
  maxVisible = 50,
  showBadge = true,
  className
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [filter, setFilter] = useState<string>('')
  const soundRef = useRef<HTMLAudioElement | null>(null)

  const unreadCount = notifications.filter(n => !n.isRead).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length

  // Play notification sound for new notifications
  useEffect(() => {
    if (notifications.length > 0 && unreadCount > 0) {
      // Only play sound if there are new unread notifications
      const latestNotification = notifications.find(n => !n.isRead)
      if (latestNotification && soundRef.current) {
        soundRef.current.volume = 0.3
        soundRef.current.play().catch(() => {}) // Ignore play errors
      }
    }
  }, [notifications.length, unreadCount])

  const getNotificationIcon = (type: string, category: string) => {
    const typeIcons = {
      success: <CheckCircle className="h-4 w-4 text-green-500" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      error: <AlertTriangle className="h-4 w-4 text-red-500" />,
      info: <Info className="h-4 w-4 text-blue-500" />
    }

    const categoryIcons = {
      invoice: <FileText className="h-4 w-4" />,
      payment: <CreditCard className="h-4 w-4" />,
      customer: <User className="h-4 w-4" />,
      system: <Settings className="h-4 w-4" />,
      security: <AlertTriangle className="h-4 w-4" />,
      reminder: <Clock className="h-4 w-4" />
    }

    return typeIcons[type as keyof typeof typeIcons] || categoryIcons[category as keyof typeof categoryIcons] || <Bell className="h-4 w-4" />
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'border-l-gray-300',
      medium: 'border-l-blue-400',
      high: 'border-l-orange-400',
      urgent: 'border-l-red-500'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return notificationTime.toLocaleDateString()
  }

  const filterNotifications = (notifications: Notification[]) => {
    let filtered = notifications

    // Filter by tab
    if (activeTab !== 'all') {
      if (activeTab === 'unread') {
        filtered = filtered.filter(n => !n.isRead)
      } else {
        filtered = filtered.filter(n => n.category === activeTab)
      }
    }

    // Filter by search term
    if (filter) {
      const searchLower = filter.toLowerCase()
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower)
      )
    }

    // Sort by priority and timestamp
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder]
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder]

      if (aPriority !== bPriority) {
        return bPriority - aPriority
      }

      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }).slice(0, maxVisible)
  }

  const filteredNotifications = filterNotifications(notifications)

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
  }

  const handleActionClick = (notificationId: string, actionId: string, action: NotificationAction) => {
    action.onClick()
    onActionClick?.(notificationId, actionId)
  }

  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={cn(
        'p-4 border-l-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer',
        getPriorityColor(notification.priority),
        !notification.isRead && 'bg-blue-50/50'
      )}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            {getNotificationIcon(notification.type, notification.category)}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className={cn(
                'text-sm font-medium',
                !notification.isRead && 'text-foreground',
                notification.isRead && 'text-muted-foreground'
              )}>
                {notification.title}
              </h4>
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              )}
              <Badge variant="outline" className="text-xs">
                {notification.category}
              </Badge>
              {notification.priority === 'urgent' && (
                <Badge variant="destructive" className="text-xs">
                  Urgent
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              {notification.message}
            </p>

            {notification.metadata && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {notification.metadata.amount && notification.metadata.currency && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {notification.metadata.currency} {notification.metadata.amount.toFixed(2)}
                  </span>
                )}
                {notification.metadata.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due: {new Date(notification.metadata.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {notification.actions && notification.actions.length > 0 && (
              <div className="flex gap-2 pt-2">
                {notification.actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={
                      action.type === 'primary' ? 'default' :
                      action.type === 'destructive' ? 'destructive' :
                      'outline'
                    }
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleActionClick(notification.id, action.id, action)
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {getTimeAgo(notification.timestamp)}
          </span>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(notification.id)
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  const getCategoryCount = (category: string) => {
    if (category === 'unread') return unreadCount
    return notifications.filter(n => n.category === category).length
  }

  return (
    <>
      {/* Notification Sound */}
      <audio
        ref={soundRef}
        preload="auto"
        src="/sounds/notification.mp3" // You would need to add this file
      />

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('relative', className)}
          >
            <Bell className="h-5 w-5" />
            {showBadge && unreadCount > 0 && (
              <Badge
                variant={urgentCount > 0 ? 'destructive' : 'default'}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-96 p-0" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && onMarkAllAsRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Mark All Read
                    </Button>
                  )}
                  {notifications.length > 0 && onClearAll && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Search/Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Filter notifications..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
                  <TabsTrigger value="all" className="text-xs">
                    All
                    {notifications.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="invoice" className="text-xs">
                    Invoices
                    {getCategoryCount('invoice') > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getCategoryCount('invoice')}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="text-xs">
                    Payments
                    {getCategoryCount('payment') > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {getCategoryCount('payment')}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  <ScrollArea className="h-96">
                    {filteredNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {filter ? 'No notifications match your search' : 'No notifications'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {filteredNotifications.map((notification, index) => (
                          <div key={notification.id}>
                            {renderNotification(notification)}
                            {index < filteredNotifications.length - 1 && <Separator />}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </>
  )
}