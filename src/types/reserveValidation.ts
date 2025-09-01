// Reserve Validation API types for Bussystem integration
// Handles pre-reservation validation and SMS requirements checking

export interface ReserveValidationRequest {
  login: string;
  password: string;
  v: '1.1';
  phone: string;
  lang?: string;
}

export interface ReserveValidationResult {
  reserve_validation: boolean;
  need_sms_validation: boolean;
}

export interface ReserveValidationResponse {
  success: boolean;
  data?: ReserveValidationResult;
  error?: {
    error: string;
    code: string;
    details?: string;
  };
}

export interface ValidationOptions {
  phone: string;
  lang?: string;
  retryAttempts?: number;
}

// Error codes mapping
export const RESERVE_VALIDATION_ERRORS = {
  NO_PHONE: 'no_phone',
  DEALER_NO_ACTIV: 'dealer_no_activ',
  NETWORK_ERROR: 'network_error',
  PARSE_ERROR: 'parse_error',
  UNKNOWN_ERROR: 'unknown_error'
} as const;

export type ReserveValidationErrorCode = typeof RESERVE_VALIDATION_ERRORS[keyof typeof RESERVE_VALIDATION_ERRORS];

// Error descriptions for user display
export const RESERVE_VALIDATION_ERROR_MESSAGES = {
  [RESERVE_VALIDATION_ERRORS.NO_PHONE]: 'Phone number is missing or invalid',
  [RESERVE_VALIDATION_ERRORS.DEALER_NO_ACTIV]: 'Dealer credentials are invalid or inactive',
  [RESERVE_VALIDATION_ERRORS.NETWORK_ERROR]: 'Network connection failed',
  [RESERVE_VALIDATION_ERRORS.PARSE_ERROR]: 'Failed to parse server response',
  [RESERVE_VALIDATION_ERRORS.UNKNOWN_ERROR]: 'An unexpected error occurred'
} as const;

// Validation status for UI
export interface ValidationStatus {
  canReserve: boolean;
  requiresSMS: boolean;
  phone: string;
  checkedAt: Date;
  sessionId?: string;  // For SMS validation API
  error?: string;
}

// SMS validation workflow states
export type SMSValidationState = 
  | 'not_required'
  | 'required'
  | 'code_sent'
  | 'code_verified'
  | 'code_failed';

export interface SMSWorkflow {
  phone: string;
  state: SMSValidationState;
  validationId?: number;  // From SMS validation API
  codeRequestedAt?: Date;
  codeVerifiedAt?: Date;
  attemptsRemaining: number;
  maxAttempts: number;
}
