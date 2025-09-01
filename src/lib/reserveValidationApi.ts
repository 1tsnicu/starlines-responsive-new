// Reserve Validation API client with caching and SMS workflow management
// Handles pre-reservation validation and integrates with reserve_ticket workflow

import { validateReservation as validateReservationHttp } from './reserveValidationHttp';
import { auditLogger, AuditEventType, AuditSeverity } from './audit';
import type {
  ReserveValidationRequest,
  ReserveValidationResponse,
  ReserveValidationErrorCode,
  ValidationOptions,
  ValidationStatus,
  SMSWorkflow,
  SMSValidationState
} from '../types/reserveValidation';

/**
 * Generate a session ID for validation tracking
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
import {
  RESERVE_VALIDATION_ERRORS
} from '../types/reserveValidation';

// Configuration
const API_CONFIG = {
  baseURL: import.meta.env?.VITE_BUSS_BASE_URL || 'https://test-api.bussystem.eu/server',
  timeout: 10000,
  retryAttempts: 2,
  retryDelay: 1000,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
};

// In-memory validation cache and SMS workflow tracking
class ValidationTracker {
  private validations: Map<string, ValidationStatus> = new Map();
  private smsWorkflows: Map<string, SMSWorkflow> = new Map();

  /**
   * Generate cache key for phone number
   */
  private getCacheKey(phone: string): string {
    return phone.replace(/\D/g, ''); // Remove non-digits for consistent key
  }

  /**
   * Get validation status from cache
   */
  getValidationStatus(phone: string): ValidationStatus | null {
    const key = this.getCacheKey(phone);
    const status = this.validations.get(key);
    
    if (!status) return null;
    
    // Check if cache is expired
    const now = new Date();
    const cacheAge = now.getTime() - status.checkedAt.getTime();
    if (cacheAge > API_CONFIG.cacheTimeout) {
      this.validations.delete(key);
      return null;
    }
    
    return status;
  }

  /**
   * Store validation status in cache
   */
  setValidationStatus(phone: string, status: ValidationStatus): void {
    const key = this.getCacheKey(phone);
    this.validations.set(key, status);
  }

  /**
   * Get SMS workflow for phone
   */
  getSMSWorkflow(phone: string): SMSWorkflow | null {
    const key = this.getCacheKey(phone);
    return this.smsWorkflows.get(key) || null;
  }

  /**
   * Create or update SMS workflow
   */
  setSMSWorkflow(phone: string, workflow: SMSWorkflow): void {
    const key = this.getCacheKey(phone);
    this.smsWorkflows.set(key, workflow);
  }

  /**
   * Initialize SMS workflow
   */
  initializeSMSWorkflow(phone: string, isRequired: boolean): SMSWorkflow {
    const workflow: SMSWorkflow = {
      phone,
      state: isRequired ? 'required' : 'not_required',
      attemptsRemaining: 3,
      maxAttempts: 3
    };
    
    this.setSMSWorkflow(phone, workflow);
    return workflow;
  }

  /**
   * Update SMS workflow state
   */
  updateSMSWorkflow(phone: string, updates: Partial<SMSWorkflow>): SMSWorkflow | null {
    const current = this.getSMSWorkflow(phone);
    if (!current) return null;
    
    const updated = { ...current, ...updates };
    this.setSMSWorkflow(phone, updated);
    return updated;
  }

  /**
   * Clear expired data
   */
  cleanup(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Clean expired validations
    for (const [key, status] of this.validations.entries()) {
      if (status.checkedAt < oneHourAgo) {
        this.validations.delete(key);
      }
    }
    
    // Clean old SMS workflows
    for (const [key, workflow] of this.smsWorkflows.entries()) {
      const workflowAge = workflow.codeRequestedAt || workflow.codeVerifiedAt;
      if (workflowAge && workflowAge < oneHourAgo) {
        this.smsWorkflows.delete(key);
      }
    }
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.validations.clear();
    this.smsWorkflows.clear();
  }

  /**
   * Get all validations (public accessor)
   */
  getValidations(): Map<string, ValidationStatus> {
    return this.validations;
  }

  /**
   * Get all SMS workflows (public accessor)
   */
  getSMSWorkflows(): Map<string, SMSWorkflow> {
    return this.smsWorkflows;
  }
}

