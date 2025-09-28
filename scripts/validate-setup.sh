#!/bin/bash

# Frontend Validation Setup Script
# This script helps developers run validation tests and check for common issues

set -e

echo "🚀 Frontend Validation Setup"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking Node.js version..."
NODE_VERSION=$(node -v)
print_status "Node.js version: $NODE_VERSION"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Run validation tests
echo ""
print_status "Running frontend validation tests..."

# Build validation
echo ""
print_status "1. Build Validation"
if npm run test:build; then
    print_success "Build validation passed"
else
    print_error "Build validation failed"
    exit 1
fi

# Import validation
echo ""
print_status "2. Import Validation"
if npm run test:imports; then
    print_success "Import validation passed"
else
    print_error "Import validation failed"
    exit 1
fi

# Dependency validation
echo ""
print_status "3. Dependency Validation"
if npm run test:dependencies; then
    print_success "Dependency validation passed"
else
    print_error "Dependency validation failed"
    exit 1
fi

# TypeScript validation
echo ""
print_status "4. TypeScript Validation"
if npm run test:typescript; then
    print_success "TypeScript validation passed"
else
    print_error "TypeScript validation failed"
    exit 1
fi

# Critical imports
echo ""
print_status "5. Critical Imports"
if npm run test:critical; then
    print_success "Critical imports validation passed"
else
    print_error "Critical imports validation failed"
    exit 1
fi

# Smoke tests
echo ""
print_status "6. Smoke Tests"
if npm run test:smoke; then
    print_success "Smoke tests passed"
else
    print_error "Smoke tests failed"
    exit 1
fi

# Route validation
echo ""
print_status "7. Route Validation"
if npm run test:routes; then
    print_success "Route validation passed"
else
    print_error "Route validation failed"
    exit 1
fi

# API validation
echo ""
print_status "8. API Service Validation"
if npm run test:api; then
    print_success "API service validation passed"
else
    print_error "API service validation failed"
    exit 1
fi

echo ""
print_success "🎉 All validation tests passed!"
echo ""
print_status "Available validation commands:"
echo "  npm run validate:pre-commit   - Quick validation for commits"
echo "  npm run validate:pre-push     - Full validation for pushes"
echo "  npm run validate:ci           - CI validation with coverage"
echo "  npm run test:all-validation   - All validation tests"
echo ""
print_status "For development:"
echo "  npm run test:watch            - Watch mode for tests"
echo "  npm run test:ui               - Visual test interface"
echo "  npm run test:coverage         - Coverage report"
echo ""
print_status "For specific areas:"
echo "  npm run test:forms            - Form component tests"
echo "  npm run test:services         - Service layer tests"
echo "  npm run test:hooks            - Custom hook tests"
echo "  npm run test:auth             - Authentication tests"
echo "  npm run test:financial        - Financial calculation tests"
echo ""
print_success "Setup complete! The frontend is ready for development."