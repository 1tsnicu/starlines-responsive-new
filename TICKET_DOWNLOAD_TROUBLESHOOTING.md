# Ticket Download Error Troubleshooting

## Error: "Error creating PDF ticket!!! Contact the ticketing agency"

This error occurs when the Bussystem API cannot generate the PDF ticket. Here's how to diagnose and fix it:

## Common Causes & Solutions

### 1. **Order Processing Delay**
**Problem**: The order was just created and hasn't been fully processed yet.

**Solution**: 
- Wait 2-5 minutes after booking completion
- Try downloading again
- The system now includes automatic retry functionality

### 2. **Invalid Order ID or Security Code**
**Problem**: The order_id or security code is incorrect or missing.

**Solution**:
- Verify the booking response contains valid `order_id` and `security` fields
- Check that the values are not null or undefined
- Ensure the security code is converted to string format

### 3. **Server-Side PDF Generation Issues**
**Problem**: The Bussystem server cannot generate the PDF due to internal errors.

**Solution**:
- Try again in a few minutes
- Contact Bussystem support if the issue persists
- Use the diagnostic function to get detailed error information

### 4. **Network or API Issues**
**Problem**: Network connectivity or API endpoint issues.

**Solution**:
- Check internet connection
- Verify the API endpoint is accessible
- Try different browsers or devices

## Enhanced Error Handling

### New Features Added:

1. **Automatic Retry**: Up to 3 retry attempts with exponential backoff
2. **Error Diagnosis**: Detailed error analysis before attempting download
3. **Better Error Messages**: User-friendly error descriptions
4. **Fallback Methods**: Multiple download strategies
5. **Visual Feedback**: Loading states and error indicators

### Error Detection:
The system now detects specific error patterns:
- "Error creating PDF ticket" → PDF generation failed
- "Error! Check input parameters" → Invalid parameters
- "Contact the ticketing agency" → Server-side error

## Diagnostic Tools

### Manual Diagnosis:
```typescript
import { diagnoseTicketDownload } from '@/lib/ticketDownload';

const diagnosis = await diagnoseTicketDownload({
  orderId: 1060397,
  security: "your_security_code",
  lang: "en"
});

console.log('Diagnosis:', diagnosis);
```

### What to Check:
1. **URL Generation**: Verify the correct API URL is generated
2. **Response Status**: Check HTTP status code
3. **Content Type**: Verify response is PDF or error
4. **Error Message**: Look for specific error patterns

## Troubleshooting Steps

### Step 1: Verify Order Data
```typescript
// Check if booking response has required fields
if (!bookingResponse.order_id || !bookingResponse.security) {
  console.error('Missing required fields');
  return;
}
```

### Step 2: Test API Endpoint
```bash
# Test the API endpoint directly
curl "https://test-api.bussystem.eu/viev/frame/print_ticket.php?order_id=1060397&security=YOUR_SECURITY&lang=en"
```

### Step 3: Check Response
Look for these error patterns in the response:
- "Error creating PDF ticket!!! Contact the ticketing agency"
- "Error! Check input parameters or contact to support"
- HTML error pages instead of PDF

### Step 4: Try Different Parameters
- Different language codes (en, ru, ua, de, pl, cz)
- With or without ticket_id parameter
- Different time intervals (wait 5-10 minutes)

## User Experience Improvements

### Visual Feedback:
- **Loading State**: Spinner during download attempts
- **Error State**: Clear error messages with retry options
- **Success State**: Confirmation when download starts
- **Retry Counter**: Shows attempt number (1/3, 2/3, 3/3)

### Error Messages:
- **Specific**: Tells users exactly what went wrong
- **Actionable**: Provides clear next steps
- **Helpful**: Includes contact information when needed

## API Endpoint Details

### URL Format:
```
https://test-api.bussystem.eu/viev/frame/print_ticket.php?order_id=XXXX&security=XXXX&lang=XX
```

### Required Parameters:
- `order_id`: Order ID from booking response
- `security`: Security code from booking response
- `lang`: Language code (en, ru, ua, de, pl, cz)

### Optional Parameters:
- `ticket_id`: Specific ticket ID for individual downloads

## Testing the Fix

### Test Scenarios:
1. **Valid Order**: Should download successfully
2. **Invalid Order ID**: Should show clear error message
3. **Missing Security**: Should show parameter error
4. **Server Error**: Should show retry options
5. **Network Error**: Should show connectivity message

### Test Data:
- **Order ID**: 1060397 (from your error)
- **Security**: Use actual security code from booking
- **Language**: Try different language codes

## Contact Information

### For Users:
- **Email**: support@starlines.md
- **Phone**: +373 22 123 456
- **Hours**: 24/7 support

### For Developers:
- **Bussystem Support**: Contact through their official channels
- **API Documentation**: Check Bussystem API docs
- **Error Logs**: Check browser console for detailed errors

## Prevention

### Best Practices:
1. **Wait Time**: Always wait 2-5 minutes after booking
2. **Error Handling**: Implement proper error handling
3. **User Feedback**: Provide clear status updates
4. **Retry Logic**: Allow multiple attempts
5. **Fallback Options**: Provide alternative download methods

### Monitoring:
- Track download success rates
- Monitor error patterns
- Alert on repeated failures
- Log diagnostic information

## Summary

The enhanced ticket download system now provides:
- ✅ **Better Error Detection**: Identifies specific error types
- ✅ **Automatic Retry**: Up to 3 attempts with user feedback
- ✅ **Diagnostic Tools**: Detailed error analysis
- ✅ **User-Friendly Messages**: Clear, actionable error descriptions
- ✅ **Visual Feedback**: Loading states and error indicators
- ✅ **Fallback Methods**: Multiple download strategies

This should resolve the "Error creating PDF ticket" issue and provide a much better user experience when downloading tickets.
