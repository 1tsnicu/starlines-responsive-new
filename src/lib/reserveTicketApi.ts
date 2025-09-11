// Reserve Ticket API client with status tracking and audit logging
// Handles complete reservation workflow with retry logic and SMS validation

import { reserveTicket as reserveTicketHttp } from './reserveTicketHttp';
import { auditLogger, AuditEventType, AuditSeverity } from './audit';
import type {
  ReserveTicketRequest,
  ReserveTicketResponse,
  ReservationOptions,
  ReservationStatus,
  ReservationAudit,
  ReservedPassenger,
  ReserveTicketErrorCode
} from '../types/reserveTicket';
import { RESERVE_TICKET_ERRORS } from '../types/reserveTicket';

// Configuration
const API_CONFIG = {
  baseURL: import.meta.env.DEV ? '/api/backend/curl' : '/api/backend/curl',
  timeout: 15000,
  retryAttempts: 2,
  retryDelay: 1000
};

// In-memory status tracking (in production, use proper state management)
class ReservationTracker {
  private reservations: Map<number, ReservationStatus> = new Map();
  private auditLog: ReservationAudit[] = [];

  /**
   * Get reservation status
   */
  getStatus(orderId: number): ReservationStatus | null {
    return this.reservations.get(orderId) || null;
  }

  /**
   * Update reservation status
   */
  updateStatus(orderId: number, updates: Partial<ReservationStatus>): void {
    const current = this.reservations.get(orderId);
    if (current) {
      this.reservations.set(orderId, { ...current, ...updates });
    }
  }

  /**
   * Create new reservation tracking
   */
  createStatus(orderId: number, passengersTotal: number): ReservationStatus {
    const status: ReservationStatus = {
      order_id: orderId,
      status: 'created',
      passengers_total: passengersTotal,
      passengers_reserved: 0,
      created_at: new Date()
    };
    
    this.reservations.set(orderId, status);
    return status;
  }

  /**
   * Add audit log entry
   */
  addAudit(entry: ReservationAudit): void {
    this.auditLog.push(entry);
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog.splice(0, this.auditLog.length - 1000);
    }
  }

  /**
   * Get audit log for order
   */
  getAuditLog(orderId: number): ReservationAudit[] {
    return this.auditLog.filter(entry => entry.order_id === orderId);
  }

  /**
   * Clear old reservations (cleanup)
   */
  cleanup(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [orderId, status] of this.reservations.entries()) {
      if (status.created_at < oneDayAgo) {
        this.reservations.delete(orderId);
      }
    }
    
    // Clean audit log older than 7 days
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.auditLog = this.auditLog.filter(entry => entry.timestamp >= oneWeekAgo);
  }
}

// Global tracker instance
const tracker = new ReservationTracker();

// Cleanup old data every hour
setInterval(() => tracker.cleanup(), 60 * 60 * 1000);

/**
 * Get credentials from environment or config
 */
function getCredentials(): { login: string; password: string } {
  return { login: 'backend', password: 'backend' }; // backend injects real creds
}

/**
 * Validate reservation options
 */
function validateOptions(orderId: number, options: ReservationOptions): string[] {
  const errors: string[] = [];
  
  if (!orderId || orderId <= 0) {
    errors.push('Valid order ID is required');
  }
  
  if (!options.phone || options.phone.length < 10) {
    errors.push('Valid phone number is required (minimum 10 digits)');
  }
  
  if (options.email && !options.email.includes('@')) {
    errors.push('Valid email address is required if provided');
  }
  
  if (options.phone2 && options.phone2.length < 10) {
    errors.push('Valid secondary phone number is required if provided');
  }
  
  return errors;
}

/**
 * Create audit entry
 */
function createAuditEntry(
  orderId: number,
  action: ReservationAudit['action'],
  details: ReservationAudit['details']
): ReservationAudit {
  return {
    order_id: orderId,
    action,
    timestamp: new Date(),
    details
  };
}

/**
 * Extract ticket information from passengers
 */
function extractTicketInfo(passengers: ReservedPassenger[]): {
  ticket_ids: string[];
  security_codes: string[];
} {
  const ticket_ids: string[] = [];
  const security_codes: string[] = [];
  
  passengers.forEach(passenger => {
    if (passenger.ticket_id) {
      ticket_ids.push(passenger.ticket_id);
    }
    if (passenger.security) {
      security_codes.push(passenger.security);
    }
  });
  
  return { ticket_ids, security_codes };
}

/**
 * Main API function to reserve tickets
 */
