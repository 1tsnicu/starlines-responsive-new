import React, { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  X, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info
} from 'lucide-react';
import { 
  cancelOrder, 
  cancelTicket, 
  getCancelErrorMessage,
  getCancellationSummary,
  formatRefundAmount,
  checkPaymentStatus,
  getCancellationRules
} from '@/lib/cancelTicketApi';
import { CancelTicketResult, CancelTicketUIProps } from '@/types/cancelTicket';

export const CancelTicketButton: React.FC<CancelTicketUIProps> = ({
  bookingResponse,
  onCancelSuccess,
  onCancelError,
  variant = 'destructive',
  size = 'default',
  className = '',
  showConfirmation = true
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<CancelTicketResult | null>(null);

  // Check payment status and cancellation rules
  const paymentStatus = checkPaymentStatus(bookingResponse);
  const cancellationRules = getCancellationRules(bookingResponse);

  const handleCancel = async () => {
    if (!bookingResponse?.order_id) {
      onCancelError?.('Missing order information');
      return;
    }

    // Check if cancellation is allowed
    if (!cancellationRules.canCancel) {
      onCancelError?.(cancellationRules.reason || 'Cancellation not allowed');
      return;
    }

    setIsCancelling(true);
    setResult(null);

    try {
      const cancelResult = await cancelOrder(bookingResponse.order_id, bookingResponse.lang || 'en');
      
      if (cancelResult.success) {
        setResult(cancelResult);
        onCancelSuccess?.(cancelResult);
      } else {
        const errorMessage = getCancelErrorMessage(
          cancelResult.errorCode || 'unknown',
          cancelResult.error?.error
        );
        onCancelError?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onCancelError?.(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmCancel = () => {
    setShowConfirm(false);
    handleCancel();
  };

  const handleCancelClick = () => {
    if (showConfirmation) {
      setShowConfirm(true);
    } else {
      handleCancel();
    }
  };

  const handleCloseResult = () => {
    setResult(null);
  };

  // Show success/error result
  if (result) {
    if (result.success && result.data) {
      const summary = getCancellationSummary(result.data);
      
      return (
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="font-medium">Cancellation Successful!</div>
              <div className="text-sm mt-1">
                {summary.cancelledTickets} ticket(s) cancelled
                {summary.totalRefund > 0 && (
                  <span className="block">
                    Refund: {formatRefundAmount(summary.totalRefund, summary.currency)}
                  </span>
                )}
                {summary.isPaidOrder && (
                  <span className="block text-xs text-green-700">
                    Paid order - refund processed
                  </span>
                )}
                {!summary.isPaidOrder && (
                  <span className="block text-xs text-green-700">
                    Reservation cancelled - no payment required
                  </span>
                )}
              </div>
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={handleCloseResult}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Close
          </Button>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Cancellation Failed</div>
              <div className="text-sm mt-1">
                {getCancelErrorMessage(
                  result.errorCode || 'unknown',
                  result.error?.error
                )}
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              Try Again
            </Button>
            <Button
              onClick={handleCloseResult}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      );
    }
  }

  // Show confirmation dialog
  if (showConfirm) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800">Confirm Cancellation</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            
            {/* Payment status info */}
            <div className="mt-2 p-2 bg-white rounded border text-xs">
              <div className="font-medium text-gray-800">
                {paymentStatus.isPaid ? 'Paid Order' : 'Reservation (Unpaid)'}
              </div>
              {paymentStatus.isPaid ? (
                <div className="text-gray-600 mt-1">
                  • Refund will be processed according to cancellation policy
                  {cancellationRules.freeCancellationMinutes > 0 && (
                    <span className="block">
                      • Free cancellation within {cancellationRules.freeCancellationMinutes} minutes
                    </span>
                  )}
                  {cancellationRules.cancellationRate > 0 && (
                    <span className="block">
                      • Cancellation fee: {cancellationRules.cancellationRate}%
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-gray-600 mt-1">
                  • No payment required - reservation will be cancelled
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleConfirmCancel}
            variant="destructive"
            size="sm"
            className="flex-1"
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Yes, Cancel Booking
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowConfirm(false)}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isCancelling}
          >
            Keep Booking
          </Button>
        </div>
      </div>
    );
  }

  // Show cancel button or disabled state
  if (!cancellationRules.canCancel) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          size={size}
          className={`${className} opacity-50 cursor-not-allowed`}
          disabled
        >
          <X className="h-4 w-4 mr-2" />
          Cancellation Not Available
        </Button>
        <div className="text-xs text-red-600">
          {cancellationRules.reason}
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleCancelClick}
      variant={variant}
      size={size}
      className={className}
      disabled={isCancelling}
    >
      {isCancelling ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Cancelling...
        </>
      ) : (
        <>
          <X className="h-4 w-4 mr-2" />
          {paymentStatus.isPaid ? 'Cancel & Refund' : 'Cancel Reservation'}
        </>
      )}
    </Button>
  );
};

export default CancelTicketButton;
