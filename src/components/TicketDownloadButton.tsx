import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { downloadAllTickets, downloadSpecificTicket, TicketDownloadOptions, canDownloadTickets } from '@/lib/ticketDownload';
import { BookingResponse } from '@/types/tripDetail';

interface TicketDownloadButtonProps {
  bookingResponse: BookingResponse;
  ticketId?: number; // Optional: for downloading specific ticket
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const TicketDownloadButton: React.FC<TicketDownloadButtonProps> = ({
  bookingResponse,
  ticketId,
  variant = 'default',
  size = 'default',
  className = '',
  children,
  onSuccess,
  onError
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (countdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCountdown(null);
      setRetryAfter(null);
    }
  }, [countdown]);

  const handleDownload = async () => {
    if (!bookingResponse.order_id || !bookingResponse.security) {
      const error = 'Missing order ID or security code';
      setLastError(error);
      onError?.(error);
      return;
    }

    // Check if payment is completed
    if (!canDownloadTickets(bookingResponse)) {
      const error = 'Payment required before downloading tickets';
      setLastError(error);
      onError?.(error);
      return;
    }

    setIsDownloading(true);
    setLastError(null);

    try {
      const options: TicketDownloadOptions = {
        orderId: bookingResponse.order_id,
        security: bookingResponse.security.toString(),
        lang: bookingResponse.lang || 'en'
      };

      let result;
      if (ticketId) {
        result = await downloadSpecificTicket(bookingResponse, ticketId);
      } else {
        result = await downloadAllTickets(bookingResponse);
      }

      if (result.success) {
        setRetryCount(0);
        setLastError(null);
        setRetryAfter(null);
        setCountdown(null);
        onSuccess?.();
      } else {
        const errorMsg = result.error || 'Download failed';
        setLastError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check if it's a PDF creation failed error with retry info
      if (errorMessage.startsWith('PDF_CREATION_FAILED:')) {
        const parts = errorMessage.split(':');
        const message = parts[1] || 'PDF creation failed';
        const retrySeconds = parseInt(parts[2]) || 120;
        
        setLastError(message);
        setRetryAfter(retrySeconds);
        setCountdown(retrySeconds);
        onError?.(message);
      } else {
        setLastError(errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleDownload();
  };

  // Check if payment is completed
  const isPaid = canDownloadTickets(bookingResponse);

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleDownload}
        disabled={isDownloading || !isPaid}
        variant={variant}
        size={size}
        className={className}
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : lastError ? (
          <AlertCircle className="h-4 w-4 mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {isDownloading 
          ? 'Downloading...' 
          : countdown && countdown > 0
            ? `Wait ${countdown}s`
            : lastError 
              ? 'Retry Download' 
              : !isPaid
                ? 'Payment Required'
                : children || (ticketId ? 'Download Ticket' : 'Download Tickets')
        }
      </Button>
      
      {!isPaid && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <div className="font-medium">Payment Required:</div>
          <div className="text-xs mt-1">Complete payment to download tickets</div>
        </div>
      )}
      
      {lastError && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          <div className="font-medium">Download failed:</div>
          <div className="text-xs mt-1">{lastError}</div>
          
          {countdown && countdown > 0 ? (
            <div className="mt-2 text-xs text-blue-600">
              ⏱️ Please wait {countdown} seconds before trying again...
            </div>
          ) : retryCount < 3 ? (
            <Button
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="mt-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again ({retryCount + 1}/3)
            </Button>
          ) : (
            <div className="mt-2 text-xs text-gray-600">
              Please wait a few minutes and try again, or contact support if the issue persists.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketDownloadButton;
