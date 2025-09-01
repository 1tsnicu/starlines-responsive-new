// SMS Validation types for Bussystem sms_validation endpoint
// Handles SMS sending and code verification workflow

export interface SMSValidationRequest {
  sid_guest: string;
  v: string;
  phone: string;
  lang?: string;
  
  // SMS sending step
  send_sms?: 1;
  
  // SMS verification step  
  check_sms?: 1;
  validation_code?: string;
}

export interface SMSValidationResponse {
  validation_id: number;
  phone: string;
  validation_code?: string;
  status_code: SMSStatusCode;
  status_sms?: string; // Only present when send_sms=1
}

export type SMSStatusCode = 
  | 'send_sms'     // SMS sent successfully
  | 'valid'        // Code verified successfully
  | 'invalid';     // Code verification failed

export interface SMSValidationError {
  error: string;
  code: SMSValidationErrorCode;
}

export type SMSValidationErrorCode =
  | 'dealer_no_activ'       // Invalid session/sid_guest
  | 'no_phone'              // Missing phone number
  | 'invalid_phone'         // Invalid phone format
  | 'method'                // Missing send_sms or check_sms
  | 'validation_code'       // Missing or incorrect SMS code
  | 'generate_code'         // No code generated before check_sms
  | 'check_generate_code'   // SMS code doesn't exist in system
  | 'send_sms'              // SMS sending failed
  | 'sends_limit'           // Too many SMS attempts in short interval
  | 'expired'               // SMS validation time expired
  | 'check_valid';          // Validation check failed

export interface SMSValidationApiResponse {
  success: boolean;
  data?: SMSValidationResponse;
  error?: SMSValidationError;
  timestamp?: number;
  cached?: boolean;
}

// SMS workflow tracking
export interface SMSValidationWorkflow {
  phone: string;
  validationId?: number;
  step: 'send' | 'verify' | 'completed' | 'failed';
  attemptsRemaining: number;
  maxAttempts: number;
  lastSentAt?: Date;
  expiresAt?: Date;
  isExpired: boolean;
}

// Error code mappings for user-friendly messages
export const SMS_VALIDATION_ERRORS: Record<SMSValidationErrorCode, string> = {
  dealer_no_activ: 'Session expired. Please refresh the page.',
  no_phone: 'Phone number is required for SMS validation.',
  invalid_phone: 'Invalid phone number format.',
  method: 'Invalid SMS validation method.',
  validation_code: 'Invalid or missing SMS verification code.',
  generate_code: 'SMS code not generated. Please request a new code.',
  check_generate_code: 'SMS code not found in system. Please request a new code.',
  send_sms: 'Failed to send SMS. Please try again.',
  sends_limit: 'Too many SMS attempts. Please wait before trying again.',
  expired: 'SMS code has expired. Please request a new code.',
  check_valid: 'SMS code verification failed. Please check the code and try again.'
};

// SMS validation timeout (usually 5-10 minutes)
export const SMS_CODE_TIMEOUT = 10 * 60 * 1000; // 10 minutes
export const SMS_RETRY_LIMIT = 3;
export const SMS_COOLDOWN_PERIOD = 60 * 1000; // 1 minute between attempts
