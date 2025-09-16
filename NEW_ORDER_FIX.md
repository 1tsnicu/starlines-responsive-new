# New Order API Fix

## Problem
The `new_order` API was receiving empty `login` and `password` fields in the request payload, causing the `dealer_no_activ` error even though the server had correct credentials.

## Root Cause
The frontend was sending empty `login` and `password` fields in the `NewOrderPayload`, which were overriding the server's credentials when the payload was merged.

## Solution Implemented

### 1. Fixed newOrder Function
Updated `src/lib/bussystem.ts` to remove credentials from the payload before sending:
```typescript
export async function newOrder(payload: NewOrderPayload): Promise<NewOrderResponse> {
  // Remove login/password from payload - server will add them
  const { login, password, ...payloadWithoutCredentials } = payload;
  
  return post<NewOrderResponse>("/curl/new_order.php", {
    json: 1,
    ...payloadWithoutCredentials
  });
}
```

### 2. Updated Type Definitions
Modified `src/types/newOrder.ts` to make credentials optional:
```typescript
export interface NewOrderPayload {
  login?: string;  // Optional - handled by server
  password?: string;  // Optional - handled by server
  // ... other fields
}
```

### 3. Updated Frontend Components
- **BookingForm.tsx**: Removed hardcoded credentials from payload
- **BussystemBookingFlow.tsx**: Removed demo credentials from payload
- **orderValidation.ts**: Removed credentials from payload building

### 4. Enhanced Error Handling
Created `src/components/NewOrderErrorDisplay.tsx` with comprehensive error handling for all new_order API errors:

#### Supported Error Types:
- **dealer_no_activ**: Dealer account not active
- **interval_no_found**: Route not found
- **route_no_activ**: Route not active
- **interval_no_activ**: Schedule not active
- **no_seat**: No seats selected
- **no_name/no_phone**: Missing passenger information
- **no_doc/no_birth_date**: Missing document information
- **date**: Invalid date
- **new_order**: System error

#### Features:
- Color-coded error displays
- Specific solutions for each error type
- Contact information for support
- Retry functionality
- Technical details for debugging

### 5. Updated Error Display Integration
- **BussystemBookingFlow.tsx**: Uses NewOrderErrorDisplay for better UX
- **BookingForm.tsx**: Uses NewOrderErrorDisplay for better UX

## How It Works Now

1. **Frontend** builds payload without credentials
2. **Server** receives payload and adds credentials using `buildPayload()`
3. **API** receives properly authenticated request
4. **Errors** are displayed with user-friendly messages and solutions

## Testing
The fix ensures that:
- ✅ Credentials are handled by the server
- ✅ Frontend doesn't send empty credentials
- ✅ All new_order errors are properly displayed
- ✅ Users get actionable solutions for each error type

## Files Modified
- `src/lib/bussystem.ts` - Fixed newOrder function
- `src/types/newOrder.ts` - Made credentials optional
- `src/lib/orderValidation.ts` - Removed credentials from payload
- `src/components/BookingForm.tsx` - Removed credentials, added error display
- `src/components/BussystemBookingFlow.tsx` - Removed credentials, added error display
- `src/components/NewOrderErrorDisplay.tsx` - New comprehensive error component

## Result
The `dealer_no_activ` error should now be resolved, and users will see helpful error messages with specific solutions for any other API errors that may occur.
