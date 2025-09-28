import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PaymentMethodSelector, CreditCardInfo, BankTransferInfo } from '@/components/payments/PaymentMethodSelector'
import { PaymentProcessor, PaymentResult } from '@/components/payments/PaymentProcessor'
import { PaymentStatusTracker } from '@/components/payments/PaymentStatusTracker'
import { LoadingSpinner } from '@/components/ui/loading'
import { useAuth } from '@/hooks/useAuth'
import { useLoadingState } from '@/hooks/useLoadingState'
import {
  ArrowLeft,
  CreditCard,
  FileText,
  User,
  Building,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentPageProps {
  className?: string
}

interface PaymentIntent {
  id: string
  amount: number
  currency: string
  description: string
  invoiceId?: string
  customerId?: string
  customer?: {
    id: string
    name: string
    email: string
    type: 'PERSON' | 'BUSINESS'
  }
  invoice?: {
    id: string
    number: string
    dueDate: string
    status: string
  }
  metadata?: Record<string, any>
}

// Mock payment intent data
const mockPaymentIntent: PaymentIntent = {
  id: 'pi_1234567890',
  amount: 1250.00,
  currency: 'USD',
  description: 'Payment for Invoice INV-001',
  invoiceId: 'inv_001',
  customerId: 'cust_123',
  customer: {
    id: 'cust_123',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    type: 'BUSINESS'
  },
  invoice: {
    id: 'inv_001',
    number: 'INV-001',
    dueDate: '2024-02-15',
    status: 'SENT'
  }
}

export function PaymentPage({ className }: PaymentPageProps) {
  const { paymentId } = useParams<{ paymentId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const loadingState = useLoadingState()

  // Payment flow state
  const [currentStep, setCurrentStep] = useState<'method' | 'processing' | 'status'>('method')
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [paymentInfo, setPaymentInfo] = useState<CreditCardInfo | BankTransferInfo | null>(null)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // URL parameters
  const intentId = searchParams.get('intent')
  const returnUrl = searchParams.get('return_url')
  const mode = searchParams.get('mode') || 'payment' // 'payment' or 'status'

  useEffect(() => {
    if (mode === 'status' && paymentId) {
      setCurrentStep('status')
    } else if (intentId) {
      fetchPaymentIntent(intentId)
    } else {
      setError('Missing payment intent or payment ID')
    }
  }, [paymentId, intentId, mode])

  const fetchPaymentIntent = async (intentId: string) => {
    try {
      loadingState.startLoading({
        showProgress: true,
        progressMessage: 'Loading payment details...'
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In real implementation:
      // const response = await paymentService.getPaymentIntent(intentId)
      setPaymentIntent(mockPaymentIntent)
      setCurrentStep('method')
    } catch (err: any) {
      setError(err.message || 'Failed to load payment details')
    } finally {
      loadingState.stopLoading({ success: true })
    }
  }

  const handlePaymentComplete = (result: PaymentResult) => {
    setPaymentResult(result)
    if (result.status === 'COMPLETED' || result.status === 'PENDING') {
      setCurrentStep('status')
    }
  }

  const handleBackToMethod = () => {
    setCurrentStep('method')
    setPaymentResult(null)
    setError(null)
  }

  const handleReturnToSite = () => {
    if (returnUrl) {
      window.location.href = returnUrl
    } else {
      navigate('/dashboard')
    }
  }

  const renderPaymentHeader = () => {
    if (!paymentIntent) return null

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {paymentIntent.description}
              </p>
            </div>
            <Badge variant="outline" className="text-lg font-medium px-3 py-1">
              {paymentIntent.currency} {paymentIntent.amount.toFixed(2)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information */}
            {paymentIntent.customer && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  {paymentIntent.customer.type === 'BUSINESS' ? (
                    <Building className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  Customer
                </h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{paymentIntent.customer.name}</p>
                  <p className="text-muted-foreground">{paymentIntent.customer.email}</p>
                </div>
              </div>
            )}

            {/* Invoice Information */}
            {paymentIntent.invoice && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice
                </h4>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{paymentIntent.invoice.number}</p>
                  <p className="text-muted-foreground">
                    Due: {new Date(paymentIntent.invoice.dueDate).toLocaleDateString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {paymentIntent.invoice.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment ID:</span>
            <span className="font-mono">{paymentIntent.id}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderStepIndicator = () => {
    if (mode === 'status') return null

    const steps = [
      { key: 'method', label: 'Payment Method', icon: <CreditCard className="h-4 w-4" /> },
      { key: 'processing', label: 'Processing', icon: <Info className="h-4 w-4" /> },
      { key: 'status', label: 'Complete', icon: <CheckCircle className="h-4 w-4" /> }
    ]

    const currentIndex = steps.findIndex(step => step.key === currentStep)

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                  index <= currentIndex
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted text-muted-foreground'
                )}>
                  {step.icon}
                </div>
                <span className={cn(
                  'ml-2 text-sm font-medium',
                  index <= currentIndex ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'w-12 h-px mx-4 transition-colors',
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loadingState.isLoading) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <LoadingSpinner size="lg" message="Loading payment details..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('container mx-auto p-6 space-y-6', className)}>
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (mode === 'status' && paymentId) {
    return (
      <div className={cn('container mx-auto p-6 space-y-6', className)}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/payments')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments
          </Button>

          <h1 className="text-2xl font-bold">Payment Status</h1>
        </div>

        <PaymentStatusTracker
          paymentId={paymentId}
          onRetry={() => navigate(`/payment?intent=${paymentId}&mode=payment`)}
        />
      </div>
    )
  }

  if (!paymentIntent) {
    return (
      <div className={cn('container mx-auto p-6', className)}>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Payment details not found. Please check the payment link and try again.
          </AlertDescription>
        </Alert>
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

        <h1 className="text-2xl font-bold">
          {currentStep === 'method' ? 'Complete Payment' :
           currentStep === 'processing' ? 'Processing Payment' :
           'Payment Complete'}
        </h1>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Payment Header */}
      {renderPaymentHeader()}

      {/* Main Content */}
      {currentStep === 'method' && (
        <div className="space-y-6">
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onMethodSelect={setSelectedMethod}
            onPaymentInfoChange={setPaymentInfo}
            amount={paymentIntent.amount}
            currency={paymentIntent.currency}
          />

          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentStep('processing')}
              disabled={!selectedMethod}
              size="lg"
              className="flex-1"
            >
              Continue to Payment
            </Button>
            <Button
              variant="outline"
              onClick={handleReturnToSite}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'processing' && (
        <div className="space-y-6">
          <PaymentProcessor
            amount={paymentIntent.amount}
            currency={paymentIntent.currency}
            paymentMethodId={selectedMethod}
            paymentInfo={paymentInfo}
            invoiceId={paymentIntent.invoiceId}
            customerId={paymentIntent.customerId}
            description={paymentIntent.description}
            onPaymentComplete={handlePaymentComplete}
            onPaymentCancel={handleBackToMethod}
          />
        </div>
      )}

      {currentStep === 'status' && paymentResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {paymentResult.status === 'COMPLETED' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : paymentResult.status === 'FAILED' ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <Info className="h-5 w-5 text-blue-600" />
                )}
                Payment {paymentResult.status === 'COMPLETED' ? 'Complete' :
                        paymentResult.status === 'FAILED' ? 'Failed' :
                        'Pending'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">
                  {paymentIntent.currency} {paymentResult.amount.toFixed(2)}
                </p>
                <p className="text-muted-foreground">
                  {paymentResult.status === 'COMPLETED' ? 'Your payment has been processed successfully.' :
                   paymentResult.status === 'FAILED' ? 'Your payment could not be processed.' :
                   'Your payment is being processed.'}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-sm">{paymentResult.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <span className="text-sm">{paymentResult.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Processed:</span>
                  <span className="text-sm">
                    {new Date(paymentResult.processedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {paymentResult.receipt && (
                  <Button variant="outline" asChild className="flex-1">
                    <a href={paymentResult.receipt.url}>
                      Download Receipt
                    </a>
                  </Button>
                )}

                <Button onClick={handleReturnToSite} className="flex-1">
                  {returnUrl ? 'Return to Site' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Show full status tracker for pending payments */}
          {paymentResult.status === 'PENDING' && (
            <PaymentStatusTracker
              paymentId={paymentResult.id}
              autoRefresh={true}
            />
          )}
        </div>
      )}
    </div>
  )
}