export async function createReservation(
  orderId: number,
  options: ReservationOptions
): Promise<ReserveTicketResponse> {
  // Validate input
  const validationErrors = validateOptions(orderId, options);
  if (validationErrors.length > 0) {
    return {
      success: false,
      error: {
        error: validationErrors.join('; '),
        code: RESERVE_TICKET_ERRORS.DATA_PASSENGER
      }
    };
  }
  
  try {
    // Get credentials
    const credentials = getCredentials();
    
    // Create or get reservation status
    let status = tracker.getStatus(orderId);
    if (!status) {
      status = tracker.createStatus(orderId, 0); // Will be updated when we get passenger count
    }
    
    // Update status to reserving
    tracker.updateStatus(orderId, { status: 'reserving' });
    
    // Log attempt
    const auditEntry = createAuditEntry(orderId, 'reserve_attempt', {
      phone: options.phone,
      retry_attempt: 1
    });
    tracker.addAudit(auditEntry);
    
    // Prepare request
    const request: ReserveTicketRequest = {
      login: credentials.login,
      password: credentials.password,
      v: '1.1',
      order_id: orderId,
      phone: options.phone,
      phone2: options.phone2,
      email: options.email,
      info: options.info,
      lang: options.lang || 'en'
    };
    
    // Make reservation request
    const response = await reserveTicketHttp(request, {
      timeout_ms: API_CONFIG.timeout,
      retry_attempts: options.retryAttempts || API_CONFIG.retryAttempts,
      retry_delay_ms: API_CONFIG.retryDelay
    });
    
    if (response.success && response.data) {
      // Success - update status and log
      const allPassengers = response.data.trips.flatMap(trip => trip.passengers);
      const { ticket_ids, security_codes } = extractTicketInfo(allPassengers);
      
      tracker.updateStatus(orderId, {
        status: 'reserved',
        passengers_total: response.data.total_passengers,
        passengers_reserved: response.data.total_passengers - 
          allPassengers.filter(p => p.error).length,
        reserved_at: new Date(),
        expires_at: allPassengers[0]?.reserve_before ? 
          new Date(allPassengers[0].reserve_before) : undefined
      });
      
      const successAudit = createAuditEntry(orderId, 'reserve_success', {
        phone: options.phone,
        passengers_count: response.data.total_passengers,
        ticket_ids,
        security_codes
      });
      tracker.addAudit(successAudit);
      
      // Log to audit system
      try {
        auditLogger.log(
          AuditEventType.DATA_EXPORTED, // Using closest available type
          AuditSeverity.INFO,
          {
            order_id: orderId,
            passengers_count: response.data.total_passengers,
            all_reserved: response.data.all_reserved,
            phone: options.phone
          },
          undefined,
          'reservation',
          orderId.toString(),
          'ticket_reserved'
        );
      } catch (auditError) {
        console.warn('Failed to log audit event:', auditError);
      }
      
      return response;
      
    } else {
      // Error - update status and log
      const errorCode = response.error?.code || RESERVE_TICKET_ERRORS.UNKNOWN_ERROR;
      
      // Handle SMS validation requirement
      if (errorCode === RESERVE_TICKET_ERRORS.NEED_SMS_VALIDATION) {
        tracker.updateStatus(orderId, { 
          status: 'sms_required',
          last_error: response.error?.error 
        });
        
        const smsAudit = createAuditEntry(orderId, 'sms_sent', {
          phone: options.phone
        });
        tracker.addAudit(smsAudit);
        
      } else {
        tracker.updateStatus(orderId, { 
          status: 'failed',
          last_error: response.error?.error 
        });
      }
      
      const errorAudit = createAuditEntry(orderId, 'reserve_failure', {
        phone: options.phone,
        error_code: errorCode
      });
      tracker.addAudit(errorAudit);
      
      return response;
    }
    
  } catch (error) {
    // Unexpected error
    tracker.updateStatus(orderId, { 
      status: 'failed',
      last_error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    const errorAudit = createAuditEntry(orderId, 'reserve_failure', {
      phone: options.phone,
      error_code: RESERVE_TICKET_ERRORS.UNKNOWN_ERROR
    });
    tracker.addAudit(errorAudit);
    
    return {
      success: false,
      error: {
        error: error instanceof Error ? error.message : 'Reservation failed',
        code: RESERVE_TICKET_ERRORS.UNKNOWN_ERROR
      }
    };
  }
}

/**
 * Get reservation status for an order
 */
export function getReservationStatus(orderId: number): ReservationStatus | null {
  return tracker.getStatus(orderId);
}

/**
 * Get audit log for an order
 */
export function getReservationAudit(orderId: number): ReservationAudit[] {
  return tracker.getAuditLog(orderId);
}

/**
 * Check if order requires SMS validation
 */
export function requiresSMSValidation(orderId: number): boolean {
  const status = tracker.getStatus(orderId);
  return status?.status === 'sms_required';
}

/**
 * Retry reservation after SMS validation (placeholder for future implementation)
 */
export async function retryAfterSMSValidation(
  orderId: number,
  smsCode: string
): Promise<ReserveTicketResponse> {
  // This would implement SMS validation flow
  // For now, return not implemented
  return {
    success: false,
    error: {
      error: 'SMS validation not yet implemented',
      code: RESERVE_TICKET_ERRORS.NEED_SMS_VALIDATION
    }
  };
}

/**
 * Get all active reservations (for admin/debug)
 */
export function getAllReservations(): ReservationStatus[] {
  return Array.from(tracker['reservations'].values());
}

/**
 * Export tracker for testing
 */
export { tracker as reservationTracker };
