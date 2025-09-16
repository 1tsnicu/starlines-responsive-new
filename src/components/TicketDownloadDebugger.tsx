import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { generateTicketUrl, diagnoseTicketDownload } from '@/lib/ticketDownload';
import { BookingResponse } from '@/types/tripDetail';

interface TicketDownloadDebuggerProps {
  bookingResponse: BookingResponse;
  ticketId?: number;
}

export const TicketDownloadDebugger: React.FC<TicketDownloadDebuggerProps> = ({
  bookingResponse,
  ticketId
}) => {
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDiagnose = async () => {
    if (!bookingResponse.order_id || !bookingResponse.security) {
      setDiagnosis({
        error: 'Missing order ID or security code',
        url: 'N/A'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const options = {
        orderId: bookingResponse.order_id,
        security: bookingResponse.security.toString(),
        lang: bookingResponse.lang || 'en',
        ticketId
      };

      const url = generateTicketUrl(options);
      const result = await diagnoseTicketDownload(options);
      
      setDiagnosis({
        ...result,
        url
      });
    } catch (error) {
      setDiagnosis({
        error: error instanceof Error ? error.message : 'Unknown error',
        url: 'N/A'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestDownload = () => {
    if (diagnosis?.url) {
      window.open(diagnosis.url, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Ticket Download Debugger
          <Badge variant="outline">Debug</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Order ID:</strong> {bookingResponse.order_id || 'N/A'}
          </div>
          <div>
            <strong>Security:</strong> {bookingResponse.security ? '***' + bookingResponse.security.toString().slice(-4) : 'N/A'}
          </div>
          <div>
            <strong>Language:</strong> {bookingResponse.lang || 'en'}
          </div>
          <div>
            <strong>Ticket ID:</strong> {ticketId || 'All tickets'}
          </div>
        </div>

        <Button 
          onClick={handleDiagnose} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Diagnosing...' : 'Diagnose Download Issue'}
        </Button>

        {diagnosis && (
          <div className="space-y-3">
            <Alert>
              <AlertDescription>
                <strong>Generated URL:</strong>
                <br />
                <code className="text-xs break-all">{diagnosis.url}</code>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Available:</strong> 
                <Badge variant={diagnosis.isAvailable ? 'default' : 'destructive'} className="ml-2">
                  {diagnosis.isAvailable ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <strong>Status:</strong> {diagnosis.responseStatus}
              </div>
              <div>
                <strong>Content Type:</strong> {diagnosis.contentType}
              </div>
              <div>
                <strong>Error:</strong> {diagnosis.errorMessage || 'None'}
              </div>
            </div>

            {diagnosis.isAvailable && (
              <Button onClick={handleTestDownload} className="w-full">
                Test Download in New Tab
              </Button>
            )}

            {diagnosis.errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Error Details:</strong>
                  <br />
                  {diagnosis.errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketDownloadDebugger;
