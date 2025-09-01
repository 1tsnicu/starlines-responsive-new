// Reserve Ticket React component with comprehensive reservation workflow
// Handles ticket reservation UI with status tracking and error handling

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MessageSquare, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

import {
  createReservation,
  getReservationStatus,
  getReservationAudit,
  requiresSMSValidation,
  retryAfterSMSValidation
} from '@/lib/reserveTicketApi';

import {
  canProceedToReservation
} from '@/lib/reserveValidationApi';

import { ReserveValidation } from '@/components/ReserveValidation';

import type {
  ReservationOptions,
  ReservationStatus,
  ReservationAudit,
  ReservedTrip,
  ReservedPassenger,
  ReserveTicketResponse
} from '@/types/reserveTicket';

import type { ReserveValidationResponse } from '@/types/reserveValidation';

interface ReserveTicketProps {
  orderId?: number;
  initialOptions?: Partial<ReservationOptions>;
  onReservationComplete?: (result: ReserveTicketResponse) => void;
  onReservationError?: (error: string) => void;
  className?: string;
}

interface ReservationFormData {
  phone: string;
  phone2: string;
  email: string;
  info: string;
  lang: string;
}

export function ReserveTicket({
  orderId: initialOrderId,
  initialOptions = {},
  onReservationComplete,
  onReservationError,
  className = ''
}: ReserveTicketProps): JSX.Element {
  // Form state
  const [orderId, setOrderId] = useState<number>(initialOrderId || 0);
  const [formData, setFormData] = useState<ReservationFormData>({
    phone: initialOptions.phone || '',
    phone2: initialOptions.phone2 || '',
    email: initialOptions.email || '',
    info: initialOptions.info || '',
    lang: initialOptions.lang || 'en'
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<ReserveTicketResponse | null>(null);
  const [status, setStatus] = useState<ReservationStatus | null>(null);
  const [auditLog, setAuditLog] = useState<ReservationAudit[]>([]);

  // SMS state
  const [smsRequired, setSmsRequired] = useState(false);
  const [smsCode, setSmsCode] = useState('');

  // Validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Validate form data
   */
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!orderId || orderId <= 0) {
      errors.orderId = 'Valid order ID is required';
    }

    if (!formData.phone || formData.phone.length < 10) {
      errors.phone = 'Valid phone number is required (minimum 10 digits)';
    }

    if (formData.phone2 && formData.phone2.length < 10) {
      errors.phone2 = 'Valid secondary phone number required if provided';
    }

    if (formData.email && !formData.email.includes('@')) {
      errors.email = 'Valid email address is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [orderId, formData]);

  /**
   * Update form field
   */
  const updateField = useCallback((field: keyof ReservationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  }, [validationErrors]);

  /**
   * Update order ID
   */
  const updateOrderId = useCallback((value: string) => {
    const numValue = parseInt(value, 10);
    setOrderId(isNaN(numValue) ? 0 : numValue);
    
    // Clear validation error
    if (validationErrors.orderId) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated.orderId;
        return updated;
      });
    }
  }, [validationErrors]);

  /**
   * Refresh status and audit log
   */
  const refreshStatus = useCallback(() => {
    if (orderId > 0) {
      const currentStatus = getReservationStatus(orderId);
      const currentAudit = getReservationAudit(orderId);
      const needsSms = requiresSMSValidation(orderId);
      
      setStatus(currentStatus);
      setAuditLog(currentAudit);
      setSmsRequired(needsSms);
    }
  }, [orderId]);

  /**
   * Handle validation completion
   */
  const handleValidationComplete = useCallback((result: ReserveValidationResponse) => {
    setValidationComplete(true);
    
    // Update phone number in form if needed
    if (result.success && result.data) {
      // Phone validation completed successfully
      console.log('Validation completed:', result);
    }
  }, []);

  /**
   * Handle proceed status change
   */
  const handleCanProceed = useCallback((canProceedStatus: boolean, phone: string) => {
    setCanProceed(canProceedStatus);
    
    // Update phone in form if it changed during validation
    if (phone !== formData.phone) {
      updateField('phone', phone);
    }
  }, [formData.phone, updateField]);

  /**
   * Handle reservation submission
   */
  const handleReserve = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    // Check if validation is complete and can proceed
    const proceedCheck = canProceedToReservation(formData.phone);
    if (!proceedCheck.canProceed) {
      setError(proceedCheck.reason || 'Cannot proceed with reservation');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const options: ReservationOptions = {
        phone: formData.phone,
        phone2: formData.phone2 || undefined,
        email: formData.email || undefined,
        info: formData.info || undefined,
        lang: formData.lang
      };

      const response = await createReservation(orderId, options);
      
      setResult(response);
      refreshStatus();

      if (response.success) {
        onReservationComplete?.(response);
      } else {
        setError(response.error?.error || 'Reservation failed');
        onReservationError?.(response.error?.error || 'Reservation failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(errorMessage);
      onReservationError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, formData, validateForm, onReservationComplete, onReservationError, refreshStatus]);

  /**
   * Handle SMS validation
   */
  const handleSmsValidation = useCallback(async () => {
    if (!smsCode.trim() || !orderId) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await retryAfterSMSValidation(orderId, smsCode);
      
      setResult(response);
      refreshStatus();

      if (response.success) {
        setSmsRequired(false);
        setSmsCode('');
        onReservationComplete?.(response);
      } else {
        setError(response.error?.error || 'SMS validation failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SMS validation error';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, smsCode, onReservationComplete, refreshStatus]);

  /**
   * Refresh status on order ID change
   */
  useEffect(() => {
    refreshStatus();
  }, [orderId, refreshStatus]);

  /**
   * Get status badge variant
   */
  const getStatusVariant = (status: ReservationStatus['status']) => {
    switch (status) {
      case 'reserved': return 'default';
      case 'reserving': return 'secondary';
      case 'sms_required': return 'outline';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  /**
   * Format passenger info for display
   */
  const formatPassengerInfo = (passenger: ReservedPassenger) => {
    const parts = [];
    if (passenger.name || passenger.surname) {
      parts.push(`${passenger.name || ''} ${passenger.surname || ''}`.trim());
    }
    if (passenger.seat) {
      parts.push(`Seat ${passenger.seat}`);
    }
    if (passenger.ticket_id) {
      parts.push(`Ticket #${passenger.ticket_id}`);
    }
    return parts.join(' • ');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Order ID Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Reserve Ticket
          </CardTitle>
          <CardDescription>
            Reserve tickets with payment on boarding for an existing order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="orderId">Order ID *</Label>
            <Input
              id="orderId"
              type="number"
              value={orderId || ''}
              onChange={(e) => updateOrderId(e.target.value)}
              placeholder="Enter order ID from new_order"
              className={validationErrors.orderId ? 'border-red-500' : ''}
            />
            {validationErrors.orderId && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.orderId}</p>
            )}
          </div>

          {status && (
            <div>
              <Label>Current Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusVariant(status.status)}>
                  {status.status.replace('_', ' ').toUpperCase()}
                </Badge>
                {status.passengers_total > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {status.passengers_reserved}/{status.passengers_total} passengers
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reserve Validation */}
      <ReserveValidation
        initialPhone={formData.phone}
        onValidationComplete={handleValidationComplete}
        onCanProceed={handleCanProceed}
      />

      {/* Contact Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>
            Provide contact details for all passengers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Primary Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="e.g. +44077625125"
                className={validationErrors.phone ? 'border-red-500' : ''}
              />
              {validationErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone2">Secondary Phone</Label>
              <Input
                id="phone2"
                type="tel"
                value={formData.phone2}
                onChange={(e) => updateField('phone2', e.target.value)}
                placeholder="Optional backup number"
                className={validationErrors.phone2 ? 'border-red-500' : ''}
              />
              {validationErrors.phone2 && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.phone2}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="passenger@example.com"
              className={validationErrors.email ? 'border-red-500' : ''}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="info" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Special Requests
            </Label>
            <Textarea
              id="info"
              value={formData.info}
              onChange={(e) => updateField('info', e.target.value)}
              placeholder="I want near the window, extra luggage, etc."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lang">Language</Label>
              <select
                id="lang"
                value={formData.lang}
                onChange={(e) => updateField('lang', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="en">English</option>
                <option value="ro">Română</option>
                <option value="ru">Русский</option>
                <option value="uk">Українська</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Validation Card */}
      {smsRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Verification Required
            </CardTitle>
            <CardDescription>
              Enter the verification code sent to your phone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                placeholder="Enter SMS code"
                maxLength={6}
              />
              <Button 
                onClick={handleSmsValidation} 
                disabled={isLoading || !smsCode.trim()}
              >
                Validate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reserve Button */}
      {!smsRequired && (
        <Button
          onClick={handleReserve}
          disabled={isLoading || Object.keys(validationErrors).length > 0 || !canProceed}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Reserving Tickets...
            </>
          ) : canProceed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Reserve Tickets
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 mr-2" />
              Complete Validation First
            </>
          )}
        </Button>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result?.success && result.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Reservation Successful
            </CardTitle>
            <CardDescription>
              Order #{result.data.order_id} - {result.data.total_passengers} passengers
              {!result.data.all_reserved && ` (${result.data.has_errors ? 'some errors' : 'partial'})`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.data.trips.map((trip, tripIndex) => (
              <div key={tripIndex} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold">{trip.route_name}</h4>
                    <p className="text-sm text-muted-foreground">{trip.carrier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {trip.point_from} → {trip.point_to}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trip.date_from} {trip.time_from} - {trip.date_to} {trip.time_to}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h5 className="font-medium">Passengers ({trip.passengers.length})</h5>
                  {trip.passengers.map((passenger, passengerIndex) => (
                    <div key={passengerIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{formatPassengerInfo(passenger)}</p>
                        {passenger.security && (
                          <p className="text-sm text-muted-foreground">
                            Security Code: {passenger.security}
                          </p>
                        )}
                        {passenger.reserve_before && (
                          <p className="text-sm text-muted-foreground">
                            Reserved until: {passenger.reserve_before}
                          </p>
                        )}
                      </div>
                      <div>
                        {passenger.error ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge variant="default">Reserved</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      {auditLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLog.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{entry.action.replace('_', ' ')}</span>
                  <span className="text-muted-foreground">
                    {entry.timestamp.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
