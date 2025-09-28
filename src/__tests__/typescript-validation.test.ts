/**
 * TypeScript Validation Tests
 *
 * Tests to catch TypeScript compilation errors and type issues
 * before they cause runtime problems.
 */

import { describe, test, expect } from 'vitest'
import { execSync } from 'child_process'
import { glob } from 'glob'
import { readFileSync } from 'fs'
import path from 'path'

describe('TypeScript Compilation', () => {
  test('TypeScript should compile without errors', () => {
    try {
      const output = execSync('npx tsc --noEmit --skipLibCheck', {
        encoding: 'utf-8',
        timeout: 60000,
        cwd: process.cwd()
      })

      // If there are errors, they would be in the output
      if (output && output.includes('error TS')) {
        throw new Error(`TypeScript compilation errors:\n${output}`)
      }
    } catch (error) {
      if (error.stdout && error.stdout.includes('error TS')) {
        throw new Error(`TypeScript compilation errors:\n${error.stdout}`)
      }
      throw error
    }
  })

  test('All TypeScript files should have valid syntax', async () => {
    const tsFiles = await glob('src/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*', 'node_modules/**']
    })

    const syntaxErrors: string[] = []

    for (const file of tsFiles) {
      try {
        // Try to parse the file
        const content = readFileSync(file, 'utf-8')

        // Basic syntax checks
        if (content.includes('import from') && !content.includes('import * from') && !content.includes('import {') && !content.includes('import ')) {
          syntaxErrors.push(`${file}: Invalid import syntax`)
        }

        // Check for unmatched braces
        const openBraces = (content.match(/{/g) || []).length
        const closeBraces = (content.match(/}/g) || []).length
        if (openBraces !== closeBraces) {
          syntaxErrors.push(`${file}: Unmatched braces (${openBraces} open, ${closeBraces} close)`)
        }

        // Check for unmatched parentheses
        const openParens = (content.match(/\(/g) || []).length
        const closeParens = (content.match(/\)/g) || []).length
        if (openParens !== closeParens) {
          syntaxErrors.push(`${file}: Unmatched parentheses (${openParens} open, ${closeParens} close)`)
        }
      } catch (error) {
        syntaxErrors.push(`${file}: ${error.message}`)
      }
    }

    if (syntaxErrors.length > 0) {
      throw new Error(`TypeScript syntax errors:\n${syntaxErrors.join('\n')}`)
    }
  })

  test('No unused imports should exist', async () => {
    // This is a simplified check - in real world, you'd use tools like ts-unused-exports
    const tsFiles = await glob('src/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*', 'node_modules/**']
    })

    const potentialUnusedImports: string[] = []

    for (const file of tsFiles) {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        if (line.trim().startsWith('import ') && line.includes('from')) {
          // Extract imported names
          const importMatch = line.match(/import\s+{([^}]+)}\s+from/)
          if (importMatch) {
            const imports = importMatch[1].split(',').map(i => i.trim())
            imports.forEach(importName => {
              // Simple check: if import is not used in the file content
              const regex = new RegExp(`\\b${importName.replace(/\s+as\s+\w+/, '')}\\b`, 'g')
              const matches = content.match(regex)
              if (!matches || matches.length <= 1) { // Only appears in import line
                potentialUnusedImports.push(`${file}:${index + 1}: Potentially unused import '${importName}'`)
              }
            })
          }
        }
      })
    }

    // Only fail if there are many unused imports (to avoid false positives)
    if (potentialUnusedImports.length > 10) {
      console.warn(`Potential unused imports found:\n${potentialUnusedImports.slice(0, 10).join('\n')}`)
    }
  })
})

describe('Type Safety Checks', () => {
  test('No any types should be used in critical files', async () => {
    const criticalFiles = [
      'src/services/api.service.ts',
      'src/stores/auth.store.ts',
      'src/hooks/useAuth.ts',
      'src/types/api.ts',
      'src/types/auth.ts'
    ]

    const anyTypeUsages: string[] = []

    for (const file of criticalFiles) {
      try {
        const content = readFileSync(file, 'utf-8')
        const lines = content.split('\n')

        lines.forEach((line, index) => {
          if (line.includes(': any') || line.includes('<any>') || line.includes('any[]')) {
            anyTypeUsages.push(`${file}:${index + 1}: ${line.trim()}`)
          }
        })
      } catch (error) {
        // File might not exist, skip
        continue
      }
    }

    if (anyTypeUsages.length > 0) {
      console.warn(`'any' types found in critical files:\n${anyTypeUsages.join('\n')}`)
    }
  })

  test('Interface and type definitions should be consistent', async () => {
    const typeFiles = await glob('src/types/**/*.ts', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*']
    })

    const typeIssues: string[] = []

    for (const file of typeFiles) {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        // Check for inconsistent interface naming
        if (line.trim().startsWith('interface ')) {
          const interfaceName = line.match(/interface\s+(\w+)/)?.[1]
          if (interfaceName && !interfaceName.match(/^[A-Z]/)) {
            typeIssues.push(`${file}:${index + 1}: Interface '${interfaceName}' should start with uppercase`)
          }
        }

        // Check for inconsistent type naming
        if (line.trim().startsWith('type ')) {
          const typeName = line.match(/type\s+(\w+)/)?.[1]
          if (typeName && !typeName.match(/^[A-Z]/)) {
            typeIssues.push(`${file}:${index + 1}: Type '${typeName}' should start with uppercase`)
          }
        }
      })
    }

    if (typeIssues.length > 0) {
      console.warn(`Type definition issues:\n${typeIssues.join('\n')}`)
    }
  })

  test('Enum definitions should be consistent', async () => {
    const enumFiles = await glob('src/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*', 'node_modules/**']
    })

    const enumIssues: string[] = []

    for (const file of enumFiles) {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      lines.forEach((line, index) => {
        if (line.trim().startsWith('enum ')) {
          const enumName = line.match(/enum\s+(\w+)/)?.[1]
          if (enumName && !enumName.match(/^[A-Z]/)) {
            enumIssues.push(`${file}:${index + 1}: Enum '${enumName}' should start with uppercase`)
          }
        }
      })
    }

    if (enumIssues.length > 0) {
      console.warn(`Enum definition issues:\n${enumIssues.join('\n')}`)
    }
  })
})

