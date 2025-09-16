import React, { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { completePayment, TicketPurchaseResult } from '@/lib/bussystem';
import { formatBookingPrice } from '@/lib/tripDetailApi';

interface PaymentButtonProps {
  bookingResponse: any;
  onPaymentSuccess?: (result: TicketPurchaseResult) => void;
  onPaymentError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showConfirmation?: boolean;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  bookingResponse,
  onPaymentSuccess,
  onPaymentError,
  variant = 'default',
  size = 'default',
  className = '',
  showConfirmation = true
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<TicketPurchaseResult | null>(null);

  // Check if payment is needed
  const needsPayment = bookingResponse.status === 'reserve_ok' || 
                      bookingResponse.status === 'reserve' ||
                      bookingResponse.status === 'confirmation';

  const isPaid = bookingResponse.status === 'buy_ok' || 
                 bookingResponse.status === 'buy' ||
                 bookingResponse.status === 'paid';

  const handlePayment = async () => {
    if (!bookingResponse?.order_id || !bookingResponse?.security) {
      onPaymentError?.('Missing order information');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const paymentResult = await completePayment(
        bookingResponse.order_id,
        bookingResponse.security,
        bookingResponse.reservation_until
      );
      
      if (paymentResult.success) {
        setResult(paymentResult);
        onPaymentSuccess?.(paymentResult);
      } else {
        onPaymentError?.(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
    setShowConfirm(false);
    handlePayment();
  };

  const handlePaymentClick = () => {
    if (showConfirmation) {
      setShowConfirm(true);
    } else {
      handlePayment();
    }
  };

  const handleCloseResult = () => {
    setResult(null);
  };

  // Show success result
  if (result && result.success) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="font-medium">Payment Successful!</div>
            <div className="text-sm mt-1">
              Order #{result.orderId} has been paid
              <span className="block">
                Total: {formatBookingPrice(result.priceTotal, result.currency)}
              </span>
              <span className="block text-xs text-green-700">
                You can now download your tickets
              </span>
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
  }

  // Show confirmation dialog
  if (showConfirm) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-800">Confirm Payment</h3>
            <p className="text-sm text-blue-700 mt-1">
              Complete payment for this booking? This will finalize your reservation.
            </p>
            
            {/* Payment details */}
            <div className="mt-2 p-2 bg-white rounded border text-xs">
              <div className="font-medium text-gray-800">
                Payment Details
              </div>
              <div className="text-gray-600 mt-1">
                <div>Order: #{bookingResponse.order_id}</div>
                <div>Amount: {formatBookingPrice(bookingResponse.price_total, bookingResponse.currency || 'EUR')}</div>
                <div>Reservation expires: {bookingResponse.reservation_until}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleConfirmPayment}
            variant="default"
            size="sm"
            className="flex-1"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-3 w-3 mr-1" />
                Pay Now
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowConfirm(false)}
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Show payment button or status
  if (isPaid) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          size={size}
          className={`${className} bg-green-50 border-green-200 text-green-800`}
          disabled
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Payment Completed
        </Button>
        <div className="text-xs text-green-600 text-center">
          You can now download your tickets
        </div>
      </div>
    );
  }

  if (!needsPayment) {
    return (
      <div className="space-y-2">
        <Button
          variant="outline"
          size={size}
          className={`${className} opacity-50 cursor-not-allowed`}
          disabled
        >
          <XCircle className="h-4 w-4 mr-2" />
          Payment Not Required
        </Button>
        <div className="text-xs text-gray-500 text-center">
          This order does not require payment
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePaymentClick}
        variant={variant}
        size={size}
        className={className}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Pay {formatBookingPrice(bookingResponse.price_total, bookingResponse.currency || 'EUR')}
          </>
        )}
      </Button>
      
      {/* Reservation timer warning */}
      <div className="flex items-center gap-1 text-xs text-amber-600">
        <Clock className="h-3 w-3" />
        <span>Reservation expires in {bookingResponse.reservation_until_min} minutes</span>
      </div>
    </div>
  );
};

export default PaymentButton;
