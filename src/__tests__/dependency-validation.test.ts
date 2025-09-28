/**
 * Dependency Validation Tests
 *
 * Tests to ensure all required dependencies are available and properly configured
 * before the application starts.
 */

import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

// Load package.json
const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

describe('Dependency Validation', () => {
  test('All critical production dependencies should be installed', async () => {
    const criticalDependencies = [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'zod',
      'react-hook-form',
      '@hookform/resolvers'
    ]

    const missingDependencies: string[] = []

    for (const dep of criticalDependencies) {
      if (!packageJson.dependencies[dep]) {
        missingDependencies.push(dep)
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing critical dependencies: ${missingDependencies.join(', ')}`)
    }
  })

  test('All UI framework dependencies should be installed', async () => {
    const uiDependencies = [
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ]

    const missingDependencies: string[] = []

    for (const dep of uiDependencies) {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDependencies.push(dep)
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing UI dependencies: ${missingDependencies.join(', ')}`)
    }
  })

  test('Chart and visualization dependencies should be installed', async () => {
    const chartDependencies = [
      'recharts'
    ]

    const missingDependencies: string[] = []

    for (const dep of chartDependencies) {
      if (!packageJson.dependencies[dep]) {
        missingDependencies.push(dep)
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing chart dependencies: ${missingDependencies.join(', ')}`)
    }
  })

  test('PDF generation dependencies should be installed', async () => {
    const pdfDependencies = [
      '@react-pdf/renderer',
      'jspdf',
      'html2canvas'
    ]

    const missingDependencies: string[] = []

    for (const dep of pdfDependencies) {
      if (!packageJson.dependencies[dep]) {
        missingDependencies.push(dep)
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing PDF dependencies: ${missingDependencies.join(', ')}`)
    }
  })

  test('Development and testing dependencies should be installed', async () => {
    const devDependencies = [
      '@vitejs/plugin-react',
      'typescript',
      'vite',
      'vitest',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@vitest/coverage-v8',
      'eslint',
      'tailwindcss'
    ]

    const missingDependencies: string[] = []

    for (const dep of devDependencies) {
      if (!packageJson.devDependencies[dep]) {
        missingDependencies.push(dep)
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing dev dependencies: ${missingDependencies.join(', ')}`)
    }
  })

  test('Date and utility dependencies should be installed', async () => {
    const utilityDependencies = [
      'date-fns'
    ]

    const missingDependencies: string[] = []

    for (const dep of utilityDependencies) {
      if (!packageJson.dependencies[dep]) {
        missingDependencies.push(dep)
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing utility dependencies: ${missingDependencies.join(', ')}`)
    }
  })
})

describe('Dependency Version Compatibility', () => {
  test('React versions should be compatible', () => {
    const reactVersion = packageJson.dependencies['react']
    const reactDomVersion = packageJson.dependencies['react-dom']

    expect(reactVersion).toBeDefined()
    expect(reactDomVersion).toBeDefined()

    // Extract major version numbers
    const reactMajor = reactVersion.match(/\^?(\d+)/)?.[1]
    const reactDomMajor = reactDomVersion.match(/\^?(\d+)/)?.[1]

    expect(reactMajor).toBe(reactDomMajor)
  })

  test('Testing library versions should be compatible with React', () => {
    const reactVersion = packageJson.dependencies['react']
    const testingLibraryReact = packageJson.devDependencies['@testing-library/react']

    expect(reactVersion).toBeDefined()
    expect(testingLibraryReact).toBeDefined()

    // React 19 requires Testing Library React 16+
    const reactMajor = parseInt(reactVersion.match(/\^?(\d+)/)?.[1] || '0')
    const testingLibraryMajor = parseInt(testingLibraryReact.match(/\^?(\d+)/)?.[1] || '0')

    if (reactMajor >= 19) {
      expect(testingLibraryMajor).toBeGreaterThanOrEqual(16)
    }
  })

  test('TypeScript should be compatible with React', () => {
    const typescriptVersion = packageJson.devDependencies['typescript']
    const reactTypesVersion = packageJson.devDependencies['@types/react']

    expect(typescriptVersion).toBeDefined()
    expect(reactTypesVersion).toBeDefined()
  })
})

describe('Module Resolution Tests', () => {
  test('Core React modules should be resolvable', async () => {
    const coreModules = [
      'react',
      'react-dom',
      'react-router-dom'
    ]

    for (const module of coreModules) {
      try {
        await import(module)
      } catch (error) {
        throw new Error(`Failed to resolve core module: ${module}`)
      }
    }
  })

  test('State management modules should be resolvable', async () => {
    const stateModules = [
      '@tanstack/react-query',
      'zustand'
    ]

    for (const module of stateModules) {
      try {
        await import(module)
      } catch (error) {
        throw new Error(`Failed to resolve state management module: ${module}`)
      }
    }
  })

  test('Form handling modules should be resolvable', async () => {
    const formModules = [
      'react-hook-form',
      '@hookform/resolvers',
      'zod'
    ]

    for (const module of formModules) {
      try {
        await import(module)
      } catch (error) {
        throw new Error(`Failed to resolve form module: ${module}`)
      }
    }
  })

  test('UI component modules should be resolvable', async () => {
    const uiModules = [
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-scroll-area',
      'lucide-react'
    ]

    for (const module of uiModules) {
      try {
        await import(module)
      } catch (error) {
        throw new Error(`Failed to resolve UI module: ${module}`)
      }
    }
  })

  test('Chart and visualization modules should be resolvable', async () => {
    const chartModules = [
      'recharts'
    ]

    for (const module of chartModules) {
      try {
        await import(module)
      } catch (error) {
        throw new Error(`Failed to resolve chart module: ${module}`)
      }
    }
  })

  test('Utility modules should be resolvable', async () => {
    const utilityModules = [
      'axios',
      'date-fns',
      'clsx',
      'class-variance-authority',
      'tailwind-merge'
    ]

    for (const module of utilityModules) {
      try {
        await import(module)
      } catch (error) {
        throw new Error(`Failed to resolve utility module: ${module}`)
      }
    }
  })
})

describe('Environment Dependencies', () => {
  test('Node.js environment should support required features', () => {
    // Check for ES2020+ features
    expect(typeof globalThis).toBe('object')
    expect(typeof Promise.allSettled).toBe('function')
    expect(typeof String.prototype.matchAll).toBe('function')
  })

  test('Browser APIs should be available in test environment', () => {
    // These should be mocked in test environment
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
    expect(typeof localStorage).toBe('object')
    expect(typeof sessionStorage).toBe('object')
  })

  test('Testing environment should have required globals', () => {
    // Vitest globals
    expect(typeof describe).toBe('function')
    expect(typeof test).toBe('function')
    expect(typeof expect).toBe('function')
    expect(typeof vi).toBe('object')
  })
})