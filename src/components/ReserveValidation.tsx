// Reserve Validation React component
// Handles pre-reservation validation and SMS workflow

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Phone, Shield, CheckCircle, XCircle, AlertCircle, MessageSquare, Clock } from 'lucide-react';

import {
  checkReservationValidation,
  getCachedValidationStatus,
  getSMSWorkflow,
  updateSMSWorkflow,
  canProceedToReservation
} from '@/lib/reserveValidationApi';

import {
  sendSMSCode,
  verifySMSCode,
  getRemainingMSAttempts
} from '@/lib/smsValidationHttp';

import type {
  ReserveValidationResponse,
  ValidationStatus,
  SMSWorkflow,
  SMSValidationState
} from '@/types/reserveValidation';

interface ReserveValidationProps {
  initialPhone?: string;
  onValidationComplete?: (result: ReserveValidationResponse) => void;
  onCanProceed?: (canProceed: boolean, phone: string) => void;
  className?: string;
}

export function ReserveValidation({
  initialPhone = '',
  onValidationComplete,
  onCanProceed,
  className = ''
}: ReserveValidationProps) {
  // Form state
  const [phone, setPhone] = useState<string>(initialPhone);
  const [smsCode, setSmsCode] = useState<string>('');

  // UI state
  const [isValidating, setIsValidating] = useState(false);
  const [isSMSValidating, setIsSMSValidating] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<ReserveValidationResponse | null>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
  const [smsWorkflow, setSmsWorkflow] = useState<SMSWorkflow | null>(null);

  // Validation
  const [phoneError, setPhoneError] = useState<string>('');

  /**
   * Validate phone number format
   */
  const validatePhone = useCallback((phoneValue: string): boolean => {
    if (!phoneValue || phoneValue.length < 10) {
      setPhoneError('Phone number must be at least 10 characters');
      return false;
    }

    const phoneDigits = phoneValue.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setPhoneError('Phone number must contain at least 10 digits');
      return false;
    }

    setPhoneError('');
    return true;
  }, []);

  /**
   * Update phone number
   */
  const updatePhone = useCallback((value: string) => {
    setPhone(value);
    validatePhone(value);
  }, [validatePhone]);

  /**
   * Refresh status from cache
   */
  const refreshStatus = useCallback(() => {
    if (phone) {
      const cached = getCachedValidationStatus(phone);
      const workflow = getSMSWorkflow(phone);
      
      setValidationStatus(cached);
      setSmsWorkflow(workflow);
      
      // Check if can proceed and notify parent
      const proceedCheck = canProceedToReservation(phone);
      onCanProceed?.(proceedCheck.canProceed, phone);
    }
  }, [phone, onCanProceed]);

  /**
   * Handle validation check
   */
  const handleValidate = useCallback(async () => {
    if (!validatePhone(phone)) {
      return;
    }

    setIsValidating(true);
    setError('');
    setResult(null);

    try {
      const response = await checkReservationValidation({
        phone,
        lang: 'en'
      });

      setResult(response);
      refreshStatus();

      if (response.success) {
        onValidationComplete?.(response);
      } else {
        setError(response.error?.error || 'Validation failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  }, [phone, validatePhone, onValidationComplete, refreshStatus]);

  /**
   * Handle SMS code submission
   */
  const handleSMSValidation = useCallback(async () => {
    if (!smsCode.trim() || !phone || !smsWorkflow?.validationId) {
      return;
    }

    setIsSMSValidating(true);
    setError('');

    try {
      // Use the real SMS validation API
      const response = await verifySMSCode(
        validationStatus?.sessionId || 'guest_session',
        phone,
        smsCode.trim(),
        { lang: 'en' }
      );
      
      if (response.success && response.data) {
        // Update workflow with success
        updateSMSWorkflow(phone, 'code_verified', response.data.validation_id);
        setSmsCode('');
        setError('');
      } else {
        // Update workflow with failure
        updateSMSWorkflow(phone, 'code_failed');
        setError(response.error?.error || 'Invalid SMS code. Please try again.');
      }
      
      refreshStatus();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SMS validation error';
      setError(errorMessage);
      updateSMSWorkflow(phone, 'code_failed');
      refreshStatus();
    } finally {
      setIsSMSValidating(false);
    }
  }, [phone, smsCode, smsWorkflow?.validationId, validationStatus?.sessionId, refreshStatus]);

  /**
   * Handle SMS code request
   */
  const handleRequestSMSCode = useCallback(async () => {
    if (!phone) {
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // Use the real SMS validation API
      const response = await sendSMSCode(
        validationStatus?.sessionId || 'guest_session',
        phone,
        { lang: 'en' }
      );
      
      if (response.success && response.data) {
        // Update workflow with success
        updateSMSWorkflow(phone, 'code_sent', response.data.validation_id);
        setError('');
      } else {
        // Handle error
        const errorMsg = response.error?.error || 'Failed to send SMS code';
        setError(errorMsg);
        
        // Handle specific error codes
        if (response.error?.code === 'sends_limit') {
          updateSMSWorkflow(phone, 'code_failed');
        } else if (response.error?.code === 'dealer_no_activ') {
          // Need to re-validate first
          setError('Please check validation first before requesting SMS');
        }
      }
      
      refreshStatus();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request SMS code';
      setError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  }, [phone, validationStatus?.sessionId, refreshStatus]);

  /**
   * Refresh status on phone change
   */
  useEffect(() => {
    refreshStatus();
  }, [phone, refreshStatus]);

  /**
   * Get status icon and color
   */
  const getStatusDisplay = () => {
    if (!validationStatus) {
      return { icon: Phone, color: 'text-gray-500', label: 'Not checked' };
    }

    if (validationStatus.error) {
      return { icon: XCircle, color: 'text-red-500', label: 'Error' };
    }

    if (!validationStatus.canReserve) {
      return { icon: XCircle, color: 'text-red-500', label: 'Cannot reserve' };
    }

    if (validationStatus.requiresSMS) {
      if (!smsWorkflow) {
        return { icon: MessageSquare, color: 'text-yellow-500', label: 'SMS required' };
      }

      switch (smsWorkflow.state) {
        case 'required':
          return { icon: MessageSquare, color: 'text-yellow-500', label: 'SMS required' };
        case 'code_sent':
          return { icon: Clock, color: 'text-blue-500', label: 'Code sent' };
        case 'code_verified':
          return { icon: CheckCircle, color: 'text-green-500', label: 'Verified' };
        case 'code_failed':
          return { icon: AlertCircle, color: 'text-red-500', label: 'Code failed' };
        default:
          return { icon: MessageSquare, color: 'text-yellow-500', label: 'SMS pending' };
      }
    }

    return { icon: CheckCircle, color: 'text-green-500', label: 'Ready to reserve' };
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  const proceedCheck = phone ? canProceedToReservation(phone) : { canProceed: false };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Phone Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Reserve Validation
          </CardTitle>
          <CardDescription>
            Check if reservation is allowed for your phone number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => updatePhone(e.target.value)}
                placeholder="e.g. +44077625125"
                className={phoneError ? 'border-red-500' : ''}
              />
              {phoneError && (
                <p className="text-sm text-red-500 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-2">
                <StatusIcon className={`h-4 w-4 ${statusDisplay.color}`} />
                <Badge variant={validationStatus?.canReserve ? 'default' : 'secondary'}>
                  {statusDisplay.label}
                </Badge>
                {validationStatus && (
                  <span className="text-sm text-muted-foreground">
                    Checked {validationStatus.checkedAt.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleValidate}
            disabled={isValidating || !!phoneError || !phone}
            className="w-full"
          >
            {isValidating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Check Validation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* SMS Validation */}
      {validationStatus?.requiresSMS && smsWorkflow && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Validation Required
            </CardTitle>
            <CardDescription>
              This phone number requires SMS verification before reservation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {smsWorkflow.state === 'required' && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Click below to request an SMS verification code
                </p>
                {phone && (
                  <p className="text-sm text-blue-600 mb-4">
                    {getRemainingMSAttempts(phone)} SMS requests remaining this hour
                  </p>
                )}
                <Button 
                  onClick={handleRequestSMSCode} 
                  variant="outline"
                  disabled={isValidating || getRemainingMSAttempts(phone) === 0}
                >
                  {isValidating ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request SMS Code
                    </>
                  )}
                </Button>
                {getRemainingMSAttempts(phone) === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    SMS limit reached. Please wait before requesting more codes.
                  </p>
                )}
              </div>
            )}

            {(smsWorkflow.state === 'code_sent' || smsWorkflow.state === 'code_failed') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="smsCode">SMS Verification Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="smsCode"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSMSValidation} 
                      disabled={isSMSValidating || !smsCode.trim()}
                    >
                      {isSMSValidating ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  {smsWorkflow.attemptsRemaining > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {smsWorkflow.attemptsRemaining} attempts remaining
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleRequestSMSCode} 
                    variant="outline" 
                    size="sm"
                    disabled={isValidating || getRemainingMSAttempts(phone) === 0}
                  >
                    {isValidating ? 'Sending...' : 'Resend Code'}
                  </Button>
                  {phone && (
                    <span className="text-sm text-muted-foreground self-center">
                      {getRemainingMSAttempts(phone)} requests left
                    </span>
                  )}
                </div>
              </div>
            )}

            {smsWorkflow.state === 'code_verified' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  SMS verification completed successfully! You can now proceed to reservation.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Validation Results */}
      {result?.success && result.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.data.reserve_validation ? 'YES' : 'NO'}
                </div>
                <div className="text-sm text-green-700">Can Reserve</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.data.need_sms_validation ? 'YES' : 'NO'}
                </div>
                <div className="text-sm text-blue-700">SMS Required</div>
              </div>
            </div>

            <Separator />

            <div>
              <h5 className="font-medium mb-2">Next Steps</h5>
              <div className="text-sm text-muted-foreground">
                {proceedCheck.canProceed ? (
                  <p className="text-green-600">✅ Ready to proceed with ticket reservation</p>
                ) : (
                  <p className="text-amber-600">⚠️ {proceedCheck.reason}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
