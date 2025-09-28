import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface LoadingState {
  isLoading: boolean
  progress?: number
  message?: string
  estimated?: string
  startTime?: number
}

interface LoadingOptions {
  showProgress?: boolean
  estimatedDuration?: number
  progressMessage?: string
  successMessage?: string
  errorMessage?: string
  autoHide?: boolean
  hideDelay?: number
}

export function useLoadingState(initialLoading = false) {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading
  })

  const intervalRef = useRef<NodeJS.Timeout>()
  const timeoutRef = useRef<NodeJS.Timeout>()

  const startLoading = useCallback((options: LoadingOptions = {}) => {
    const {
      showProgress = false,
      estimatedDuration = 5000,
      progressMessage = 'Loading...',
      autoHide = false,
      hideDelay = 3000
    } = options

    setState({
      isLoading: true,
      progress: showProgress ? 0 : undefined,
      message: progressMessage,
      estimated: estimatedDuration ? `${Math.ceil(estimatedDuration / 1000)}s` : undefined,
      startTime: Date.now()
    })

    // Simulate progress if enabled
    if (showProgress && estimatedDuration) {
      const updateInterval = estimatedDuration / 100
      let currentProgress = 0

      intervalRef.current = setInterval(() => {
        currentProgress += Math.random() * 3 + 1
        if (currentProgress >= 95) {
          currentProgress = 95 // Never reach 100% automatically
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
        }

        setState(prev => ({
          ...prev,
          progress: Math.min(currentProgress, 95)
        }))
      }, updateInterval)
    }

    // Auto-hide if specified
    if (autoHide) {
      timeoutRef.current = setTimeout(() => {
        stopLoading()
      }, hideDelay)
    }
  }, [])

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress,
      message: message || prev.message
    }))
  }, [])

  const stopLoading = useCallback((options: { success?: boolean; message?: string } = {}) => {
    const { success = true, message } = options

    // Clear intervals and timeouts
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Complete progress if it was being shown
    if (state.progress !== undefined) {
      setState(prev => ({ ...prev, progress: 100 }))

      // Show completion state briefly
      setTimeout(() => {
        setState({
          isLoading: false,
          progress: undefined,
          message: undefined,
          estimated: undefined
        })

        if (message) {
          if (success) {
            toast.success(message)
          } else {
            toast.error(message)
          }
        }
      }, 300)
    } else {
      setState({
        isLoading: false,
        progress: undefined,
        message: undefined,
        estimated: undefined
      })

      if (message) {
        if (success) {
          toast.success(message)
        } else {
          toast.error(message)
        }
      }
    }
  }, [state.progress])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setState({
      isLoading: false,
      progress: undefined,
      message: undefined,
      estimated: undefined
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    startLoading,
    stopLoading,
    updateProgress,
    reset
  }
}

// Multiple loading states manager
export function useMultipleLoadingStates() {
  const [states, setStates] = useState<Record<string, LoadingState>>({})

  const startLoading = useCallback((key: string, options: LoadingOptions = {}) => {
    const {
      showProgress = false,
      estimatedDuration = 5000,
      progressMessage = 'Loading...'
    } = options

    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        progress: showProgress ? 0 : undefined,
        message: progressMessage,
        estimated: estimatedDuration ? `${Math.ceil(estimatedDuration / 1000)}s` : undefined,
        startTime: Date.now()
      }
    }))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setStates(prev => {
      const newStates = { ...prev }
      delete newStates[key]
      return newStates
    })
  }, [])

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress,
        message: message || prev[key]?.message
      }
    }))
  }, [])

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return states[key]?.isLoading || false
    }
    return Object.values(states).some(state => state.isLoading)
  }, [states])

  const getState = useCallback((key: string) => {
    return states[key]
  }, [states])

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => {
        const newStates = { ...prev }
        delete newStates[key]
        return newStates
      })
    } else {
      setStates({})
    }
  }, [])

  return {
    states,
    startLoading,
    stopLoading,
    updateProgress,
    isLoading,
    getState,
    reset
  }
}

