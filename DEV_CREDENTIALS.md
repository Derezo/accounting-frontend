# Development Test Credentials

⚠️ **FOR DEVELOPMENT/TESTING ONLY** - Do not use in production!

These are test credentials for the accounting system development environment.

## User Roles & Test Accounts

### Super Admin
- **Email:** admin@acme.dev
- **Password:** SuperAdmin123!
- **Role:** SUPER_ADMIN
- **Permissions:** Full system access

### Organization Admin
- **Email:** manager@acme.dev
- **Password:** OrgAdmin123!
- **Role:** ADMIN
- **Permissions:** Organization management, user management

### Sales Manager
- **Email:** sales@acme.dev
- **Password:** Manager123!
- **Role:** MANAGER
- **Permissions:** Customer and sales operations

### Accountant
- **Email:** accounting@acme.dev
- **Password:** Accountant123!
- **Role:** ACCOUNTANT
- **Permissions:** Financial operations, invoicing, payments

### Employee
- **Email:** employee@acme.dev
- **Password:** Employee123!
- **Role:** EMPLOYEE
- **Permissions:** Basic operations within assigned projects

### Viewer
- **Email:** viewer@acme.dev
- **Password:** Viewer123!
- **Role:** VIEWER
- **Permissions:** Read-only access to assigned data

### Tech Admin
- **Email:** admin@techsolutions.dev
- **Password:** TechAdmin123!
- **Role:** SUPER_ADMIN
- **Permissions:** Technical administration access

## Usage Notes

1. These credentials are seeded in the development database
2. Use the appropriate role for testing specific functionality
3. SUPER_ADMIN and ADMIN roles have full access to all features
4. Lower privilege roles are restricted based on the role hierarchy

## Development Server

- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:3001/ (if running)
- **MCP Server:** http://localhost:3001/ (if running)

## Connection Debug Results ✅

### Current Status (as of debugging):

✅ **Frontend**: Running perfectly on http://localhost:5173/
✅ **MCP Server**: Running on stdio transport (process ID: 431665)
❌ **Main API**: TypeScript compilation errors preventing startup

### Exact Issue Identified:

The **accounting-api** (main authentication server) has TypeScript compilation errors in:
- `src/controllers/etransfer.controller.ts` line 145: `string | undefined` not assignable to `string`

**Root Cause**: The backend can't start because of strict TypeScript checking on request parameters that might be undefined.

### Architecture Understanding:

1. **Frontend** (`localhost:5173`) → **Main API** (`localhost:3000/api/v1`) for authentication
2. **Frontend** → **MCP Server** (stdio) for business operations
3. **MCP Server** → **Main API** for data operations

**The authentication flow requires the Main API to be running on port 3000.**

### Current Error in Logs:
```
TSError: ⨯ Unable to compile TypeScript:
src/controllers/etransfer.controller.ts(145,61): error TS2345:
Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
Type 'undefined' is not assignable to type 'string'.
```

### What's Working:
- ✅ Frontend dev server
- ✅ MCP server (but can't connect to main API)
- ✅ Dev credentials are properly documented
- ✅ All frontend authentication code is correctly configured

### What Needs to be Fixed Outside Frontend:
The TypeScript error in the etransfer controller needs to be resolved in the accounting-api project before authentication will work.