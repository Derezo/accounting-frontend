# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Development Commands
- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Build for production (runs TypeScript compiler + Vite build)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm run preview` - Preview production build

### Testing Commands
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Architecture Overview

### Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with React plugin
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: Zustand (auth store, organization store)
- **API Client**: TanStack Query (React Query) + Axios
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **PDF Generation**: React PDF + jsPDF + html2canvas
- **Testing**: Vitest + Testing Library + jsdom

### Authentication Architecture
The application uses a **dual-server architecture**:

1. **Main API Server** (`localhost:3000`) - Handles authentication, user management, and base data operations
2. **MCP Server** (stdio transport) - Handles business operations (customers, quotes, invoices, payments) via MCP tools

**Authentication Flow**:
- Frontend authenticates against Main API (`/api/v1/auth/login`)
- JWT tokens stored in localStorage and Zustand store
- Business operations use MCP Server via `/mcp/tools/call` endpoint
- Both servers must be running for full functionality

### Key Architectural Patterns

#### Service Layer Architecture
- `src/services/auth.service.ts` - Authentication operations against Main API
- `src/services/mcp.service.ts` - Business operations via MCP tools
- Services abstract API calls and handle error formatting

#### State Management Strategy
- **Zustand stores** for global state (auth, organization settings)
- **TanStack Query** for server state management and caching
- **Local component state** for UI-only state

#### MCP Integration Pattern
All business operations (customers, quotes, invoices, payments) are performed via MCP tools:
```typescript
// MCP tool calls follow this pattern:
await mcpService.callTool('tool_name', parameters)
```

MCP tools are called through the Main API's `/mcp/tools/call` endpoint, requiring authentication.

#### Permission-Based Routing
Routes use nested `ProtectedRoute` components with `requiredPermission` props for granular access control.

### Component Structure

#### UI Components (`src/components/ui/`)
- Shared UI primitives based on Radix UI
- Follows shadcn/ui patterns with class-variance-authority for styling

#### Business Components (`src/components/business/`)
- Domain-specific components for customers, quotes, invoices, payments

#### Forms (`src/components/forms/`)
- React Hook Form + Zod validation
- Follows consistent form patterns across the app

#### Layout Components (`src/components/layout/`)
- `MainLayout` - Application shell with navigation
- `ProtectedRoute` - Authentication and permission guards

### Path Aliases
Configured in `vite.config.ts`:
- `@/` → `src/`
- `@/components` → `src/components`
- `@/pages` → `src/pages`
- `@/hooks` → `src/hooks`
- `@/services` → `src/services`
- `@/stores` → `src/stores`
- `@/types` → `src/types`
- `@/utils` → `src/utils`
- `@/lib` → `src/lib`

### Environment Configuration
- Copy `.env.example` to `.env.local` for local development
- Key variables:
  - `VITE_API_BASE_URL` - Main API server URL (default: http://localhost:3000/api/v1)
  - `VITE_MCP_SERVER_URL` - MCP server URL (default: http://localhost:3001)

## Development Dependencies

### Backend Dependency
This frontend requires the `accounting-api` backend server to be running for authentication and MCP operations. Check `DEV_CREDENTIALS.md` for:
- Test user credentials for different roles
- Backend startup troubleshooting
- Known TypeScript compilation issues in the backend

### Key Development Points
- Always run `npm run typecheck` and `npm run lint` after making changes
- Use the existing MCP service patterns when adding new business operations
- Follow the established React Query caching patterns in `useMCP.ts`
- Authentication errors often indicate the backend server is not running
- MCP tool calls should follow the naming convention used in `mcp.service.ts`

### Testing Setup
- Test setup file: `src/lib/test-setup.ts`
- Uses jsdom environment for React component testing
- Global test utilities available from Testing Library

## Common Development Tasks

### Adding New MCP Operations
1. Add method to `MCPService` class in `src/services/mcp.service.ts`
2. Add corresponding React Query hooks in `src/hooks/useMCP.ts`
3. Add TypeScript types to `src/types/api.ts`
4. Update query key patterns in `mcpQueryKeys`

### Adding New Routes
1. Create page component in appropriate `src/pages/` subdirectory
2. Add route in `App.tsx` with appropriate `ProtectedRoute` wrapper
3. Add navigation link in `MainLayout` if needed

### Adding New Forms
1. Define Zod schema for validation
2. Create form component in `src/components/forms/`
3. Use React Hook Form with `@hookform/resolvers/zod`
4. Follow existing form patterns for error handling and submission