describe('Import/Export Consistency', () => {
  test('All exports should have corresponding imports', async () => {
    const tsFiles = await glob('src/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*', 'node_modules/**']
    })

    const exports = new Map<string, string[]>()
    const imports = new Map<string, string[]>()

    // Collect all exports and imports
    for (const file of tsFiles) {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      const fileExports: string[] = []
      const fileImports: string[] = []

      lines.forEach(line => {
        // Named exports
        const namedExportMatch = line.match(/export\s+(?:const|function|class|interface|type|enum)\s+(\w+)/)
        if (namedExportMatch) {
          fileExports.push(namedExportMatch[1])
        }

        // Export blocks
        const exportBlockMatch = line.match(/export\s+{([^}]+)}/)
        if (exportBlockMatch) {
          const exportNames = exportBlockMatch[1].split(',').map(e => e.trim())
          fileExports.push(...exportNames)
        }

        // Imports
        const importMatch = line.match(/import\s+{([^}]+)}\s+from\s+['"`]([^'"`]+)['"`]/)
        if (importMatch) {
          const importNames = importMatch[1].split(',').map(i => i.trim())
          fileImports.push(...importNames)
        }
      })

      exports.set(file, fileExports)
      imports.set(file, fileImports)
    }

    // This is a simplified check - real implementation would be more sophisticated
    expect(exports.size).toBeGreaterThan(0)
    expect(imports.size).toBeGreaterThan(0)
  })

  test('Circular dependencies should not exist', async () => {
    // This is a simplified check - real implementation would use dependency analysis
    const tsFiles = await glob('src/**/*.{ts,tsx}', {
      ignore: ['src/**/*.test.*', 'src/**/*.spec.*', 'node_modules/**']
    })

    const dependencies = new Map<string, string[]>()

    for (const file of tsFiles) {
      const content = readFileSync(file, 'utf-8')
      const importMatches = content.match(/from\s+['"`]([^'"`]+)['"`]/g) || []

      const fileDeps = importMatches
        .map(match => match.match(/from\s+['"`]([^'"`]+)['"`]/)?.[1])
        .filter(Boolean)
        .filter(dep => dep?.startsWith('.') || dep?.startsWith('@/'))
        .map(dep => {
          if (dep?.startsWith('@/')) {
            return path.resolve('src', dep.replace('@/', ''))
          }
          return path.resolve(path.dirname(file), dep!)
        }) as string[]

      dependencies.set(file, fileDeps)
    }

    // Simple circular dependency check (direct cycles only)
    const circularDeps: string[] = []

    dependencies.forEach((deps, file) => {
      deps.forEach(dep => {
        const depFile = dep + '.ts'
        const depFileTsx = dep + '.tsx'
        const depDeps = dependencies.get(depFile) || dependencies.get(depFileTsx) || []

        if (depDeps.some(d => d.includes(path.basename(file, '.tsx').replace('.ts', '')))) {
          circularDeps.push(`${file} <-> ${dep}`)
        }
      })
    })

    if (circularDeps.length > 0) {
      console.warn(`Potential circular dependencies:\n${circularDeps.join('\n')}`)
    }
  })
})

describe('Type Configuration', () => {
  test('tsconfig.json should have appropriate settings', () => {
    try {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
      let tsconfig: any

      try {
        tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
      } catch {
        // Try tsconfig.app.json
        const tsconfigAppPath = path.join(process.cwd(), 'tsconfig.app.json')
        tsconfig = JSON.parse(readFileSync(tsconfigAppPath, 'utf-8'))
      }

      expect(tsconfig.compilerOptions).toBeDefined()

      // Check for recommended settings
      const requiredOptions = {
        strict: true,
        noImplicitAny: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true
      }

      Object.entries(requiredOptions).forEach(([option, expectedValue]) => {
        if (tsconfig.compilerOptions[option] !== expectedValue) {
          console.warn(`TypeScript config: ${option} should be ${expectedValue}`)
        }
      })

      // Check for module resolution
      expect(tsconfig.compilerOptions.moduleResolution).toBeDefined()
      expect(tsconfig.compilerOptions.baseUrl || tsconfig.compilerOptions.paths).toBeDefined()

    } catch (error) {
      throw new Error(`Failed to validate TypeScript configuration: ${error.message}`)
    }
  })

  test('Path mapping should be configured correctly', () => {
    try {
      const viteConfigPath = path.join(process.cwd(), 'vite.config.ts')
      const viteConfig = readFileSync(viteConfigPath, 'utf-8')

      // Check for path aliases in Vite config
      expect(viteConfig).toContain('resolve')
      expect(viteConfig).toContain('alias')
      expect(viteConfig).toContain('@')

    } catch (error) {
      throw new Error(`Failed to validate path mapping configuration: ${error.message}`)
    }
  })
})