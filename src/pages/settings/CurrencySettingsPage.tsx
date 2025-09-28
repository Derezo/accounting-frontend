import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable, Column } from '@/components/tables/DataTable'
import { CurrencySelector } from '@/components/currency/CurrencySelector'
import { CurrencyConverter } from '@/components/currency/CurrencyConverter'
import { MultiCurrencyInput } from '@/components/currency/MultiCurrencyInput'
import { LoadingSpinner } from '@/components/ui/loading'
import { useCurrency } from '@/hooks/useCurrency'
import { useAuth } from '@/hooks/useAuth'
import { useLoadingState } from '@/hooks/useLoadingState'
import {
  ArrowLeft,
  Settings,
  DollarSign,
  Globe,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CurrencySettingsPageProps {
  className?: string
}

export function CurrencySettingsPage({ className }: CurrencySettingsPageProps) {
  const navigate = useNavigate()
  const { user, canAccess } = useAuth()
  const loadingState = useLoadingState()

  const {
    currencies,
    allowedCurrencies,
    popularCurrencies,
    exchangeRates,
    settings,
    isLoading,
    error,
    lastUpdated,
    refreshRates,
    updateSettings,
    getExchangeRate,
    formatCurrency,
    getRateTrend
  } = useCurrency()

  const [activeTab, setActiveTab] = useState('general')
  const [localSettings, setLocalSettings] = useState(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [testAmount, setTestAmount] = useState({ amount: 100, currency: 'USD' })

  // Effects must be called before any early returns
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    setHasChanges(JSON.stringify(localSettings) !== JSON.stringify(settings))
  }, [localSettings, settings])

  // Check permissions
  if (!canAccess('settings', 'update')) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access currency settings.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleSettingChange = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    try {
      loadingState.startLoading({
        showProgress: true,
        progressMessage: 'Saving currency settings...'
      })

      await updateSettings(localSettings)
      setHasChanges(false)

      loadingState.stopLoading({ success: true })
    } catch (err: any) {
      loadingState.stopLoading({ success: false })
      console.error('Failed to save settings:', err)
    }
  }

  const handleResetSettings = () => {
    setLocalSettings(settings)
    setHasChanges(false)
  }

  const handleAddAllowedCurrency = (currencyCode: string) => {
    if (!localSettings.allowedCurrencies.includes(currencyCode)) {
      handleSettingChange('allowedCurrencies', [...localSettings.allowedCurrencies, currencyCode])
    }
  }

  const handleRemoveAllowedCurrency = (currencyCode: string) => {
    if (currencyCode !== localSettings.baseCurrency) {
      handleSettingChange('allowedCurrencies',
        localSettings.allowedCurrencies.filter(c => c !== currencyCode)
      )
    }
  }

  // Prepare currency data for table
  const currencyTableData = currencies.map(currency => {
    const rate = getExchangeRate(localSettings.baseCurrency, currency.code)
    const trend = getRateTrend(localSettings.baseCurrency, currency.code)
    const isAllowed = localSettings.allowedCurrencies.includes(currency.code)
    const isBase = currency.code === localSettings.baseCurrency

    return {
      ...currency,
      exchangeRate: rate,
      trend: trend?.trend || 'stable',
      change24h: trend?.change24h || 0,
      isAllowed,
      isBase
    }
  })

  const currencyColumns: Column<typeof currencyTableData[0]>[] = [
    {
      id: 'flag',
      header: '',
      cell: (item) => <span className="text-lg">{item.flag}</span>,
      width: '40px'
    },
    {
      id: 'code',
      header: 'Code',
      accessorKey: 'code',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.code}</span>
          {item.isBase && <Badge variant="secondary">Base</Badge>}
        </div>
      )
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name'
    },
    {
      id: 'symbol',
      header: 'Symbol',
      cell: (item) => (
        <Badge variant="outline">{item.symbol}</Badge>
      )
    },
    {
      id: 'rate',
      header: 'Exchange Rate',
      cell: (item) => {
        if (item.isBase) return '1.0000'
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">
              {item.exchangeRate?.toFixed(4) || '—'}
            </span>
            {item.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {item.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
          </div>
        )
      }
    },
    {
      id: 'change',
      header: '24h Change',
      cell: (item) => {
        if (item.isBase) return '—'
        const change = item.change24h
        return (
          <span className={cn(
            'text-sm',
            change > 0 ? 'text-green-600' :
            change < 0 ? 'text-red-600' :
            'text-muted-foreground'
          )}>
            {change > 0 ? '+' : ''}{change?.toFixed(2) || '0.00'}%
          </span>
        )
      }
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item) => (
        <div className="flex items-center gap-2">
          {item.isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              Inactive
            </Badge>
          )}
          {item.isAllowed && (
            <Badge variant="outline">
              Allowed
            </Badge>
          )}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center gap-1">
          {!item.isAllowed && item.isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddAllowedCurrency(item.code)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {item.isAllowed && !item.isBase && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveAllowedCurrency(item.code)}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  if (isLoading && !currencies.length) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <LoadingSpinner size="lg" message="Loading currency settings..." />
      </div>
    )
  }

  return (
    <div className={cn('container mx-auto p-6 space-y-6', className)}>
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
          <h1 className="text-2xl font-bold">Currency Settings</h1>
          <p className="text-muted-foreground">
            Configure currency preferences and exchange rate settings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={refreshRates}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh Rates
          </Button>

          {hasChanges && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleResetSettings}>
                Reset
              </Button>
              <Button onClick={handleSaveSettings} disabled={loadingState.isLoading}>
                Save Changes
              </Button>
            </div>
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

      {/* Last Updated */}
      {lastUpdated && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Exchange rates last updated: {new Date(lastUpdated).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="currencies" className="gap-2">
            <Globe className="h-4 w-4" />
            Currencies
          </TabsTrigger>
          <TabsTrigger value="rates" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Exchange Rates
          </TabsTrigger>
          <TabsTrigger value="testing" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Base Currency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Currency</Label>
                <CurrencySelector
                  value={localSettings.baseCurrency}
                  onValueChange={(value) => handleSettingChange('baseCurrency', value)}
                  currencies={currencies.filter(c => c.isActive)}
                  variant="detailed"
                  showExchangeRates={false}
                />
                <p className="text-sm text-muted-foreground">
                  This currency will be used as the base for exchange rate calculations and reporting.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Exchange Rates</Label>
                  <p className="text-sm text-muted-foreground">
                    Display current exchange rates in forms and interfaces
                  </p>
                </div>
                <Switch
                  checked={localSettings.showExchangeRates}
                  onCheckedChange={(checked) => handleSettingChange('showExchangeRates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-refresh Rates</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically update exchange rates in the background
                  </p>
                </div>
                <Switch
                  checked={localSettings.autoRefreshRates}
                  onCheckedChange={(checked) => handleSettingChange('autoRefreshRates', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Management */}
        <TabsContent value="currencies" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Available Currencies</CardTitle>
                <Badge variant="outline">
                  {localSettings.allowedCurrencies.length} allowed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={currencyTableData}
                columns={currencyColumns}
                searchable={true}
                searchPlaceholder="Search currencies..."
                showPagination={true}
                className="mt-4"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exchange Rates */}
        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency Converter</CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencyConverter
                size="large"
                showTrends={true}
                showHistory={true}
                autoRefresh={localSettings.autoRefreshRates}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Currency Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularCurrencies.slice(1, 5).map((currency) => {
                  const rate = getExchangeRate(localSettings.baseCurrency, currency.code)
                  const trend = getRateTrend(localSettings.baseCurrency, currency.code)

                  return (
                    <div key={currency.code} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{currency.flag}</span>
                          <span className="font-medium">
                            {localSettings.baseCurrency}/{currency.code}
                          </span>
                        </div>
                        {trend && (
                          <div className="flex items-center gap-1">
                            {trend.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                            {trend.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                            <span className={cn(
                              'text-xs',
                              trend.change24h > 0 ? 'text-green-600' :
                              trend.change24h < 0 ? 'text-red-600' :
                              'text-muted-foreground'
                            )}>
                              {trend.change24h > 0 ? '+' : ''}{trend.change24h.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-mono">
                        {rate?.toFixed(4) || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        1 {localSettings.baseCurrency} = {rate?.toFixed(4) || '—'} {currency.code}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Currency Input Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <MultiCurrencyInput
                  label="Test Amount"
                  value={testAmount}
                  onChange={setTestAmount}
                  baseCurrency={localSettings.baseCurrency}
                  showConverter={true}
                  showExchangeRate={true}
                  validateRange={{ min: 0, max: 1000000 }}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  {allowedCurrencies.slice(0, 3).map((currency) => (
                    <div key={currency.code} className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground">{currency.code}</div>
                      <div className="text-lg font-medium">
                        {formatCurrency(
                          testAmount.amount * getExchangeRate(testAmount.currency, currency.code),
                          currency.code
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}