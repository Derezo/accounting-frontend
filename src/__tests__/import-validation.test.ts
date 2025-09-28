/**
 * Import Validation Tests
 *
 * These tests validate that all imports resolve correctly across the codebase
 * and catch missing dependencies or import path issues.
 */

import { describe, test, expect } from 'vitest'
import { glob } from 'glob'
import { readFileSync } from 'fs'
import path from 'path'

// Extract imports from TypeScript/JavaScript files
function extractImports(content: string): string[] {
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/g
  const imports: string[] = []
  let match

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1])
  }

  return imports
}

// Check if a module path is resolvable
async function isModuleResolvable(modulePath: string, fromFile: string): Promise<boolean> {
  try {
    // Handle relative imports
    if (modulePath.startsWith('.')) {
      const resolvedPath = path.resolve(path.dirname(fromFile), modulePath)
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']

      for (const ext of extensions) {
        const fullPath = resolvedPath + ext
        try {
          await import(fullPath)
          return true
        } catch {
          continue
        }
      }
      return false
    }

    // Handle absolute imports with aliases
    if (modulePath.startsWith('@/')) {
      const srcPath = modulePath.replace('@/', 'src/')
      const resolvedPath = path.resolve(process.cwd(), srcPath)
      const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json']

      for (const ext of extensions) {
        const fullPath = resolvedPath + ext
        try {
          await import(fullPath)
          return true
        } catch {
          continue
        }
      }
      return false
    }

    // Handle node_modules imports
    try {
      await import(modulePath)
      return true
    } catch {
      return false
    }
  } catch {
    return false
  }
}

describe('Import Validation', () => {
  test('All imports should resolve correctly', async () => {
    const files = await glob('src/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*', 'node_modules/**']
    })

    const invalidImports: Array<{ file: string; import: string }> = []

    for (const file of files) {
      const content = readFileSync(file, 'utf-8')
      const imports = extractImports(content)

      for (const imp of imports) {
        const isResolvable = await isModuleResolvable(imp, file)
        if (!isResolvable) {
          invalidImports.push({ file, import: imp })
        }
      }
    }

    if (invalidImports.length > 0) {
      const errorMessage = invalidImports
        .map(({ file, import: imp }) => `${file}: ${imp}`)
        .join('\n')

      throw new Error(`Unresolvable imports found:\n${errorMessage}`)
    }
  })

  test('Critical application entry points should be importable', async () => {
    const criticalImports = [
      './src/App.tsx',
      './src/main.tsx',
      './src/components/layout/MainLayout.tsx',
      './src/components/layout/ProtectedRoute.tsx',
      './src/stores/auth.store.ts',
      './src/services/api.service.ts',
      './src/hooks/useAuth.ts'
    ]

    for (const importPath of criticalImports) {
      try {
        await import(importPath)
      } catch (error) {
        throw new Error(`Critical import failed: ${importPath}\nError: ${error.message}`)
      }
    }
  })

  test('All page components should be importable', async () => {
    const pageFiles = await glob('src/pages/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*']
    })

    const failedImports: string[] = []

    for (const file of pageFiles) {
      try {
        const relativePath = './' + file
        await import(relativePath)
      } catch (error) {
        failedImports.push(`${file}: ${error.message}`)
      }
    }

    if (failedImports.length > 0) {
      throw new Error(`Page components failed to import:\n${failedImports.join('\n')}`)
    }
  })

  test('All service modules should be importable', async () => {
    const serviceFiles = await glob('src/services/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*']
    })

    const failedImports: string[] = []

    for (const file of serviceFiles) {
      try {
        const relativePath = './' + file
        await import(relativePath)
      } catch (error) {
        failedImports.push(`${file}: ${error.message}`)
      }
    }

    if (failedImports.length > 0) {
      throw new Error(`Service modules failed to import:\n${failedImports.join('\n')}`)
    }
  })

  test('All hook modules should be importable', async () => {
    const hookFiles = await glob('src/hooks/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*']
    })

    const failedImports: string[] = []

    for (const file of hookFiles) {
      try {
        const relativePath = './' + file
        await import(relativePath)
      } catch (error) {
        failedImports.push(`${file}: ${error.message}`)
      }
    }

    if (failedImports.length > 0) {
      throw new Error(`Hook modules failed to import:\n${failedImports.join('\n')}`)
    }
  })

  test('All UI components should be importable', async () => {
    const componentFiles = await glob('src/components/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*']
    })

    const failedImports: string[] = []

    for (const file of componentFiles) {
      try {
        const relativePath = './' + file
        await import(relativePath)
      } catch (error) {
        failedImports.push(`${file}: ${error.message}`)
      }
    }

    if (failedImports.length > 0) {
      throw new Error(`UI components failed to import:\n${failedImports.join('\n')}`)
    }
  })

  test('Path aliases should resolve correctly', async () => {
    const aliasTests = [
      { alias: '@/components/ui/button', expected: 'src/components/ui/button' },
      { alias: '@/hooks/useAuth', expected: 'src/hooks/useAuth' },
      { alias: '@/services/api.service', expected: 'src/services/api.service' },
      { alias: '@/stores/auth.store', expected: 'src/stores/auth.store' },
      { alias: '@/types/api', expected: 'src/types/api' }
    ]

    for (const { alias, expected } of aliasTests) {
      try {
        await import(alias)
      } catch (error) {
        throw new Error(`Path alias failed to resolve: ${alias} (expected: ${expected})\nError: ${error.message}`)
      }
    }
  })

  test('Third-party dependencies should be available', async () => {
    const requiredDependencies = [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
      'lucide-react',
      'recharts',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ]

    const missingDependencies: string[] = []

    for (const dep of requiredDependencies) {
      try {
        await import(dep)
      } catch (error) {
        missingDependencies.push(dep)
      }
    }

    if (missingDependencies.length > 0) {
      throw new Error(`Missing dependencies: ${missingDependencies.join(', ')}`)
    }
  })
})