// Global tracker instance
const tracker = new ValidationTracker();

// Cleanup old data every 30 minutes
setInterval(() => tracker.cleanup(), 30 * 60 * 1000);

/**
 * Get credentials from environment or config
 */
function getCredentials(): { login: string; password: string } {
  const login = import.meta.env?.VITE_BUSS_LOGIN;
  const password = import.meta.env?.VITE_BUSS_PASSWORD;
  
  if (!login || !password) {
    // Fallback to demo credentials for development
    return {
      login: 'infobus-ws',
      password: 'infobus-ws'
    };
  }
  
  return { login, password };
}

/**
 * Validate phone number format
 */
function validatePhoneFormat(phone: string): string[] {
  const errors: string[] = [];
  
  if (!phone || phone.length < 10) {
    errors.push('Phone number must be at least 10 characters');
  }
  
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    errors.push('Phone number must contain at least 10 digits');
  }
  
  return errors;
}

/**
 * Main API function to validate reservation
 */
export async function checkReservationValidation(
  options: ValidationOptions
): Promise<ReserveValidationResponse> {
  const { phone, lang = 'en', retryAttempts } = options;
  
  // Validate phone format
  const phoneErrors = validatePhoneFormat(phone);
  if (phoneErrors.length > 0) {
    return {
      success: false,
      error: {
        error: phoneErrors.join('; '),
        code: RESERVE_VALIDATION_ERRORS.NO_PHONE
      }
    };
  }
  
  // Check cache first
  const cachedStatus = tracker.getValidationStatus(phone);
  if (cachedStatus && !cachedStatus.error) {
    return {
      success: true,
      data: {
        reserve_validation: cachedStatus.canReserve,
        need_sms_validation: cachedStatus.requiresSMS
      }
    };
  }
  
  try {
    // Get credentials
    const credentials = getCredentials();
    
    // Prepare request
    const request: ReserveValidationRequest = {
      login: credentials.login,
      password: credentials.password,
      v: '1.1',
      phone,
      lang
    };
    
    // Make validation request
    const response = await validateReservationHttp(request, {
      timeout_ms: API_CONFIG.timeout,
      retry_attempts: retryAttempts || API_CONFIG.retryAttempts,
      retry_delay_ms: API_CONFIG.retryDelay
    });
    
    if (response.success && response.data) {
      // Success - cache result and initialize SMS workflow
      const status: ValidationStatus = {
        canReserve: response.data.reserve_validation,
        requiresSMS: response.data.need_sms_validation,
        phone,
        checkedAt: new Date(),
        sessionId: generateSessionId()
      };
      
      tracker.setValidationStatus(phone, status);
      
      // Initialize SMS workflow if needed
      if (response.data.reserve_validation) {
        tracker.initializeSMSWorkflow(phone, response.data.need_sms_validation);
      }
      
      // Log to audit system
      try {
        auditLogger.log(
          AuditEventType.DATA_EXPORTED, // Using closest available type
          AuditSeverity.INFO,
          {
            phone,
            can_reserve: response.data.reserve_validation,
            needs_sms: response.data.need_sms_validation
          },
          undefined,
          'reserve_validation',
          phone,
          'validation_check'
        );
      } catch (auditError) {
        console.warn('Failed to log audit event:', auditError);
      }
      
      return response;
      
    } else {
      // Error - cache the error for a short time to avoid repeated requests
      const status: ValidationStatus = {
        canReserve: false,
        requiresSMS: false,
        phone,
        checkedAt: new Date(),
        sessionId: generateSessionId(),
        error: response.error?.error || 'Validation failed'
      };
      
      tracker.setValidationStatus(phone, status);
      
      return response;
    }
    
  } catch (error) {
    // Unexpected error
    const status: ValidationStatus = {
      canReserve: false,
      requiresSMS: false,
      phone,
      checkedAt: new Date(),
      sessionId: generateSessionId(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    tracker.setValidationStatus(phone, status);
    
    return {
      success: false,
      error: {
        error: error instanceof Error ? error.message : 'Validation failed',
        code: RESERVE_VALIDATION_ERRORS.UNKNOWN_ERROR
      }
    };
  }
}

/**
 * Get cached validation status for a phone number
 */
export function getCachedValidationStatus(phone: string): ValidationStatus | null {
  return tracker.getValidationStatus(phone);
}

/**
 * Get SMS workflow for a phone number
 */
export function getSMSWorkflow(phone: string): SMSWorkflow | null {
  return tracker.getSMSWorkflow(phone);
}

/**
 * Update SMS workflow state with optional validation ID
 */
export function updateSMSWorkflow(
  phone: string, 
  state: SMSValidationState, 
  validationId?: number
): SMSWorkflow | null {
  const updates: Partial<SMSWorkflow> = { state };
  
  if (validationId !== undefined) {
    updates.validationId = validationId;
  }
  
  if (state === 'code_sent') {
    updates.codeRequestedAt = new Date();
  } else if (state === 'code_verified') {
    updates.codeVerifiedAt = new Date();
  } else if (state === 'code_failed') {
    const current = tracker.getSMSWorkflow(phone);
    if (current) {
      updates.attemptsRemaining = Math.max(0, current.attemptsRemaining - 1);
    }
  }
  
  return tracker.updateSMSWorkflow(phone, updates);
}

/**
 * Check if phone can proceed to reservation
 */
export function canProceedToReservation(phone: string): {
  canProceed: boolean;
  reason?: string;
  requiresSMS?: boolean;
  smsState?: SMSValidationState;
} {
  const validation = tracker.getValidationStatus(phone);
  const smsWorkflow = tracker.getSMSWorkflow(phone);
  
  if (!validation) {
    return { 
      canProceed: false, 
      reason: 'Validation check required - please check reservation eligibility first' 
    };
  }
  
  if (validation.error) {
    return { 
      canProceed: false, 
      reason: validation.error 
    };
  }
  
  if (!validation.canReserve) {
    return { 
      canProceed: false, 
      reason: 'Reservation not allowed for this phone number' 
    };
  }
  
  if (validation.requiresSMS) {
    if (!smsWorkflow) {
      return { 
        canProceed: false, 
        reason: 'SMS validation workflow not initialized',
        requiresSMS: true 
      };
    }
    
    if (smsWorkflow.state === 'required' || smsWorkflow.state === 'code_sent') {
      return { 
        canProceed: false, 
        reason: 'SMS validation required - please enter verification code',
        requiresSMS: true,
        smsState: smsWorkflow.state 
      };
    }
    
    if (smsWorkflow.state === 'code_failed') {
      if (smsWorkflow.attemptsRemaining <= 0) {
        return { 
          canProceed: false, 
          reason: 'SMS validation failed - maximum attempts exceeded',
          requiresSMS: true,
          smsState: smsWorkflow.state 
        };
      } else {
        return { 
          canProceed: false, 
          reason: 'SMS validation failed - please try again',
          requiresSMS: true,
          smsState: smsWorkflow.state 
        };
      }
    }
    
    if (smsWorkflow.state !== 'code_verified') {
      return { 
        canProceed: false, 
        reason: 'SMS validation not completed',
        requiresSMS: true,
        smsState: smsWorkflow.state 
      };
    }
  }
  
  return { canProceed: true };
}

/**
 * Clear validation cache for a phone number
 */
export function clearValidationCache(phone?: string): void {
  if (phone) {
    const key = phone.replace(/\D/g, '');
    tracker.getValidations().delete(key);
    tracker.getSMSWorkflows().delete(key);
  } else {
    tracker.clear();
  }
}

/**
 * Get all cached validations (for admin/debug)
 */
export function getAllValidations(): ValidationStatus[] {
  return Array.from(tracker.getValidations().values());
}

/**
 * Get all SMS workflows (for admin/debug)
 */
export function getAllSMSWorkflows(): SMSWorkflow[] {
  return Array.from(tracker.getSMSWorkflows().values());
}

/**
 * Export tracker for testing
 */
export { tracker as validationTracker };
