/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/lib/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.next', '.nuxt', '.cache'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/lib/test-setup.ts',
        'src/lib/test-utils.tsx',
        'src/lib/test-mocks.ts',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts',
        'src/main.tsx',
        'src/types/',
        '**/__tests__/',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/services/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/stores/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/hooks/': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/components/forms/': {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    // Performance settings for financial application testing
    testTimeout: 30000, // 30 seconds for complex financial calculations
    hookTimeout: 30000,
    teardownTimeout: 10000,
    // Enable concurrent tests but limit for financial data consistency
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4, // Limit concurrent tests for database consistency
        minThreads: 1,
      },
    },
    // Reporter configuration for CI/CD
    reporters: ['verbose', 'junit'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
    // Mock settings
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
})