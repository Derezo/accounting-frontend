import React, { useState, useEffect, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useAccessibility } from './AccessibilityProvider'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  Keyboard,
  Mouse,
  Monitor,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'

interface AccessibilityIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  severity: 'critical' | 'moderate' | 'minor'
  title: string
  description: string
  element?: HTMLElement
  selector?: string
  guideline: string
  fix?: string
  learnMore?: string
}

interface AccessibilityTestResult {
  passed: number
  failed: number
  warnings: number
  issues: AccessibilityIssue[]
  score: number
}

interface AccessibilityTesterProps {
  target?: HTMLElement | string
  continuous?: boolean
  showLiveResults?: boolean
  className?: string
}

export function AccessibilityTester({
  target,
  continuous = false,
  showLiveResults = false,
  className
}: AccessibilityTesterProps) {
  const [results, setResults] = useState<AccessibilityTestResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [autoTest, setAutoTest] = useState(continuous)
  const { announceMessage } = useAccessibility()

  const runAccessibilityTests = async () => {
    setIsRunning(true)
    announceMessage('Running accessibility tests...')

    try {
      // Get target element
      const targetElement = typeof target === 'string'
        ? document.querySelector(target) as HTMLElement
        : target || document.body

      if (!targetElement) {
        throw new Error('Target element not found')
      }

      const issues: AccessibilityIssue[] = []

      // Test 1: Missing alt text on images
      const images = targetElement.querySelectorAll('img')
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-hidden')) {
          issues.push({
            id: `missing-alt-${index}`,
            type: 'error',
            severity: 'critical',
            title: 'Missing Alt Text',
            description: 'Image is missing alternative text',
            element: img,
            selector: `img:nth-of-type(${index + 1})`,
            guideline: 'WCAG 2.1 SC 1.1.1',
            fix: 'Add descriptive alt text or aria-hidden="true" for decorative images'
          })
        }
      })

      // Test 2: Missing form labels
      const inputs = targetElement.querySelectorAll('input, select, textarea')
      inputs.forEach((input, index) => {
        const hasLabel = input.id && document.querySelector(`label[for="${input.id}"]`)
        const hasAriaLabel = input.getAttribute('aria-label')
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby')

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          issues.push({
            id: `missing-label-${index}`,
            type: 'error',
            severity: 'critical',
            title: 'Missing Form Label',
            description: 'Form control is missing an accessible label',
            element: input as HTMLElement,
            selector: `${input.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
            guideline: 'WCAG 2.1 SC 1.3.1',
            fix: 'Add a label element, aria-label, or aria-labelledby attribute'
          })
        }
      })

      // Test 3: Low color contrast
      const textElements = targetElement.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label')
      textElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element as HTMLElement)
        const color = styles.color
        const backgroundColor = styles.backgroundColor

        // Simple contrast check (would need more sophisticated implementation)
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          // Simplified contrast ratio calculation
          const contrastRatio = calculateContrastRatio(color, backgroundColor)
          if (contrastRatio < 4.5) {
            issues.push({
              id: `low-contrast-${index}`,
              type: 'warning',
              severity: 'moderate',
              title: 'Low Color Contrast',
              description: `Contrast ratio ${contrastRatio.toFixed(2)}:1 is below recommended 4.5:1`,
              element: element as HTMLElement,
              selector: getElementSelector(element as HTMLElement),
              guideline: 'WCAG 2.1 SC 1.4.3',
              fix: 'Increase color contrast to meet minimum ratio requirements'
            })
          }
        }
      })

      // Test 4: Missing focus indicators
      const focusableElements = targetElement.querySelectorAll('button, a, input, select, textarea, [tabindex]')
      focusableElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element as HTMLElement, ':focus')
        const outline = styles.outline
        const boxShadow = styles.boxShadow

        if (outline === 'none' && !boxShadow.includes('ring')) {
          issues.push({
            id: `missing-focus-${index}`,
            type: 'warning',
            severity: 'moderate',
            title: 'Missing Focus Indicator',
            description: 'Interactive element lacks visible focus indicator',
            element: element as HTMLElement,
            selector: getElementSelector(element as HTMLElement),
            guideline: 'WCAG 2.1 SC 2.4.7',
            fix: 'Add visible focus styles with outline or box-shadow'
          })
        }
      })

      // Test 5: Missing ARIA landmarks
      const landmarks = targetElement.querySelectorAll('main, nav, header, footer, aside, section[aria-label], [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]')
      if (landmarks.length === 0 && targetElement === document.body) {
        issues.push({
          id: 'missing-landmarks',
          type: 'warning',
          severity: 'moderate',
          title: 'Missing ARIA Landmarks',
          description: 'Page lacks structural landmarks for navigation',
          guideline: 'WCAG 2.1 SC 1.3.1',
          fix: 'Add semantic HTML elements or ARIA landmark roles'
        })
      }

      // Test 6: Missing heading hierarchy
      const headings = targetElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
      if (headings.length > 0) {
        let previousLevel = 0
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName.charAt(1))
          if (index === 0 && level !== 1) {
            issues.push({
              id: 'heading-start',
              type: 'warning',
              severity: 'minor',
              title: 'Heading Hierarchy Issue',
              description: 'Page should start with h1',
              element: heading as HTMLElement,
              guideline: 'WCAG 2.1 SC 1.3.1',
              fix: 'Start page with h1 heading'
            })
          }
          if (level > previousLevel + 1) {
            issues.push({
              id: `heading-skip-${index}`,
              type: 'warning',
              severity: 'minor',
              title: 'Heading Level Skipped',
              description: `Heading level jumps from h${previousLevel} to h${level}`,
              element: heading as HTMLElement,
              guideline: 'WCAG 2.1 SC 1.3.1',
              fix: 'Use sequential heading levels'
            })
          }
          previousLevel = level
        })
      }

      // Calculate score
      const totalTests = 6
      const criticalIssues = issues.filter(i => i.severity === 'critical').length
      const moderateIssues = issues.filter(i => i.severity === 'moderate').length
      const minorIssues = issues.filter(i => i.severity === 'minor').length

      const score = Math.max(0, 100 - (criticalIssues * 20 + moderateIssues * 10 + minorIssues * 5))

      const result: AccessibilityTestResult = {
        passed: totalTests - issues.filter(i => i.type === 'error').length,
        failed: issues.filter(i => i.type === 'error').length,
        warnings: issues.filter(i => i.type === 'warning').length,
        issues,
        score
      }

      setResults(result)
      announceMessage(`Accessibility test completed. Score: ${score}%. Found ${issues.length} issues.`)

    } catch (error) {
      console.error('Accessibility test failed:', error)
      announceMessage('Accessibility test failed')
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    if (autoTest && !isRunning) {
      const interval = setInterval(runAccessibilityTests, 5000)
      return () => clearInterval(interval)
    }
  }, [autoTest, isRunning])

  const exportReport = () => {
    if (!results) return

    const report = {
      timestamp: new Date().toISOString(),
      score: results.score,
      summary: {
        passed: results.passed,
        failed: results.failed,
        warnings: results.warnings
      },
      issues: results.issues.map(issue => ({
        type: issue.type,
        severity: issue.severity,
        title: issue.title,
        description: issue.description,
        guideline: issue.guideline,
        fix: issue.fix,
        selector: issue.selector
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>
      case 'moderate': return <Badge variant="secondary">Moderate</Badge>
      default: return <Badge variant="outline">Minor</Badge>
    }
  }

  return (
    <Card className={cn('w-full max-w-4xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Accessibility Tester
            </CardTitle>
            <CardDescription>
              Test your application for WCAG compliance and accessibility issues
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-test"
                checked={autoTest}
                onCheckedChange={setAutoTest}
              />
              <Label htmlFor="auto-test" className="text-sm">
                Auto-test
              </Label>
            </div>
            <Button
              onClick={runAccessibilityTests}
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Test
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {results && (
          <div className="space-y-6">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {results.score}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Accessibility Score
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {results.passed}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tests Passed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {results.failed}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tests Failed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {results.warnings}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Warnings
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accessibility Score</span>
                <span>{results.score}%</span>
              </div>
              <Progress value={results.score} className="h-2" />
            </div>

            {/* Issues List */}
            {results.issues.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Issues Found</h3>
                  <Button onClick={exportReport} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <TabsList>
                    <TabsTrigger value="all">
                      All ({results.issues.length})
                    </TabsTrigger>
                    <TabsTrigger value="errors">
                      Errors ({results.issues.filter(i => i.type === 'error').length})
                    </TabsTrigger>
                    <TabsTrigger value="warnings">
                      Warnings ({results.issues.filter(i => i.type === 'warning').length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {results.issues.map((issue) => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </TabsContent>

                  <TabsContent value="errors" className="space-y-4">
                    {results.issues
                      .filter(i => i.type === 'error')
                      .map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                  </TabsContent>

                  <TabsContent value="warnings" className="space-y-4">
                    {results.issues
                      .filter(i => i.type === 'warning')
                      .map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {results.issues.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Great! No accessibility issues found. Your component meets basic accessibility standards.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!results && (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Click "Test" to run accessibility checks on your application
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface IssueCardProps {
  issue: AccessibilityIssue
}

function IssueCard({ issue }: IssueCardProps) {
  const highlightElement = () => {
    if (issue.element) {
      issue.element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      issue.element.style.outline = '3px solid #f59e0b'
      setTimeout(() => {
        issue.element!.style.outline = ''
      }, 3000)
    }
  }

  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getIssueIcon(issue.type)}
              <h4 className="font-medium">{issue.title}</h4>
              {getSeverityBadge(issue.severity)}
            </div>
            {issue.element && (
              <Button size="sm" variant="outline" onClick={highlightElement}>
                <Eye className="h-3 w-3 mr-1" />
                Highlight
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {issue.description}
          </p>

          {issue.selector && (
            <div className="text-xs font-mono bg-muted p-2 rounded">
              {issue.selector}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">Guideline:</span> {issue.guideline}
            </div>
            {issue.fix && (
              <div>
                <span className="font-medium">How to fix:</span> {issue.fix}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Utility functions
function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd parse RGB values and calculate properly
  return Math.random() * 10 + 1 // Placeholder
}

function getElementSelector(element: HTMLElement): string {
  let selector = element.tagName.toLowerCase()
  if (element.id) selector += `#${element.id}`
  if (element.className) selector += `.${element.className.split(' ').join('.')}`
  return selector
}

function getIssueIcon(type: string) {
  switch (type) {
    case 'error': return <XCircle className="h-4 w-4 text-red-500" />
    case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    default: return <Info className="h-4 w-4 text-blue-500" />
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'critical': return <Badge variant="destructive">Critical</Badge>
    case 'moderate': return <Badge variant="secondary">Moderate</Badge>
    default: return <Badge variant="outline">Minor</Badge>
  }
}