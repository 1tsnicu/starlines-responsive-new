// SMS Validation HTTP client for Bussystem sms_validation endpoint
// Handles SMS sending and verification with XML parsing

import { xmlToJson } from './http';
import type {
  SMSValidationRequest,
  SMSValidationResponse,
  SMSValidationApiResponse,
  SMSValidationError,
  SMSValidationErrorCode,
  SMSStatusCode
} from '../types/smsValidation';

const SMS_VALIDATION_ENDPOINT = '/curl/sms_validation.php';

// Type for XML response structure
interface SMSValidationXMLResponse {
  root?: {
    validation_id?: string;
    phone?: string;
    validation_code?: string;
    status_code?: string;
    status_sms?: string;
    error?: string;
    code?: string;
  };
}

// Rate limiting for SMS requests
const smsRequestTracker = new Map<string, { count: number; resetTime: number }>();
const MAX_SMS_REQUESTS_PER_HOUR = 5;
const HOUR_IN_MS = 60 * 60 * 1000;

/**
 * Check if phone number can make SMS requests (rate limiting)
 */
function canMakeSMSRequest(phone: string): boolean {
  const now = Date.now();
  const key = phone.replace(/\D/g, ''); // Normalize phone
  const tracker = smsRequestTracker.get(key);
  
  if (!tracker || now > tracker.resetTime) {
    // Reset or create new tracker
    smsRequestTracker.set(key, { count: 0, resetTime: now + HOUR_IN_MS });
    return true;
  }
  
  return tracker.count < MAX_SMS_REQUESTS_PER_HOUR;
}

/**
 * Track SMS request
 */
function trackSMSRequest(phone: string): void {
  const key = phone.replace(/\D/g, '');
  const tracker = smsRequestTracker.get(key);
  
  if (tracker) {
    tracker.count++;
  }
}

/**
 * Validate phone number format for SMS
 */
function validateSMSPhone(phone: string): string[] {
  const errors: string[] = [];
  
  if (!phone || phone.length < 10) {
    errors.push('Phone number must be at least 10 characters');
  }
  
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.push('Phone number must contain 10-15 digits');
  }
  
  return errors;
}

/**
 * Send SMS verification code
 */
export async function sendSMSCode(
  sidGuest: string,
  phone: string,
  options: {
    lang?: string;
    version?: string;
  } = {}
): Promise<SMSValidationApiResponse> {
  const { lang = 'en', version = '1.1' } = options;
  
  // Validate inputs
  const phoneErrors = validateSMSPhone(phone);
  if (phoneErrors.length > 0) {
    return {
      success: false,
      error: {
        error: phoneErrors[0],
        code: 'invalid_phone'
      }
    };
  }
  
  if (!sidGuest) {
    return {
      success: false,
      error: {
        error: 'Session ID is required',
        code: 'dealer_no_activ'
      }
    };
  }
  
  // Check rate limiting
  if (!canMakeSMSRequest(phone)) {
    return {
      success: false,
      error: {
        error: 'Too many SMS requests. Please wait before trying again.',
        code: 'sends_limit'
      }
    };
  }
  
  try {
    const request: SMSValidationRequest = {
      sid_guest: sidGuest,
      v: version,
      phone,
      send_sms: 1,
      lang
    };
    
    const response = await fetch(`${window.location.origin}${SMS_VALIDATION_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const jsonData = xmlToJson(xmlText) as SMSValidationXMLResponse;
    
    // Track successful request
    trackSMSRequest(phone);
    
    // Parse response
    if (jsonData.root) {
      const data = jsonData.root;
      
      // Check for error in response
      if (data.error) {
        return {
          success: false,
          error: {
            error: data.error,
            code: data.code as SMSValidationErrorCode || 'send_sms'
          }
        };
      }
      
      // Success response
      const smsResponse: SMSValidationResponse = {
        validation_id: parseInt(data.validation_id || '0') || 0,
        phone: data.phone || phone.replace(/\D/g, ''),
        validation_code: data.validation_code,
        status_code: (data.status_code as SMSStatusCode) || 'send_sms',
        status_sms: data.status_sms
      };
      
      return {
        success: true,
        data: smsResponse,
        timestamp: Date.now()
      };
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    return {
      success: false,
      error: {
        error: error instanceof Error ? error.message : 'Failed to send SMS',
        code: 'send_sms'
      }
    };
  }
}

/**
 * Verify SMS code
 */
export async function verifySMSCode(
  sidGuest: string,
  phone: string,
  validationCode: string,
  options: {
    lang?: string;
    version?: string;
  } = {}
): Promise<SMSValidationApiResponse> {
  const { lang = 'en', version = '1.1' } = options;
  
  // Validate inputs
  if (!validationCode || validationCode.length < 4) {
    return {
      success: false,
      error: {
        error: 'Validation code must be at least 4 characters',
        code: 'validation_code'
      }
    };
  }
  
  if (!sidGuest) {
    return {
      success: false,
      error: {
        error: 'Session ID is required',
        code: 'dealer_no_activ'
      }
    };
  }
  
  try {
    const request: SMSValidationRequest = {
      sid_guest: sidGuest,
      v: version,
      phone,
      check_sms: 1,
      validation_code: validationCode,
      lang
    };
    
    const response = await fetch(`${window.location.origin}${SMS_VALIDATION_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const jsonData = xmlToJson(xmlText) as SMSValidationXMLResponse;
    
    // Parse response
    if (jsonData.root) {
      const data = jsonData.root;
      
      // Check for error in response
      if (data.error) {
        return {
          success: false,
          error: {
            error: data.error,
            code: data.code as SMSValidationErrorCode || 'check_valid'
          }
        };
      }
      
      // Success response
      const smsResponse: SMSValidationResponse = {
        validation_id: parseInt(data.validation_id || '0') || 0,
        phone: data.phone || phone.replace(/\D/g, ''),
        validation_code: data.validation_code,
        status_code: (data.status_code as SMSStatusCode) || 'valid'
      };
      
      return {
        success: true,
        data: smsResponse,
        timestamp: Date.now()
      };
    }
    
    throw new Error('Invalid response format');
    
  } catch (error) {
    return {
      success: false,
      error: {
        error: error instanceof Error ? error.message : 'Failed to verify SMS code',
        code: 'check_valid'
      }
    };
  }
}

/**
 * Get remaining SMS attempts for a phone number
 */
export function getRemainingMSAttempts(phone: string): number {
  const key = phone.replace(/\D/g, '');
  const tracker = smsRequestTracker.get(key);
  
  if (!tracker || Date.now() > tracker.resetTime) {
    return MAX_SMS_REQUESTS_PER_HOUR;
  }
  
  return Math.max(0, MAX_SMS_REQUESTS_PER_HOUR - tracker.count);
}

/**
 * Get time until SMS rate limit resets
 */
export function getSMSResetTime(phone: string): Date | null {
  const key = phone.replace(/\D/g, '');
  const tracker = smsRequestTracker.get(key);
  
  if (!tracker || Date.now() > tracker.resetTime) {
    return null;
  }
  
  return new Date(tracker.resetTime);
}