// Hook for operation feedback
export function useOperationFeedback() {
  const showSuccess = useCallback((message: string, options?: {
    duration?: number
    position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
  }) => {
    const { duration = 4000, position = 'top-right' } = options || {}
    toast.success(message, { duration, position })
  }, [])

  const showError = useCallback((message: string, options?: {
    duration?: number
    position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
  }) => {
    const { duration = 5000, position = 'top-right' } = options || {}
    toast.error(message, { duration, position })
  }, [])

  const showInfo = useCallback((message: string, options?: {
    duration?: number
    position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
  }) => {
    const { duration = 3000, position = 'top-right' } = options || {}
    toast(message, { duration, position, icon: 'ℹ️' })
  }, [])

  const showWarning = useCallback((message: string, options?: {
    duration?: number
    position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right'
  }) => {
    const { duration = 4000, position = 'top-right' } = options || {}
    toast(message, { duration, position, icon: '⚠️' })
  }, [])

  const showLoading = useCallback((message: string, promise: Promise<any>, options?: {
    successMessage?: string
    errorMessage?: string
  }) => {
    const { successMessage = 'Operation completed', errorMessage = 'Operation failed' } = options || {}

    toast.promise(promise, {
      loading: message,
      success: successMessage,
      error: errorMessage
    })
  }, [])

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading
  }
}

// Hook for async operations with loading states
export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  options: {
    successMessage?: string
    errorMessage?: string
    showProgress?: boolean
    estimatedDuration?: number
    onSuccess?: (data: T) => void
    onError?: (error: any) => void
  } = {}
) {
  const loadingState = useLoadingState()
  const { showSuccess, showError } = useOperationFeedback()

  const execute = useCallback(async (...args: any[]) => {
    try {
      loadingState.startLoading({
        showProgress: options.showProgress,
        estimatedDuration: options.estimatedDuration,
        progressMessage: 'Processing...'
      })

      const result = await operation(...args)

      loadingState.stopLoading({ success: true })

      if (options.successMessage) {
        showSuccess(options.successMessage)
      }

      options.onSuccess?.(result)
      return result
    } catch (error) {
      loadingState.stopLoading({ success: false })

      if (options.errorMessage) {
        showError(options.errorMessage)
      }

      options.onError?.(error)
      throw error
    }
  }, [operation, loadingState, showSuccess, showError, options])

  return {
    execute,
    ...loadingState
  }
}

// Hook for tracking multiple operations
export function useOperationTracker() {
  const [operations, setOperations] = useState<Record<string, {
    status: 'idle' | 'loading' | 'success' | 'error'
    message?: string
    startTime?: number
    endTime?: number
    progress?: number
  }>>({})

  const startOperation = useCallback((key: string, message?: string) => {
    setOperations(prev => ({
      ...prev,
      [key]: {
        status: 'loading',
        message,
        startTime: Date.now(),
        progress: 0
      }
    }))
  }, [])

  const updateOperation = useCallback((key: string, progress: number, message?: string) => {
    setOperations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress,
        message: message || prev[key]?.message
      }
    }))
  }, [])

  const completeOperation = useCallback((key: string, success: boolean, message?: string) => {
    setOperations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        status: success ? 'success' : 'error',
        endTime: Date.now(),
        message: message || prev[key]?.message,
        progress: 100
      }
    }))

    // Auto-remove after delay
    setTimeout(() => {
      setOperations(prev => {
        const newOps = { ...prev }
        delete newOps[key]
        return newOps
      })
    }, 3000)
  }, [])

  const clearOperation = useCallback((key: string) => {
    setOperations(prev => {
      const newOps = { ...prev }
      delete newOps[key]
      return newOps
    })
  }, [])

  const getOperation = useCallback((key: string) => {
    return operations[key]
  }, [operations])

  const isOperationActive = useCallback((key: string) => {
    return operations[key]?.status === 'loading'
  }, [operations])

  const hasActiveOperations = useCallback(() => {
    return Object.values(operations).some(op => op.status === 'loading')
  }, [operations])

  return {
    operations,
    startOperation,
    updateOperation,
    completeOperation,
    clearOperation,
    getOperation,
    isOperationActive,
    hasActiveOperations
  }
}