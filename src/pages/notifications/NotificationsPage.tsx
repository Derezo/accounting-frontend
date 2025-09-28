import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { NotificationToast, useToastNotifications } from '@/components/notifications/NotificationToast'
import { StatusUpdates, useStatusUpdates } from '@/components/notifications/StatusUpdates'
import { LoadingSpinner } from '@/components/ui/loading'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import {
  ArrowLeft,
  Bell,
  Settings,
  Activity,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  TestTube,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationsPageProps {
  className?: string
}

export function NotificationsPage({ className }: NotificationsPageProps) {
  const navigate = useNavigate()
  const { user, canAccess } = useAuth()

  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updateSettings,
    createNotification,
    desktopPermission
  } = useNotifications()

  const {
    updates: statusUpdates,
    addUpdate,
    updateStatus,
    clearCompleted
  } = useStatusUpdates()

  const {
    toasts,
    removeToast,
    success,
    error: showError,
    warning,
    info,
    progress
  } = useToastNotifications()

  const [activeTab, setActiveTab] = useState('center')
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)

  // Effects must be called before any early returns
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    setHasChanges(JSON.stringify(localSettings) !== JSON.stringify(settings))
  }, [localSettings, settings])

  // Check permissions
  if (!canAccess('notifications', 'read')) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access notification settings.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSettingChange = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleCategoryChange = (category: string, enabled: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      categories: { ...prev.categories, [category]: enabled }
    }))
  }

  const handlePriorityChange = (priority: string, enabled: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      priorities: { ...prev.priorities, [priority]: enabled }
    }))
  }

  const handleQuietHoursChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, [key]: value }
    }))
  }

  const handleSaveSettings = async () => {
    try {
      await updateSettings(localSettings)
      setHasChanges(false)
      success('Settings Saved', 'Notification preferences have been updated successfully.')
    } catch (err: any) {
      showError('Save Failed', err.message || 'Failed to save notification settings.')
    }
  }

  const handleTestNotification = () => {
    createNotification(
      'info',
      'system',
      'Test Notification',
      'This is a test notification to verify your settings are working correctly.',
      {
        priority: 'medium',
        actions: [
          {
            id: 'dismiss',
            label: 'Dismiss',
            type: 'secondary',
            onClick: () => console.log('Test notification dismissed')
          }
        ]
      }
    )
    info('Test Sent', 'A test notification has been created.')
  }

  const handleTestToast = () => {
    const toastType = ['success', 'error', 'warning', 'info'][Math.floor(Math.random() * 4)] as any
    const messages = {
      success: { title: 'Operation Successful', message: 'Your action completed successfully.' },
      error: { title: 'Operation Failed', message: 'There was an error processing your request.' },
      warning: { title: 'Warning', message: 'Please review this important information.' },
      info: { title: 'Information', message: 'Here is some helpful information for you.' }
    }

    const { title, message } = messages[toastType]

    if (toastType === 'success') success(title, message)
    else if (toastType === 'error') showError(title, message)
    else if (toastType === 'warning') warning(title, message)
    else info(title, message)
  }

  const handleTestProgress = () => {
    const progressId = progress('Processing Data', 'Importing customer records...', 0)

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += Math.random() * 20
      if (currentProgress >= 100) {
        currentProgress = 100
        clearInterval(interval)
        removeToast(progressId)
        success('Import Complete', 'All customer records have been imported successfully.')
      }
      // Note: You would update the toast progress here in a real implementation
    }, 500)
  }

  const handleTestStatusUpdate = () => {
    const updateId = addUpdate({
      type: 'export',
      title: 'Financial Report Export',
      description: 'Generating monthly financial report with charts and analytics',
      status: 'running',
      progress: 0,
      metadata: {
        totalItems: 1000,
        processedItems: 0,
        successRate: 100
      },
      actions: [
        {
          id: 'pause',
          label: 'Pause',
          type: 'secondary',
          icon: <Play className="h-3 w-3" />,
          onClick: () => console.log('Paused export')
        },
        {
          id: 'cancel',
          label: 'Cancel',
          type: 'destructive',
          onClick: () => updateStatus(updateId, { status: 'cancelled' })
        }
      ]
    })

    // Simulate progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      const processedItems = Math.floor((progress / 100) * 1000)

      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        updateStatus(updateId, {
          status: 'completed',
          progress: 100,
          endTime: new Date().toISOString(),
          metadata: {
            totalItems: 1000,
            processedItems: 1000,
            successRate: 98.5
          }
        })
      } else {
        updateStatus(updateId, {
          progress,
          metadata: {
            totalItems: 1000,
            processedItems,
            successRate: 100
          }
        })
      }
    }, 800)
  }

  const requestDesktopPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        success('Permission Granted', 'Desktop notifications have been enabled.')
      } else {
        warning('Permission Denied', 'Desktop notifications were not enabled.')
      }
    }
  }

  if (isLoading && notifications.length === 0) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <LoadingSpinner size="lg" message="Loading notifications..." />
      </div>
    )
  }

  return (
    <div className={cn('container mx-auto p-6 space-y-6', className)}>
      {/* Toast Notifications */}
      <NotificationToast
        notifications={toasts}
        onRemove={removeToast}
        maxVisible={3}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">Notifications & Status</h1>
          <p className="text-muted-foreground">
            Manage your notification preferences and monitor system status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={isConnected ? 'default' : 'destructive'}
            className={isConnected ? 'bg-green-100 text-green-800' : ''}
          >
            {isConnected ? (
              <>
                <Zap className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              'Disconnected'
            )}
          </Badge>

          {unreadCount > 0 && (
            <Badge variant="secondary">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="center" className="gap-2">
            <Bell className="h-4 w-4" />
            Notification Center
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <Activity className="h-4 w-4" />
            Status Updates
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="testing" className="gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        {/* Notification Center */}
        <TabsContent value="center" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                All Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
                onClearAll={clearAll}
                maxVisible={50}
                showBadge={false}
                className="w-full"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Updates */}
        <TabsContent value="status" className="space-y-6">
          <StatusUpdates
            updates={statusUpdates}
            onRefresh={() => console.log('Refresh status updates')}
            autoRefresh={true}
            showCompleted={true}
            maxVisible={20}
          />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notification Preferences</CardTitle>
                {hasChanges && (
                  <Button onClick={handleSaveSettings}>
                    Save Changes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">General</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications in the application
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.enablePush}
                    onCheckedChange={(checked) => handleSettingChange('enablePush', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      Sound Notifications
                      {localSettings.enableSound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound when notifications arrive
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.enableSound}
                    onCheckedChange={(checked) => handleSettingChange('enableSound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      Desktop Notifications
                      <Monitor className="h-4 w-4" />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Show notifications on your desktop (permission: {desktopPermission})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {desktopPermission !== 'granted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={requestDesktopPermission}
                      >
                        Enable
                      </Button>
                    )}
                    <Switch
                      checked={localSettings.enableDesktop && desktopPermission === 'granted'}
                      onCheckedChange={(checked) => handleSettingChange('enableDesktop', checked)}
                      disabled={desktopPermission !== 'granted'}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Categories</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(localSettings.categories).map(([category, enabled]) => (
                    <div key={category} className="flex items-center justify-between">
                      <Label className="capitalize">{category.replace('_', ' ')}</Label>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Priorities */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Priorities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(localSettings.priorities).map(([priority, enabled]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="capitalize">{priority}</Label>
                        <Badge
                          variant="outline"
                          className={cn(
                            priority === 'urgent' && 'border-red-300 text-red-700',
                            priority === 'high' && 'border-orange-300 text-orange-700',
                            priority === 'medium' && 'border-blue-300 text-blue-700',
                            priority === 'low' && 'border-gray-300 text-gray-700'
                          )}
                        >
                          {priority}
                        </Badge>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => handlePriorityChange(priority, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quiet Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Quiet Hours
                </h3>

                <div className="flex items-center justify-between">
                  <Label>Enable Quiet Hours</Label>
                  <Switch
                    checked={localSettings.quietHours.enabled}
                    onCheckedChange={(checked) => handleQuietHoursChange('enabled', checked)}
                  />
                </div>

                {localSettings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <input
                        type="time"
                        value={localSettings.quietHours.start}
                        onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <input
                        type="time"
                        value={localSettings.quietHours.end}
                        onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use these buttons to test different types of notifications and ensure your settings are working correctly.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleTestNotification} className="gap-2">
                  <Bell className="h-4 w-4" />
                  Test Notification
                </Button>

                <Button onClick={handleTestToast} variant="outline" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Test Toast
                </Button>

                <Button onClick={handleTestProgress} variant="outline" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Test Progress
                </Button>

                <Button onClick={handleTestStatusUpdate} variant="outline" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Test Status Update
                </Button>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button onClick={clearCompleted} variant="outline" size="sm">
                  Clear Completed Status Updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}