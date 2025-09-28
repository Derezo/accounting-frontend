import '@testing-library/jest-dom'
import 'whatwg-fetch'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'

// Extended DOM matchers for better accessibility testing
import '@testing-library/jest-dom'

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock server setup for API testing
export const server = setupServer()

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after all tests
afterAll(() => server.close())

// Mock IntersectionObserver for UI components
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver for UI components
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock localStorage for auth testing
const localStorageMock = {
  getItem: (key: string) => localStorageMock[key] || null,
  setItem: (key: string, value: string) => {
    localStorageMock[key] = value
  },
  removeItem: (key: string) => {
    delete localStorageMock[key]
  },
  clear: () => {
    for (const key in localStorageMock) {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key]
      }
    }
  },
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Mock console.error to avoid noise in tests unless expected
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') ||
     args[0].includes('Error:') ||
     args[0].includes('Failed to load resource'))
  ) {
    return
  }
  originalConsoleError(...args)
}

// Financial calculation precision helper for tests
export const roundToFixed = (num: number, digits: number = 2): number => {
  return Math.round((num + Number.EPSILON) * Math.pow(10, digits)) / Math.pow(10, digits)
}

// Date utilities for consistent testing
export const fixedDate = new Date('2024-01-15T10:00:00.000Z')
export const mockDateNow = () => {
  const DateSpy = vi.spyOn(global, 'Date').mockImplementation((date?: string | number) => {
    if (date) {
      return new Date(date) as any
    }
    return fixedDate as any
  }) as any
  DateSpy.now = vi.fn(() => fixedDate.getTime())
  return DateSpy
}