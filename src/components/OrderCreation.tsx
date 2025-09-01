// React component for order creation with dynamic validation and timer
// Handles the complete order creation workflow

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  User, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  ShoppingCart,
  CreditCard,
  Timer,
  Bus,
  Loader2
} from 'lucide-react';

import {
  createOrder,
  createSimpleOrder,
  createTransferOrder,
  createCombinedOrder,
  validateOrder,
  analyzeOrder,
  cancelOrderReservation
} from '@/lib/newOrderApi';

import {
  getRemainingTime,
  formatRemainingTime,
  stopReservationTimer
} from '@/lib/reservationTimer';

import type {
  OrderBuilder,
  OrderCreationResult,
  OrderAnalytics,
  ReservationInfo,
  Passenger,
  TripMeta,
  OrderValidationError,
  ReservationTimer
} from '@/types/newOrder';

interface OrderCreationProps {
  builder: OrderBuilder;
  credentials: {
    login: string;
    password: string;
  };
  onOrderCreated?: (reservation: ReservationInfo) => void;
  onOrderFailed?: (error: string) => void;
  onTimerExpired?: () => void;
  autoValidate?: boolean;
  showAnalytics?: boolean;
}

export const OrderCreation: React.FC<OrderCreationProps> = ({
  builder,
  credentials,
  onOrderCreated,
  onOrderFailed,
  onTimerExpired,
  autoValidate = true,
  showAnalytics = true
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderCreationResult | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    analytics: OrderAnalytics;
  } | null>(null);
  
  // Timer state
  const [remainingTime, setRemainingTime] = useState<{
    minutes: number;
    seconds: number;
  } | null>(null);
  const [timerExpired, setTimerExpired] = useState(false);

  // Validate order on builder change
  useEffect(() => {
    if (autoValidate) {
      const result = validateOrder(builder);
      setValidationResult(result);
    }
  }, [builder, autoValidate]);

  // Timer update callback
  const handleTimerUpdate = useCallback((minutes: number, seconds: number) => {
    setRemainingTime({ minutes, seconds });
    setTimerExpired(false);
  }, []);

  // Timer expiration callback
  const handleTimerExpired = useCallback(() => {
    setTimerExpired(true);
    setRemainingTime({ minutes: 0, seconds: 0 });
    
    if (onTimerExpired) {
      onTimerExpired();
    }
  }, [onTimerExpired]);

  // Create order
  const handleCreateOrder = useCallback(async () => {
    if (!validationResult?.valid) {
      return;
    }

    setIsCreating(true);
    setOrderResult(null);

    try {
      const result = await createOrder(builder, {
        validate: true,
        autoStartTimer: true,
        timerCallbacks: {
          onUpdate: handleTimerUpdate,
          onExpired: handleTimerExpired
        },
        credentials
      });

      setOrderResult(result);

      if (result.success && result.reservation) {
        console.log('Order created successfully:', result.reservation);
        
        if (onOrderCreated) {
          onOrderCreated(result.reservation);
        }
      } else {
        const errorMessage = result.error?.message || 'Order creation failed';
        console.error('Order creation failed:', errorMessage);
        
        if (onOrderFailed) {
          onOrderFailed(errorMessage);
        }
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (onOrderFailed) {
        onOrderFailed(errorMessage);
      }
    } finally {
      setIsCreating(false);
    }
  }, [
    builder, 
    credentials, 
    validationResult, 
    handleTimerUpdate, 
    handleTimerExpired,
    onOrderCreated,
    onOrderFailed
  ]);

  // Cancel order
  const handleCancelOrder = useCallback(() => {
    if (orderResult?.reservation) {
      const cancelled = cancelOrderReservation(orderResult.reservation.order_id);
      
      if (cancelled) {
        setOrderResult(null);
        setRemainingTime(null);
        setTimerExpired(false);
      }
    }
  }, [orderResult]);

  // Get complexity badge color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'transfers': return 'bg-yellow-100 text-yellow-800';
      case 'combined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timerExpired) return 'text-red-600';
    if (remainingTime && remainingTime.minutes < 5) return 'text-orange-600';
    return 'text-green-600';
  };

  // Calculate progress percentage
  const getTimerProgress = () => {
    if (!remainingTime || timerExpired) return 0;
    
    const totalSeconds = (validationResult?.analytics.reservation_duration_minutes || 20) * 60;
    const remainingSeconds = remainingTime.minutes * 60 + remainingTime.seconds;
    
    return Math.max(0, (remainingSeconds / totalSeconds) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Order Analytics */}
      {showAnalytics && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResult.analytics.total_passengers}
                </div>
                <div className="text-sm text-gray-600">Passengers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationResult.analytics.total_trips}
                </div>
                <div className="text-sm text-gray-600">Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {validationResult.analytics.reservation_duration_minutes}
                </div>
                <div className="text-sm text-gray-600">Minutes Reserved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {validationResult.analytics.currency}
                </div>
                <div className="text-sm text-gray-600">Currency</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={getComplexityColor(validationResult.analytics.complexity)}>
                {validationResult.analytics.complexity}
              </Badge>
              {validationResult.analytics.has_discounts && (
                <Badge variant="outline">Discounts</Badge>
              )}
              {validationResult.analytics.has_baggage && (
                <Badge variant="outline">Baggage</Badge>
              )}
              {validationResult.analytics.has_promocode && (
                <Badge variant="outline">Promocode</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.valid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Validation Errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Warnings:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success */}
            {validationResult.valid && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Order validation passed. Ready to create reservation.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Create Reservation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!orderResult ? (
            <Button
              onClick={handleCreateOrder}
              disabled={!validationResult?.valid || isCreating}
              className="w-full"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Reservation...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create Reservation
                </>
              )}
            </Button>
          ) : orderResult.success ? (
            <div className="space-y-4">
              {/* Reservation Success */}
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">Reservation Created Successfully!</div>
                  <div className="text-sm mt-1">
                    Order ID: {orderResult.reservation?.order_id}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Timer Display */}
              {remainingTime && !timerExpired && (
                <Card className="bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Timer className="h-5 w-5 text-blue-600" />
                        <span className="text-lg font-semibold">Reservation Expires In:</span>
                      </div>
                      <div className={`text-3xl font-bold ${getTimerColor()}`}>
                        {formatRemainingTime(remainingTime.minutes, remainingTime.seconds)}
                      </div>
                      <Progress value={getTimerProgress()} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timer Expired */}
              {timerExpired && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold">Reservation Expired</div>
                    <div className="text-sm mt-1">
                      Your reservation has expired. Please create a new one.
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={handleCancelOrder}
                  disabled={timerExpired}
                >
                  Cancel Reservation
                </Button>
                <Button 
                  className="flex-1"
                  disabled={timerExpired}
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          ) : (
            /* Order Failed */
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold">Order Creation Failed</div>
                <div className="text-sm mt-1">
                  {orderResult.error?.message || 'Unknown error occurred'}
                </div>
                {orderResult.validation_errors && orderResult.validation_errors.length > 0 && (
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {orderResult.validation_errors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Reservation Details */}
      {orderResult?.success && orderResult.reservation && (
        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Order ID:</span> {orderResult.reservation.order_id}
              </div>
              <div>
                <span className="font-medium">Status:</span> {orderResult.reservation.status}
              </div>
              <div>
                <span className="font-medium">Total Price:</span> {orderResult.reservation.price_total} {orderResult.reservation.currency}
              </div>
              <div>
                <span className="font-medium">Expires:</span> {orderResult.reservation.reservation_until}
              </div>
            </div>
            
            {orderResult.reservation.promocode_info && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">Promocode Applied</div>
                <div className="text-sm text-green-600">
                  {orderResult.reservation.promocode_info.promocode_name} - 
                  Discount: {orderResult.reservation.promocode_info.price_promocode} {orderResult.reservation.currency}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderCreation;
