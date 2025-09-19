// src/components/PaymentFlow.tsx - Payment Flow with Timer
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  ArrowLeft
} from 'lucide-react';
import {
  completePayment, 
  formatTimeRemaining, 
  calculateTimeRemaining 
} from '@/lib/bussystem';
import type { 
  PaymentFlowProps, 
  TicketPurchaseResult, 
  PaymentTimer, 
  TimerCallbacks 
} from '@/types/buyTicket';

export function PaymentFlow({ 
  reservation, 
  onPaymentComplete, 
  onCancel 
}: PaymentFlowProps) {
  const normalized = 'orderId' in reservation ? reservation : {
    orderId: reservation.order_id,
    security: reservation.security,
    reservationUntil: reservation.reservation_until,
    reservationUntilMin: Number(reservation.reservation_until_min),
    priceTotal: reservation.price_total,
    currency: reservation.currency
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<PaymentTimer>({
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false
  });
  const [warningShown, setWarningShown] = useState<Set<number>>(new Set());

  // Initialize timer
  useEffect(() => {
    const initialSeconds = calculateTimeRemaining(normalized.reservationUntil);
    setTimer({
      minutes: Math.floor(initialSeconds / 60),
      seconds: initialSeconds % 60,
      totalSeconds: initialSeconds,
      isExpired: initialSeconds <= 0
    });
  }, [normalized.reservationUntil]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await completePayment(
        normalized.orderId,
        normalized.security,
        normalized.reservationUntil,
        {
          onUpdate: (newTimer) => setTimer(newTimer),
          onExpired: () => setError('Rezervarea a expirat. Te rugăm să începi din nou procesul de rezervare.'),
          onWarning: (minutesLeft) => {
            if (!warningShown.has(minutesLeft)) {
              setWarningShown(prev => new Set([...prev, minutesLeft]));
              console.warn(`Atenție! Mai ai doar ${minutesLeft} minute.`);
            }
          }
        }
      );
      if (result.success) {
        onPaymentComplete(result);
      } else {
        setError(result.error || 'Plata a eșuat. Te rugăm să încerci din nou.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare la procesarea plății.');
    } finally {
      setLoading(false);
    }
  };

  // Start timer
  useEffect(() => {
    if (timer.totalSeconds <= 0 || timer.isExpired) return;
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(normalized.reservationUntil);
      if (remaining <= 0) {
        setTimer(t => ({ ...t, totalSeconds: 0, minutes: 0, seconds: 0, isExpired: true }));
        setError('Rezervarea a expirat. Te rugăm să începi din nou procesul de rezervare.');
        clearInterval(interval);
        return;
      }
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimer({ minutes, seconds, totalSeconds: remaining, isExpired: false });
      if (seconds === 0) {
        if (minutes === 5 && !warningShown.has(5)) {
          setWarningShown(prev => new Set([...prev, 5]));
        } else if (minutes === 2 && !warningShown.has(2)) {
          setWarningShown(prev => new Set([...prev, 2]));
        } else if (minutes === 1 && !warningShown.has(1)) {
          setWarningShown(prev => new Set([...prev, 1]));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timer.totalSeconds, timer.isExpired, normalized.reservationUntil, warningShown]);

  const getTimerColor = () => {
    if (timer.isExpired) return 'text-red-500';
    if (timer.minutes <= 2) return 'text-orange-500';
    if (timer.minutes <= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getTimerIcon = () => {
    if (timer.isExpired) return <XCircle className="h-5 w-5" />;
    if (timer.minutes <= 2) return <AlertTriangle className="h-5 w-5" />;
    if (timer.minutes <= 5) return <AlertTriangle className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              Confirmare Plată
          </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Înapoi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timer */}
          <div className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 ${
            timer.isExpired ? 'border-red-200 bg-red-50' :
            timer.minutes <= 2 ? 'border-orange-200 bg-orange-50' :
            timer.minutes <= 5 ? 'border-yellow-200 bg-yellow-50' :
            'border-green-200 bg-green-50'
          }`}>
            {getTimerIcon()}
          <div className="text-center">
              <div className={`text-2xl font-bold ${getTimerColor()}`}>
                {formatTimeRemaining(timer.totalSeconds)}
              </div>
              <div className="text-sm text-muted-foreground">
                {timer.isExpired ? 'Rezervarea a expirat' : 'Timp rămas pentru plată'}
              </div>
            </div>
          </div>
          
          {/* Warning for low time */}
          {timer.minutes <= 5 && !timer.isExpired && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Atenție! Rezervarea va expira în {timer.minutes} minute. 
                Te rugăm să completezi plata cât mai curând.
              </AlertDescription>
            </Alert>
          )}

          {/* Expired warning */}
          {timer.isExpired && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Rezervarea a expirat. Nu mai poți finaliza plata pentru această comandă.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Detalii Comandă</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID Comandă:</span>
              <div className="font-mono">{normalized.orderId}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div>
                <Badge variant={timer.isExpired ? "destructive" : "default"}>
                  {timer.isExpired ? 'Expirat' : 'Rezervat'}
                </Badge>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total de plată:</span>
            <span className="text-primary">
              {normalized.priceTotal} {normalized.currency}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Metode de Plată</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Button
              onClick={handlePayment}
              disabled={loading || timer.isExpired}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Se procesează...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plătește {normalized.priceTotal} {normalized.currency}
                </div>
              )}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              Prin completarea plății, confirmi rezervarea și accepti termenii și condițiile.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">Securitate</div>
              <div className="text-blue-700">
                Toate plățile sunt procesate în siguranță prin API-ul Bussystem. 
                Nu stocăm datele tale de plată.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
