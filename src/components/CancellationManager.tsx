import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  XCircle, 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  Package, 
  Users,
  RefreshCw,
  ArrowRight,
  Ban
} from 'lucide-react';

import { cancellationAPI, calculateTotalRefund, canCancelIndividualTickets, formatRefundAmount } from '../lib/cancellation';
import type { CancellationEstimate, CancellationResult } from '../types/cancellation';

interface CancellationManagerProps {
  tickets: Array<{
    ticket_id: number;
    security?: number;
    passenger_name?: string;
    seat_number?: string;
  }>;
  order_id?: number;
  order_security?: number;
  onCancellationComplete?: (result: CancellationResult) => void;
  className?: string;
}

export function CancellationManager({ 
  tickets, 
  order_id, 
  order_security,
  onCancellationComplete,
  className = "" 
}: CancellationManagerProps) {
  const [estimates, setEstimates] = useState<CancellationEstimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cancellationType, setCancellationType] = useState<'ticket' | 'order'>('ticket');

  // Load cancellation estimates on mount
  useEffect(() => {
    const loadEstimatesOnMount = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const newEstimates = await cancellationAPI.getOrderCancellationEstimate(tickets);
        setEstimates(newEstimates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcarea informațiilor de anulare');
      } finally {
        setLoading(false);
      }
    };

    loadEstimatesOnMount();
  }, [tickets]);

  const loadEstimates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newEstimates = await cancellationAPI.getOrderCancellationEstimate(tickets);
      setEstimates(newEstimates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcarea informațiilor de anulare');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSelection = (ticketId: number, selected: boolean) => {
    const newSelection = new Set(selectedTickets);
    if (selected) {
      newSelection.add(ticketId);
    } else {
      newSelection.delete(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const handleSelectAll = () => {
    const cancellableTickets = estimates.filter(est => est.can_cancel_individual);
    setSelectedTickets(new Set(cancellableTickets.map(est => est.ticket_id)));
  };

  const handleDeselectAll = () => {
    setSelectedTickets(new Set());
  };

  const getSelectedEstimates = () => {
    return estimates.filter(est => selectedTickets.has(est.ticket_id));
  };

  const canCancelSelected = () => {
    const selected = getSelectedEstimates();
    return selected.length > 0 && selected.every(est => est.can_cancel_individual && est.cancellation_rate < 100);
  };

  const canCancelEntireOrder = () => {
    return order_id && order_security && estimates.length > 0 && estimates.every(est => est.cancellation_rate < 100);
  };

  const handleCancelTickets = async () => {
    if (!canCancelSelected()) return;

    setCancelling(true);
    setError(null);

    try {
      const selected = getSelectedEstimates();
      
      if (selected.length === 1) {
        // Cancel single ticket
        const ticket = selected[0];
        const ticketInfo = tickets.find(t => t.ticket_id === ticket.ticket_id);
        
        const response = await cancellationAPI.cancelTicket({
          ticket_id: ticket.ticket_id,
          security: ticketInfo?.security || 0
        });

        const result = cancellationAPI.processCancellationResult(response, 'ticket');
        
        // Add passenger name to result details
        if (result.details[0] && ticketInfo?.passenger_name) {
          result.details[0].passenger_name = ticketInfo.passenger_name;
        }
        
        onCancellationComplete?.(result);
        
        // Refresh estimates
        await loadEstimates();
        setSelectedTickets(new Set());
        
      } else {
        // Multiple tickets - handle individually for now
        // In a real implementation, you might want to batch these or use order cancellation
        const results: CancellationResult[] = [];
        
        for (const estimate of selected) {
          const ticketInfo = tickets.find(t => t.ticket_id === estimate.ticket_id);
          
          const response = await cancellationAPI.cancelTicket({
            ticket_id: estimate.ticket_id,
            security: ticketInfo?.security || 0
          });

          const result = cancellationAPI.processCancellationResult(response, 'ticket');
          
          // Add passenger name to result details
          if (result.details[0] && ticketInfo?.passenger_name) {
            result.details[0].passenger_name = ticketInfo.passenger_name;
          }
          
          results.push(result);
        }

        // Combine results for callback
        const combinedResult: CancellationResult = {
          success: results.every(r => r.success),
          type: 'order',
          order_id,
          total_refund: results.reduce((sum, r) => sum + r.total_refund, 0),
          total_retained: results.reduce((sum, r) => sum + r.total_retained, 0),
          currency: results[0]?.currency || 'EUR',
          refund_method: results[0]?.refund_method,
          refund_timeline: results[0]?.refund_timeline,
          details: results.flatMap(r => r.details)
        };

        onCancellationComplete?.(combinedResult);
        
        // Refresh estimates
        await loadEstimates();
        setSelectedTickets(new Set());
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la anularea biletelor');
    } finally {
      setCancelling(false);
      setShowConfirmDialog(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!canCancelEntireOrder()) return;

    setCancelling(true);
    setError(null);

    try {
      const response = await cancellationAPI.cancelOrder({
        order_id: order_id!,
        security: order_security!
      });

      const result = cancellationAPI.processCancellationResult(response, 'order');
      
      // Add passenger names to result details
      result.details.forEach(detail => {
        const ticketInfo = tickets.find(t => t.ticket_id === detail.ticket_id);
        if (ticketInfo?.passenger_name) {
          detail.passenger_name = ticketInfo.passenger_name;
        }
      });
      
      onCancellationComplete?.(result);
      
      // Refresh estimates
      await loadEstimates();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la anularea comenzii');
    } finally {
      setCancelling(false);
      setShowConfirmDialog(false);
    }
  };

  const handleConfirmCancellation = () => {
    if (cancellationType === 'order') {
      handleCancelOrder();
    } else {
      handleCancelTickets();
    }
  };

  const openConfirmDialog = (type: 'ticket' | 'order') => {
    setCancellationType(type);
    setShowConfirmDialog(true);
  };

  const selectedSummary = getSelectedEstimates();
  const totalSummary = calculateTotalRefund(estimates);
  const selectedTotalSummary = calculateTotalRefund(selectedSummary);
  const individualCancellationAllowed = canCancelIndividualTickets(estimates);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Se încarcă informațiile de anulare...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadEstimates} variant="outline" className="mt-3">
            <RefreshCw className="h-4 w-4 mr-2" />
            Încearcă din nou
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Estimare Anulare
          </CardTitle>
          <CardDescription>
            Sumele finale vor fi confirmate doar după procesarea anulării
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total bilete:</span>
                <span className="font-medium">{estimates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sumă plătită:</span>
                <span className="font-medium">
                  {formatRefundAmount(estimates.reduce((sum, est) => sum + est.original_price, 0), totalSummary.currency)}
                </span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Reținere estimată:</span>
                <span className="font-medium">
                  {formatRefundAmount(totalSummary.total_retained, totalSummary.currency)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Retur estimat:</span>
                <span className="font-bold">
                  {formatRefundAmount(totalSummary.total_refund, totalSummary.currency)}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              {selectedTickets.size > 0 && (
                <>
                  <div className="text-sm font-medium text-blue-700">Bilete selectate ({selectedTickets.size}):</div>
                  <div className="flex justify-between text-blue-600">
                    <span>Retur estimat:</span>
                    <span className="font-bold">
                      {formatRefundAmount(selectedTotalSummary.total_refund, selectedTotalSummary.currency)}
                    </span>
                  </div>
                </>
              )}
              
              {!individualCancellationAllowed && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Aceste bilete pot fi anulate doar ca parte a întregii comenzi
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bilete pentru Anulare
            </CardTitle>
            {individualCancellationAllowed && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Selectează tot
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  Deselectează tot
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {estimates.map((estimate, index) => {
            const isSelected = selectedTickets.has(estimate.ticket_id);
            const canCancel = estimate.can_cancel_individual && estimate.cancellation_rate < 100;
            
            return (
              <div key={estimate.ticket_id} className={`border rounded-lg p-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {individualCancellationAllowed && canCancel && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleTicketSelection(estimate.ticket_id, e.target.checked)}
                        className="rounded"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">
                        {estimate.passenger_name || `Pasager ${index + 1}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Bilet #{estimate.ticket_id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {estimate.cancellation_rate >= 100 ? (
                      <Badge variant="destructive" className="mb-1">
                        <Ban className="h-3 w-3 mr-1" />
                        Nu se poate anula
                      </Badge>
                    ) : !estimate.can_cancel_individual ? (
                      <Badge variant="secondary" className="mb-1">
                        Doar comanda întreagă
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mb-1">
                        Anulabil individual
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Plătit:</span>
                    <div className="font-medium">
                      {formatRefundAmount(estimate.original_price, estimate.currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reținere:</span>
                    <div className="font-medium text-red-600">
                      {formatRefundAmount(estimate.retention_amount, estimate.currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retur:</span>
                    <div className="font-medium text-green-600">
                      {formatRefundAmount(estimate.refund_amount, estimate.currency)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Taxă:</span>
                    <div className="font-medium">
                      {estimate.cancellation_rate}%
                    </div>
                  </div>
                </div>
                
                {estimate.baggage_refund && estimate.baggage_refund > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>Bagaje: +{formatRefundAmount(estimate.baggage_refund, estimate.currency)} retur</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Individual ticket cancellation */}
            {individualCancellationAllowed && (
              <Button
                onClick={() => openConfirmDialog('ticket')}
                disabled={!canCancelSelected() || cancelling}
                variant="outline"
                className="w-full"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Anulează Biletele Selectate ({selectedTickets.size})
              </Button>
            )}
            
            {/* Order cancellation */}
            {canCancelEntireOrder() && (
              <Button
                onClick={() => openConfirmDialog('order')}
                disabled={cancelling}
                variant="destructive"
                className="w-full"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Anulează Întreaga Comandă
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirmare Anulare
            </DialogTitle>
            <DialogDescription>
              {cancellationType === 'order' 
                ? `Ești sigur că vrei să anulezi întreaga comandă? Această acțiune nu poate fi anulată.`
                : `Ești sigur că vrei să anulezi ${selectedTickets.size} bilet${selectedTickets.size > 1 ? 'e' : ''}? Această acțiune nu poate fi anulată.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Suma de returnat (estimată):</span>
                <span className="font-bold text-green-600">
                  {formatRefundAmount(
                    cancellationType === 'order' ? totalSummary.total_refund : selectedTotalSummary.total_refund,
                    cancellationType === 'order' ? totalSummary.currency : selectedTotalSummary.currency
                  )}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Suma finală va fi confirmată după procesarea anulării
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Anulează
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancellation}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Se procesează...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmă Anularea
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
