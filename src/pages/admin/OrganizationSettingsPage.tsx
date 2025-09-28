import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Building, DollarSign, FileText, Settings, Bell, Shield, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CompanyInformationForm } from '@/components/forms/CompanyInformationForm'
import { BillingSettingsForm } from '@/components/forms/BillingSettingsForm'
import { TaxConfigurationForm } from '@/components/forms/TaxConfigurationForm'
import { SystemPreferencesForm } from '@/components/forms/SystemPreferencesForm'
import { NotificationSettingsForm } from '@/components/forms/NotificationSettingsForm'
import { SecuritySettingsForm } from '@/components/forms/SecuritySettingsForm'
import { BrandingSettingsForm } from '@/components/forms/BrandingSettingsForm'
import { apiService } from '@/services/api.service'
import { OrganizationSettings } from '@/types/api'
import toast from 'react-hot-toast'

export function OrganizationSettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const queryClient = useQueryClient()

  // Fetch organization settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['organization-settings'],
    queryFn: () => apiService.getOrganizationSettings(),
  })

  // Update organization settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<OrganizationSettings>) =>
      apiService.updateOrganizationSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] })
      setHasUnsavedChanges(false)
      toast.success('Settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings')
    },
  })

  const handleFormChange = () => {
    setHasUnsavedChanges(true)
  }

  const handleSave = async (formData: Partial<OrganizationSettings>) => {
    try {
      await updateSettingsMutation.mutateAsync(formData)
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground">
            Configure your organization's information, billing, and system preferences
          </p>
        </div>
        {hasUnsavedChanges && (
          <Alert className="w-auto">
            <AlertDescription>
              You have unsaved changes. Make sure to save your modifications.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tax
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        {/* Company Information */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Basic information about your organization that appears on invoices and documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyInformationForm
                initialData={settings?.company}
                onSave={handleSave}
                onChange={handleFormChange}
                isLoading={updateSettingsMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Billing Settings
              </CardTitle>
              <CardDescription>
                Configure default billing preferences, payment terms, and currency settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BillingSettingsForm
                initialData={settings?.billing}
                onSave={handleSave}
                onChange={handleFormChange}
                isLoading={updateSettingsMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Configuration */}
        <TabsContent value="tax" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tax Configuration
              </CardTitle>
              <CardDescription>
                Set up tax rates, GST/HST numbers, and provincial tax settings for Canada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaxConfigurationForm
                initialData={settings?.tax}
                onSave={handleSave}
                onChange={handleFormChange}
                isLoading={updateSettingsMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Preferences */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure system-wide settings, date formats, time zones, and defaults
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemPreferencesForm
                initialData={settings?.system}
                onSave={handleSave}
                onChange={handleFormChange}
                isLoading={updateSettingsMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email notifications, alerts, and communication preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm
                initialData={settings?.notifications}
                onSave={handleSave}
                onChange={handleFormChange}
                isLoading={updateSettingsMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies, authentication requirements, and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettingsForm
                initialData={settings?.security}
                onSave={handleSave}
                onChange={handleFormChange}
                isLoading={updateSettingsMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding & Appearance
              </CardTitle>
              <CardDescription>
                Customize your organization's branding, logos, and document appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandingSettingsForm
                initialData={settings?.branding}
                onSave={handleSave}
                onChange={handleFormChange}
                isLoading={updateSettingsMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save All Changes */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg rounded-lg p-4 border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">You have unsaved changes</span>
            <Button
              onClick={() => {
                // This would need to be implemented to save all changes
                toast.info('Please save changes in each tab individually')
              }}
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}