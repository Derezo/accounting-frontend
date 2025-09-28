import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Building2,
  AlertTriangle,
  Loader2,
  Shield,
  Receipt,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaymentProcessorProps {
  amount: number
  currency: string
  paymentMethodId: string
  paymentInfo?: any
  invoiceId?: string
  customerId?: string
  description?: string
  onPaymentComplete?: (result: PaymentResult) => void
  onPaymentCancel?: () => void
  className?: string
}

export interface PaymentResult {
  id: string
  status: 'COMPLETED' | 'FAILED' | 'PENDING' | 'CANCELLED' | 'REQUIRES_ACTION'
  transactionId: string
  amount: number
  currency: string
  paymentMethod: string
  fee: number
  netAmount: number
  processedAt: string
  receipt?: {
    url: string
    id: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
  nextAction?: {
    type: 'REDIRECT' | 'VERIFY_MICRO_DEPOSITS' | 'VERIFY_SMS' | 'VERIFY_EMAIL'
    url?: string
    instructions?: string
  }
}

type ProcessingStage =
  | 'VALIDATING'
  | 'AUTHORIZING'
  | 'PROCESSING'
  | 'VERIFYING'
  | 'COMPLETING'
  | 'COMPLETED'
  | 'FAILED'

export function PaymentProcessor({
  amount,
  currency,
  paymentMethodId,
  paymentInfo,
  invoiceId,
  customerId,
  description,
  onPaymentComplete,
  onPaymentCancel,
  className
}: PaymentProcessorProps) {
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('VALIDATING')
  const [progress, setProgress] = useState(0)
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState(30)
  const [elapsedTime, setElapsedTime] = useState(0)

  const stages = [
    { key: 'VALIDATING', label: 'Validating Payment Details', progress: 20 },
    { key: 'AUTHORIZING', label: 'Authorizing Payment', progress: 40 },
    { key: 'PROCESSING', label: 'Processing Transaction', progress: 60 },
    { key: 'VERIFYING', label: 'Verifying Transaction', progress: 80 },
    { key: 'COMPLETING', label: 'Completing Payment', progress: 90 },
    { key: 'COMPLETED', label: 'Payment Complete', progress: 100 }
  ]

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isProcessing && processingStage !== 'COMPLETED' && processingStage !== 'FAILED') {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isProcessing, processingStage])

  const simulatePaymentProcessing = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Simulate different processing times based on payment method
      const processingTimes = {
        'credit_card': { stages: 5, timePerStage: 2000 },
        'debit_card': { stages: 5, timePerStage: 2000 },
        'bank_transfer': { stages: 4, timePerStage: 3000 },
        'wire_transfer': { stages: 4, timePerStage: 3000 },
        'paypal': { stages: 3, timePerStage: 1500 },
        'check': { stages: 2, timePerStage: 1000 }
      }

      const config = processingTimes[paymentMethodId as keyof typeof processingTimes] || processingTimes.credit_card
      setEstimatedTime(Math.ceil((config.stages * config.timePerStage) / 1000))

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i]
        setProcessingStage(stage.key as ProcessingStage)
        setProgress(stage.progress)

        // Simulate potential failure scenarios
        if (Math.random() < 0.05 && stage.key === 'AUTHORIZING') { // 5% chance of authorization failure
          throw new Error('Payment authorization failed. Please check your payment method details.')
        }

        if (Math.random() < 0.03 && stage.key === 'PROCESSING') { // 3% chance of processing failure
          throw new Error('Payment processing failed due to a network error. Please try again.')
        }

        await new Promise(resolve => setTimeout(resolve, config.timePerStage))

        if (stage.key === 'COMPLETED') {
          break
        }
      }

      // Generate successful payment result
      const result: PaymentResult = {
        id: `pay_${Date.now()}`,
        status: 'COMPLETED',
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency,
        paymentMethod: paymentMethodId,
        fee: calculateProcessingFee(amount, paymentMethodId),
        netAmount: amount - calculateProcessingFee(amount, paymentMethodId),
        processedAt: new Date().toISOString(),
        receipt: {
          url: `/receipts/pay_${Date.now()}.pdf`,
          id: `rcpt_${Math.random().toString(36).substr(2, 9)}`
        }
      }

      // Handle special cases for certain payment methods
      if (paymentMethodId === 'bank_transfer') {
        result.status = 'PENDING'
        result.nextAction = {
          type: 'VERIFY_MICRO_DEPOSITS',
          instructions: 'Please verify the micro-deposits in your bank account within 2-3 business days to complete the payment.'
        }
      }

      setPaymentResult(result)
      setProcessingStage('COMPLETED')
      setProgress(100)
      onPaymentComplete?.(result)

    } catch (error: any) {
      setProcessingStage('FAILED')
      setError(error.message)

      // Generate failed payment result
      const failedResult: PaymentResult = {
        id: `pay_${Date.now()}`,
        status: 'FAILED',
        transactionId: '',
        amount,
        currency,
        paymentMethod: paymentMethodId,
        fee: 0,
        netAmount: amount,
        processedAt: new Date().toISOString(),
        error: {
          code: 'PAYMENT_FAILED',
          message: error.message
        }
      }

      setPaymentResult(failedResult)
      onPaymentComplete?.(failedResult)
    } finally {
      setIsProcessing(false)
    }
  }

  const calculateProcessingFee = (amount: number, methodId: string): number => {
    const feeStructures = {
      credit_card: { percentage: 0.029, fixed: 0.30 },
      debit_card: { percentage: 0.014, fixed: 0.30 },
      bank_transfer: { percentage: 0, fixed: 0.80 },
      wire_transfer: { percentage: 0, fixed: 25.00 },
      paypal: { percentage: 0.0349, fixed: 0.49 },
      check: { percentage: 0, fixed: 0 }
    }

    const fee = feeStructures[methodId as keyof typeof feeStructures] || feeStructures.credit_card
    return (amount * fee.percentage) + fee.fixed
  }

  const getPaymentMethodIcon = (methodId: string) => {
    const icons = {
      credit_card: <CreditCard className="h-5 w-5" />,
      debit_card: <CreditCard className="h-5 w-5" />,
      bank_transfer: <Building2 className="h-5 w-5" />,
      wire_transfer: <Building2 className="h-5 w-5" />,
      paypal: <CreditCard className="h-5 w-5" />,
      check: <Receipt className="h-5 w-5" />
    }
    return icons[methodId as keyof typeof icons] || <CreditCard className="h-5 w-5" />
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: { variant: 'default' as const, icon: <CheckCircle className="h-4 w-4" />, className: 'bg-green-100 text-green-800 border-green-200' },
      FAILED: { variant: 'destructive' as const, icon: <XCircle className="h-4 w-4" />, className: 'bg-red-100 text-red-800 border-red-200' },
      PENDING: { variant: 'secondary' as const, icon: <Clock className="h-4 w-4" />, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      CANCELLED: { variant: 'outline' as const, icon: <XCircle className="h-4 w-4" />, className: 'bg-gray-100 text-gray-800 border-gray-200' },
      REQUIRES_ACTION: { variant: 'outline' as const, icon: <AlertTriangle className="h-4 w-4" />, className: 'bg-orange-100 text-orange-800 border-orange-200' }
    }

    const config = variants[status as keyof typeof variants] || variants.PENDING

    return (
      <Badge variant={config.variant} className={cn('gap-1', config.className)}>
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isProcessing && !paymentResult) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Ready to Process Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">{currency} {amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fee:</span>
              <span>{currency} {calculateProcessingFee(amount, paymentMethodId).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{currency} {(amount + calculateProcessingFee(amount, paymentMethodId)).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={simulatePaymentProcessing}
              className="flex-1"
              size="lg"
            >
              {getPaymentMethodIcon(paymentMethodId)}
              Process Payment
            </Button>
            <Button
              variant="outline"
              onClick={onPaymentCancel}
              size="lg"
            >
              Cancel
            </Button>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your payment information is secured with 256-bit SSL encryption.
              All transactions are processed through certified payment processors.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isProcessing && <Loader2 className="h-5 w-5 animate-spin" />}
          {processingStage === 'COMPLETED' && <CheckCircle className="h-5 w-5 text-green-600" />}
          {processingStage === 'FAILED' && <XCircle className="h-5 w-5 text-red-600" />}

          {isProcessing ? 'Processing Payment...' :
           processingStage === 'COMPLETED' ? 'Payment Complete' :
           'Payment Failed'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {stages.find(s => s.key === processingStage)?.label || 'Processing...'}
                </span>
                <span>
                  {formatTime(elapsedTime)} / ~{formatTime(estimatedTime)}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please do not close this window or navigate away during payment processing.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Payment Result */}
        {paymentResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              {getStatusBadge(paymentResult.status)}
            </div>

            {paymentResult.transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm">{paymentResult.transactionId}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span>{currency} {paymentResult.amount.toFixed(2)}</span>
            </div>

            {paymentResult.fee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fee:</span>
                <span>{currency} {paymentResult.fee.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Net Amount:</span>
              <span className="font-medium">{currency} {paymentResult.netAmount.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processed:</span>
              <span className="text-sm">
                {new Date(paymentResult.processedAt).toLocaleString()}
              </span>
            </div>

            {/* Error Display */}
            {paymentResult.error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error {paymentResult.error.code}:</strong> {paymentResult.error.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Next Action Required */}
            {paymentResult.nextAction && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Action Required:</strong> {paymentResult.nextAction.instructions}
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {paymentResult.receipt && (
                <Button variant="outline" className="flex-1 gap-2">
                  <Download className="h-4 w-4" />
                  Download Receipt
                </Button>
              )}

              {paymentResult.status === 'FAILED' && (
                <Button
                  onClick={() => {
                    setPaymentResult(null)
                    setError(null)
                    setProcessingStage('VALIDATING')
                    setProgress(0)
                    setElapsedTime(0)
                  }}
                  className="flex-1"
                >
                  Try Again
                </Button>
              )}

              {paymentResult.status === 'COMPLETED' && (
                <Button className="flex-1" onClick={() => window.location.reload()}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}