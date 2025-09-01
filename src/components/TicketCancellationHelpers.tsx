import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

import { CancellationManager } from './CancellationManager';
import { CancellationResultDisplay } from './CancellationResultDisplay';
import type { CancellationResult } from '../types/cancellation';

interface TicketCancellationButtonProps {
  ticket: {
    ticket_id: number;
    security?: number;
    passenger_name?: string;
    seat_number?: string;
    route?: string;
    departure_time?: string;
    price?: number;
  };
  order?: {
    order_id: number;
    security: number;
  };
  disabled?: boolean;
  onCancellationComplete?: (result: CancellationResult) => void;
  className?: string;
}

export function TicketCancellationButton({ 
  ticket, 
  order,
  disabled = false,
  onCancellationComplete,
  className = "" 
}: TicketCancellationButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [view, setView] = useState<'manager' | 'result'>('manager');
  const [result, setResult] = useState<CancellationResult | null>(null);

  const handleCancellationComplete = (cancellationResult: CancellationResult) => {
    setResult(cancellationResult);
    setView('result');
    onCancellationComplete?.(cancellationResult);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setView('manager');
    setResult(null);
  };

  const isNearDeparture = () => {
    if (!ticket.departure_time) return false;
    const departure = new Date(ticket.departure_time);
    const now = new Date();
    const hoursDifference = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDifference < 2; // Less than 2 hours
  };

  const canCancel = !disabled && !isNearDeparture();

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setShowDialog(true)}
        disabled={!canCancel}
        className={className}
      >
        <XCircle className="h-4 w-4 mr-2" />
        {isNearDeparture() ? 'Prea târziu' : 'Anulează'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {view === 'manager' ? 'Anulare Bilet' : 'Rezultat Anulare'}
            </DialogTitle>
            <DialogDescription>
              {view === 'manager' ? (
                <>
                  Bilet #{ticket.ticket_id} • {ticket.passenger_name}
                  {isNearDeparture() && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Plecare în curând
                    </Badge>
                  )}
                </>
              ) : (
                'Anularea a fost procesată'
              )}
            </DialogDescription>
          </DialogHeader>

          {view === 'manager' && (
            <CancellationManager
              tickets={[ticket]}
              order_id={order?.order_id}
              order_security={order?.security}
              onCancellationComplete={handleCancellationComplete}
            />
          )}

          {view === 'result' && result && (
            <CancellationResultDisplay
              result={result}
              onClose={handleCloseDialog}
            />
          )}

          {view === 'manager' && (
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Închide
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface OrderCancellationButtonProps {
  tickets: Array<{
    ticket_id: number;
    security?: number;
    passenger_name?: string;
    seat_number?: string;
  }>;
  order: {
    order_id: number;
    security: number;
  };
  disabled?: boolean;
  onCancellationComplete?: (result: CancellationResult) => void;
  className?: string;
}

export function OrderCancellationButton({ 
  tickets, 
  order,
  disabled = false,
  onCancellationComplete,
  className = "" 
}: OrderCancellationButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [view, setView] = useState<'manager' | 'result'>('manager');
  const [result, setResult] = useState<CancellationResult | null>(null);

  const handleCancellationComplete = (cancellationResult: CancellationResult) => {
    setResult(cancellationResult);
    setView('result');
    onCancellationComplete?.(cancellationResult);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setView('manager');
    setResult(null);
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setShowDialog(true)}
        disabled={disabled}
        className={className}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Anulează Comanda
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {view === 'manager' ? 'Anulare Comandă' : 'Rezultat Anulare'}
            </DialogTitle>
            <DialogDescription>
              {view === 'manager' ? (
                `Comandă #${order.order_id} • ${tickets.length} bilet${tickets.length > 1 ? 'e' : ''}`
              ) : (
                'Anularea a fost procesată'
              )}
            </DialogDescription>
          </DialogHeader>

          {view === 'manager' && (
            <CancellationManager
              tickets={tickets}
              order_id={order.order_id}
              order_security={order.security}
              onCancellationComplete={handleCancellationComplete}
            />
          )}

          {view === 'result' && result && (
            <CancellationResultDisplay
              result={result}
              onClose={handleCloseDialog}
            />
          )}

          {view === 'manager' && (
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Închide
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
