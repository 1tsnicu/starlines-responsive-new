import React, { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  X, 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  User
} from 'lucide-react';
import { 
  cancelTicket, 
  getCancelErrorMessage,
  formatRefundAmount 
} from '@/lib/cancelTicketApi';
import { CancelTicketResult } from '@/types/cancelTicket';

interface CancelIndividualTicketButtonProps {
  ticketId: number;
  passengerName: string;
  onCancelSuccess?: (result: CancelTicketResult) => void;
  onCancelError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showConfirmation?: boolean;
}

export const CancelIndividualTicketButton: React.FC<CancelIndividualTicketButtonProps> = ({
  ticketId,
  passengerName,
  onCancelSuccess,
  onCancelError,
  variant = 'outline',
  size = 'sm',
  className = '',
  showConfirmation = true
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<CancelTicketResult | null>(null);

  const handleCancel = async () => {
    setIsCancelling(true);
    setResult(null);

    try {
      const cancelResult = await cancelTicket(ticketId, 'en');
      
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
      const refundAmount = result.data.money_back || 0;
      const currency = result.data.currency || 'EUR';
      
      return (
        <div className="space-y-2">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="font-medium">Ticket Cancelled</div>
              <div className="text-sm mt-1">
                {passengerName}'s ticket has been cancelled
                {refundAmount > 0 && (
                  <span className="block">
                    Refund: {formatRefundAmount(refundAmount, currency)}
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
        <div className="space-y-2">
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
      <div className="space-y-3 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-800 text-sm">Cancel Ticket</h4>
            <p className="text-xs text-yellow-700 mt-1">
              Cancel {passengerName}'s ticket? This action cannot be undone.
            </p>
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
                Cancel
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
            Keep
          </Button>
        </div>
      </div>
    );
  }

  // Show cancel button
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
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Cancelling...
        </>
      ) : (
        <>
          <User className="h-3 w-3 mr-1" />
          Cancel
        </>
      )}
    </Button>
  );
};

export default CancelIndividualTicketButton;
