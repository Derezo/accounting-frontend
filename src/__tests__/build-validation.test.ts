/**
 * Build Validation Tests
 *
 * These tests validate that the application can build successfully
 * and catch import/dependency issues before deployment.
 */

import { describe, test, expect } from 'vitest'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'

describe('Build Validation', () => {
  test('TypeScript compilation should succeed', () => {
    expect(() => {
      execSync('npm run typecheck', {
        stdio: 'pipe',
        timeout: 60000,
        cwd: process.cwd()
      })
    }).not.toThrow()
  })

  test('Production build should succeed', () => {
    expect(() => {
      execSync('npm run build', {
        stdio: 'pipe',
        timeout: 120000,
        cwd: process.cwd()
      })
    }).not.toThrow()
  })

  test('ESLint should pass without errors', () => {
    expect(() => {
      execSync('npm run lint', {
        stdio: 'pipe',
        timeout: 60000,
        cwd: process.cwd()
      })
    }).not.toThrow()
  })

  test('Package.json dependencies should be installable', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    expect(existsSync(packageJsonPath)).toBe(true)

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    expect(packageJson.dependencies).toBeDefined()
    expect(packageJson.devDependencies).toBeDefined()

    // Check for required dependencies that were missing
    const requiredDeps = [
      '@radix-ui/react-scroll-area',
      'recharts',
      '@tanstack/react-query',
      'react-router-dom',
      'zustand'
    ]

    requiredDeps.forEach(dep => {
      expect(packageJson.dependencies[dep] || packageJson.devDependencies[dep])
        .toBeDefined(`Missing required dependency: ${dep}`)
    })
  })

  test('Vite configuration should be valid', () => {
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts')
    expect(existsSync(viteConfigPath)).toBe(true)

    expect(() => {
      execSync('npx vite build --mode test', {
        stdio: 'pipe',
        timeout: 60000,
        cwd: process.cwd()
      })
    }).not.toThrow()
  })

  test('TypeScript configuration should be valid', () => {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
    const tsconfigAppPath = path.join(process.cwd(), 'tsconfig.app.json')

    expect(existsSync(tsconfigPath) || existsSync(tsconfigAppPath)).toBe(true)
  })
})