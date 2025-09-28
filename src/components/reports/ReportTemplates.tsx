import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  FileText,
  Search,
  Filter,
  Plus,
  Settings,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  TrendingUp,
  FileX,
  Shield,
  AlertTriangle,
  Clock,
  Building
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReports } from '@/hooks/useReports'
import type {
  ReportTemplate,
  ReportCategory,
  ReportType
} from '@/types/reports'

export interface ReportTemplatesProps {
  onSelectTemplate?: (template: ReportTemplate) => void
  onCreateCustom?: () => void
  selectedTemplateId?: string
  className?: string
}

export function ReportTemplates({
  onSelectTemplate,
  onCreateCustom,
  selectedTemplateId,
  className
}: ReportTemplatesProps) {
  const { templates, isLoading, error } = useReports()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all')

  const getCategoryIcon = (category: ReportCategory) => {
    const icons = {
      FINANCIAL: <DollarSign className="h-5 w-5" />,
      CUSTOMER: <Users className="h-5 w-5" />,
      INVOICE: <FileText className="h-5 w-5" />,
      PAYMENT: <TrendingUp className="h-5 w-5" />,
      TAX: <Building className="h-5 w-5" />,
      ANALYTICS: <BarChart3 className="h-5 w-5" />,
      AUDIT: <Shield className="h-5 w-5" />,
      COMPLIANCE: <AlertTriangle className="h-5 w-5" />,
      CUSTOM: <Settings className="h-5 w-5" />
    }
    return icons[category] || <FileText className="h-5 w-5" />
  }

  const getCategoryColor = (category: ReportCategory) => {
    const colors = {
      FINANCIAL: 'bg-green-100 text-green-800 border-green-200',
      CUSTOMER: 'bg-blue-100 text-blue-800 border-blue-200',
      INVOICE: 'bg-purple-100 text-purple-800 border-purple-200',
      PAYMENT: 'bg-orange-100 text-orange-800 border-orange-200',
      TAX: 'bg-red-100 text-red-800 border-red-200',
      ANALYTICS: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      AUDIT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLIANCE: 'bg-pink-100 text-pink-800 border-pink-200',
      CUSTOM: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[category] || colors.CUSTOM
  }

  const getTypeDescription = (type: ReportType) => {
    const descriptions = {
      INCOME_STATEMENT: 'Revenue, expenses, and net income summary',
      BALANCE_SHEET: 'Assets, liabilities, and equity snapshot',
      CASH_FLOW: 'Cash inflows and outflows analysis',
      TRIAL_BALANCE: 'Account balances verification',
      AGED_RECEIVABLES: 'Outstanding customer balances by age',
      AGED_PAYABLES: 'Outstanding vendor balances by age',
      CUSTOMER_STATEMENT: 'Individual customer account summary',
      INVOICE_SUMMARY: 'Invoice generation and payment summary',
      PAYMENT_SUMMARY: 'Payment collection and processing summary',
      TAX_SUMMARY: 'Tax collection and remittance summary',
      SALES_REPORT: 'Sales performance and trends analysis',
      EXPENSE_REPORT: 'Expense tracking and categorization',
      PROFIT_LOSS: 'Profitability analysis by period',
      BUDGET_VARIANCE: 'Budget vs actual performance comparison',
      CUSTOM_QUERY: 'Custom data query and analysis'
    }
    return descriptions[type] || 'Custom report template'
  }

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [templates, searchQuery, selectedCategory])

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<ReportCategory, ReportTemplate[]> = {
      FINANCIAL: [],
      CUSTOMER: [],
      INVOICE: [],
      PAYMENT: [],
      TAX: [],
      ANALYTICS: [],
      AUDIT: [],
      COMPLIANCE: [],
      CUSTOM: []
    }

    filteredTemplates.forEach(template => {
      groups[template.category].push(template)
    })

    // Filter out empty groups
    return Object.entries(groups).filter(([_, templates]) => templates.length > 0)
  }, [filteredTemplates])

  const categories: Array<{ value: ReportCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Categories' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'PAYMENT', label: 'Payment' },
    { value: 'TAX', label: 'Tax' },
    { value: 'ANALYTICS', label: 'Analytics' },
    { value: 'AUDIT', label: 'Audit' },
    { value: 'COMPLIANCE', label: 'Compliance' },
    { value: 'CUSTOM', label: 'Custom' }
  ]

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Templates
          </CardTitle>
          {onCreateCustom && (
            <Button onClick={onCreateCustom} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as ReportCategory | 'all')}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <LoadingSpinner message="Loading templates..." />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8">
            <FileX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all'
                ? "No templates match your search criteria."
                : "No report templates are available."}
            </p>
            {onCreateCustom && (
              <Button onClick={onCreateCustom}>
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Template
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="p-4 space-y-6">
              {groupedTemplates.map(([category, categoryTemplates]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon(category as ReportCategory)}
                    <h3 className="font-medium text-lg">{category.replace('_', ' ')}</h3>
                    <Badge variant="outline">{categoryTemplates.length}</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {categoryTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md',
                          selectedTemplateId === template.id && 'ring-2 ring-primary'
                        )}
                        onClick={() => onSelectTemplate?.(template)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {getCategoryIcon(template.category)}
                                <div>
                                  <h4 className="font-medium text-sm">{template.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {template.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getCategoryColor(template.category)}>
                                  {template.category}
                                </Badge>
                                {template.isCustom && (
                                  <Badge variant="outline">Custom</Badge>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <span className="ml-2 font-medium">{template.type.replace('_', ' ')}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Parameters:</span>
                                <span className="ml-2 font-medium">{template.parameters.length}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Formats:</span>
                                <span className="ml-2">
                                  {template.outputFormats.map((format, index) => (
                                    <Badge key={format} variant="outline" className="ml-1">
                                      {format}
                                    </Badge>
                                  ))}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Updated:</span>
                                <span className="ml-2 font-medium">
                                  {new Date(template.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Type Description */}
                            <div className="bg-muted/50 p-3 rounded text-sm">
                              <p className="text-muted-foreground">
                                {getTypeDescription(template.type)}
                              </p>
                            </div>

                            {/* Schedule Information */}
                            {template.schedule && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Scheduled:</span>
                                <Badge variant="outline">
                                  {template.schedule.frequency} at {template.schedule.time}
                                </Badge>
                                {template.schedule.isActive && (
                                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                                )}
                              </div>
                            )}

                            {/* Action Hint */}
                            {selectedTemplateId === template.id && (
                              <div className="flex items-center gap-2 text-sm text-primary">
                                <Settings className="h-4 w-4" />
                                <span>Configure parameters to generate this report</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}