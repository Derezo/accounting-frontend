import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  MessageSquare,
  Sparkles,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookOpen,
  RefreshCw,
  Send,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIInsight, DateRange } from '@/types/advanced-analytics'

interface AIInsightsPanelProps {
  context?: {
    dashboardId?: string
    reportId?: string
    kpiId?: string
    dateRange?: DateRange
  }
  className?: string
}

export function AIInsightsPanel({ context, className }: AIInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState('insights')
  const [isGenerating, setIsGenerating] = useState(false)
  const [customQuestion, setCustomQuestion] = useState('')
  const [insights, setInsights] = useState<AIInsight[]>([])

  // Mock insights data
  useEffect(() => {
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'TREND',
        title: 'Revenue Growth Accelerating',
        description: 'Monthly revenue has increased by 12.5% compared to last month, with strong performance in enterprise accounts. This trend is likely to continue based on current pipeline data.',
        confidence: 0.89,
        priority: 'HIGH',
        category: 'FINANCIAL',
        tags: ['revenue', 'growth', 'enterprise'],
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionItems: [
          'Consider increasing sales team capacity in enterprise segment',
          'Review and optimize pricing strategy for maximum growth',
          'Invest in customer success to maintain growth momentum'
        ],
        sources: ['financial_data', 'sales_pipeline', 'market_trends'],
        relatedMetrics: ['monthly_revenue', 'customer_acquisition_cost', 'lifetime_value']
      },
      {
        id: '2',
        type: 'ANOMALY',
        title: 'Unusual Customer Activity Pattern',
        description: 'Customer engagement has dropped by 15% on weekends compared to weekdays, which is unusual for this time of year. This could indicate a shift in user behavior or a technical issue.',
        confidence: 0.76,
        priority: 'MEDIUM',
        category: 'OPERATIONAL',
        tags: ['customer_behavior', 'engagement', 'anomaly'],
        generatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionItems: [
          'Investigate technical systems for weekend performance issues',
          'Survey customers about weekend usage preferences',
          'Consider weekend-specific engagement strategies'
        ],
        sources: ['user_activity_logs', 'system_metrics', 'historical_patterns'],
        relatedMetrics: ['daily_active_users', 'session_duration', 'bounce_rate']
      },
      {
        id: '3',
        type: 'RECOMMENDATION',
        title: 'Optimize Payment Processing',
        description: 'Analysis shows that implementing automated payment reminders could reduce outstanding invoices by an estimated 8% and improve cash flow by $25,000 monthly.',
        confidence: 0.82,
        priority: 'MEDIUM',
        category: 'FINANCIAL',
        tags: ['payments', 'automation', 'cash_flow'],
        generatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actionItems: [
          'Implement automated payment reminder system',
          'Set up graduated reminder schedule (7, 14, 30 days)',
          'Track effectiveness and adjust reminder frequency'
        ],
        sources: ['payment_history', 'invoice_data', 'industry_benchmarks'],
        relatedMetrics: ['days_sales_outstanding', 'collection_rate', 'bad_debt_ratio']
      },
      {
        id: '4',
        type: 'OPPORTUNITY',
        title: 'Cross-Selling Opportunity Identified',
        description: 'Customers with subscription plans show 40% higher lifetime value. Current customers without subscriptions represent a $150k opportunity.',
        confidence: 0.91,
        priority: 'HIGH',
        category: 'STRATEGIC',
        tags: ['cross_selling', 'subscriptions', 'revenue'],
        generatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        actionItems: [
          'Develop targeted subscription offers for existing customers',
          'Create onboarding flow for subscription upgrades',
          'Track conversion rates and optimize offers'
        ],
        sources: ['customer_segmentation', 'purchase_history', 'ltv_analysis'],
        relatedMetrics: ['customer_lifetime_value', 'subscription_rate', 'cross_sell_rate']
      }
    ]

    setInsights(mockInsights)
  }, [])

  const handleGenerateInsight = async () => {
    if (!customQuestion.trim()) return

    setIsGenerating(true)
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newInsight: AIInsight = {
        id: `custom_${Date.now()}`,
        type: 'CUSTOM',
        title: `Custom Analysis: ${customQuestion.slice(0, 50)}...`,
        description: `Based on your question "${customQuestion}", here's what the AI analysis reveals: This is a simulated response that would contain intelligent insights based on your specific query and current data patterns.`,
        confidence: 0.75,
        priority: 'MEDIUM',
        category: 'CUSTOM',
        tags: ['custom_query', 'ai_generated'],
        generatedAt: new Date().toISOString(),
        actionItems: [
          'Review the analysis details',
          'Consider implementing suggested changes',
          'Monitor results and adjust strategy'
        ],
        sources: ['custom_analysis'],
        relatedMetrics: []
      }

      setInsights(prev => [newInsight, ...prev])
      setCustomQuestion('')
    } finally {
      setIsGenerating(false)
    }
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'TREND':
        return <TrendingUp className="h-4 w-4" />
      case 'ANOMALY':
        return <AlertTriangle className="h-4 w-4" />
      case 'RECOMMENDATION':
        return <Lightbulb className="h-4 w-4" />
      case 'OPPORTUNITY':
        return <Target className="h-4 w-4" />
      case 'CUSTOM':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'TREND':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'ANOMALY':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'RECOMMENDATION':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'OPPORTUNITY':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'CUSTOM':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500'
      case 'MEDIUM':
        return 'bg-yellow-500'
      case 'LOW':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const renderInsightCard = (insight: AIInsight) => {
    return (
      <Card key={insight.id} className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={cn(
                'p-2 rounded-lg border',
                getInsightColor(insight.type)
              )}>
                {getInsightIcon(insight.type)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    getPriorityColor(insight.priority)
                  )} />
                </div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {insight.type}
                  </Badge>
                  <Badge variant={insight.priority === 'HIGH' ? 'destructive' : 'secondary'} className="text-xs">
                    {insight.priority}
                  </Badge>
                  <span>{Math.round(insight.confidence * 100)}% confidence</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              {new Date(insight.generatedAt).toLocaleString()}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.description}
          </p>

          {insight.actionItems && insight.actionItems.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Recommended Actions:</h5>
              <ul className="space-y-1">
                {insight.actionItems.map((action, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start space-x-2">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <ThumbsDown className="h-3 w-3 mr-1" />
                Not helpful
              </Button>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="h-6 px-2">
                <BookOpen className="h-3 w-3 mr-1" />
                Learn more
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCustomQuery = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Ask AI a Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What would you like to analyze?
            </label>
            <Textarea
              placeholder="e.g., Why did revenue drop last week? What's causing the increase in customer churn? How can we improve conversion rates?"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
          </div>
          <Button
            onClick={handleGenerateInsight}
            disabled={!customQuestion.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating insight...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generate AI Insight
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderAnalyticsSummary = () => {
    const totalInsights = insights.length
    const highPriorityInsights = insights.filter(i => i.priority === 'HIGH').length
    const recentInsights = insights.filter(i =>
      new Date(i.generatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Insights</p>
                <p className="text-xl font-bold">{totalInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">High Priority</p>
                <p className="text-xl font-bold">{highPriorityInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Last 24h</p>
                <p className="text-xl font-bold">{recentInsights}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Insights
          </h2>
          <p className="text-muted-foreground">
            AI-powered analysis and recommendations for your business
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Insights
        </Button>
      </div>

      {renderAnalyticsSummary()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">Recent Insights</TabsTrigger>
          <TabsTrigger value="custom">Custom Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
              {insights.map(renderInsightCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {renderCustomQuery()}

          {insights.filter(i => i.type === 'CUSTOM').length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Your Custom Insights</h3>
              <div className="space-y-4">
                {insights.filter(i => i.type === 'CUSTOM').map(renderInsightCard)}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}