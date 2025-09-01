# Environment Variables Fix

## Issue
The application was throwing `ReferenceError: process is not defined` errors because the code was trying to access Node.js `process.env` in the browser environment.

## Solution
Replaced all `process.env` references with Vite's `import.meta.env` which is the correct way to access environment variables in Vite-based applications running in the browser.

## Changes Made

### 1. Updated API Configuration
- `src/lib/reserveTicketApi.ts`: Changed `process.env.REACT_APP_BUS_API_URL` to `import.meta.env.VITE_BUSS_BASE_URL`
- `src/lib/reserveValidationApi.ts`: Same change

### 2. Updated Credential Functions
- Both files: Changed `process.env.REACT_APP_BUS_LOGIN/PASSWORD` to `import.meta.env.VITE_BUSS_LOGIN/PASSWORD`
- Added fallback to test credentials (`infobus-ws/infobus-ws`) when env vars are not set

### 3. Updated Development Checks
- `src/lib/http.ts`: Changed `process.env.NODE_ENV === 'development'` to `import.meta.env.DEV`
- `src/lib/audit.ts`: Changed environment checks to use `import.meta.env.DEV` and `import.meta.env.PROD`

### 4. Enhanced TypeScript Support
- Updated `src/vite-env.d.ts` to include type definitions for custom environment variables

## Environment Variables
The application now uses the existing environment variable names from `.env.example`:
- `VITE_BUSS_BASE_URL` - API base URL
- `VITE_BUSS_LOGIN` - API login credentials  
- `VITE_BUSS_PASSWORD` - API password credentials
- `VITE_USE_MOCK_BUSSYSTEM` - Toggle for mock API usage

## Test Credentials
When environment variables are not provided, the application falls back to the test credentials:
- Login: `infobus-ws`
- Password: `infobus-ws`

## Result
✅ No more `process is not defined` errors
✅ Environment variables work correctly in browser
✅ Backward compatible with existing configuration
✅ TypeScript type safety maintained
