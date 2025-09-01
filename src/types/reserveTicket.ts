// Reserve Ticket API types for Bussystem integration
// Handles ticket reservation with payment on boarding

export interface ReserveTicketRequest {
  login: string;
  password: string;
  v: '1.1';
  order_id: number;
  phone: string;
  phone2?: string;
  email?: string;
  info?: string;
  lang?: string;
}

export interface ReservedPassenger {
  passenger_id: string;
  transaction_id: string;
  name?: string;
  surname?: string;
  seat?: string;
  ticket_id?: string;
  security?: string;
  reserve_before?: string;
  error?: string;
}

export interface ReservedTrip {
  trip_id: string;
  interval_id: string;
  route_id: string;
  date_from: string;
  time_from: string;
  point_from: string;
  station_from: string;
  date_to: string;
  time_to: string;
  point_to: string;
  station_to: string;
  route_name: string;
  carrier: string;
  passengers: ReservedPassenger[];
}

export interface ReservationResult {
  order_id: string;
  trips: ReservedTrip[];
  total_passengers: number;
  all_reserved: boolean;
  has_errors: boolean;
}

export interface ReservationOptions {
  phone: string;
  phone2?: string;
  email?: string;
  info?: string;
  lang?: string;
  retryAttempts?: number;
  validateSMS?: boolean;
}

export interface ReserveTicketResponse {
  success: boolean;
  data?: ReservationResult;
  error?: {
    error: string;
    code: string;
    details?: string;
    retry_suggested?: boolean;
    sms_required?: boolean;
  };
}

// Error codes mapping
export const RESERVE_TICKET_ERRORS = {
  DEALER_NO_ACTIV: 'dealer_no_activ',
  ORDER_ID: 'order_id',
  RESERVE_VALIDATION: 'reserve_validation',
  NEED_SMS_VALIDATION: 'need_sms_validation',
  ORDER: 'order',
  RESERVE: 'reserve',
  INTERVAL_NO_ACTIV: 'interval_no_activ',
  DATA_PASSENGER: 'data_passenger',
  RESERVE_TICKET: 'reserve_ticket',
  FREE_SEAT: 'free_seat',
  NETWORK_ERROR: 'network_error',
  PARSE_ERROR: 'parse_error',
  UNKNOWN_ERROR: 'unknown_error'
} as const;

export type ReserveTicketErrorCode = typeof RESERVE_TICKET_ERRORS[keyof typeof RESERVE_TICKET_ERRORS];

// Error descriptions for user display
export const RESERVE_ERROR_MESSAGES = {
  [RESERVE_TICKET_ERRORS.DEALER_NO_ACTIV]: 'Dealer credentials are invalid or inactive',
  [RESERVE_TICKET_ERRORS.ORDER_ID]: 'Invalid order ID - order not found',
  [RESERVE_TICKET_ERRORS.RESERVE_VALIDATION]: 'Phone number already has existing pay-on-board reservations',
  [RESERVE_TICKET_ERRORS.NEED_SMS_VALIDATION]: 'SMS validation required for this reservation',
  [RESERVE_TICKET_ERRORS.ORDER]: 'Order could not be found or processed',
  [RESERVE_TICKET_ERRORS.RESERVE]: 'Reservation not available for at least one route',
  [RESERVE_TICKET_ERRORS.INTERVAL_NO_ACTIV]: 'Route interval is not active',
  [RESERVE_TICKET_ERRORS.DATA_PASSENGER]: 'Passenger data is missing or invalid',
  [RESERVE_TICKET_ERRORS.RESERVE_TICKET]: 'Ticket reservation data is missing',
  [RESERVE_TICKET_ERRORS.FREE_SEAT]: 'Selected seat is no longer available',
  [RESERVE_TICKET_ERRORS.NETWORK_ERROR]: 'Network connection failed',
  [RESERVE_TICKET_ERRORS.PARSE_ERROR]: 'Failed to parse server response',
  [RESERVE_TICKET_ERRORS.UNKNOWN_ERROR]: 'An unexpected error occurred'
} as const;

// SMS validation interface (for future implementation)
export interface SMSValidation {
  phone: string;
  code: string;
  order_id: number;
}

export interface SMSValidationResponse {
  success: boolean;
  validated: boolean;
  error?: string;
}

// Reservation status tracking
export interface ReservationStatus {
  order_id: number;
  status: 'created' | 'reserving' | 'reserved' | 'failed' | 'sms_required';
  passengers_total: number;
  passengers_reserved: number;
  last_error?: string;
  created_at: Date;
  reserved_at?: Date;
  expires_at?: Date;
}

// Audit trail for reservations
export interface ReservationAudit {
  order_id: number;
  action: 'reserve_attempt' | 'reserve_success' | 'reserve_failure' | 'sms_sent' | 'sms_validated';
  timestamp: Date;
  details: {
    phone?: string;
    passengers_count?: number;
    error_code?: string;
    retry_attempt?: number;
    ticket_ids?: string[];
    security_codes?: string[];
  };
}
