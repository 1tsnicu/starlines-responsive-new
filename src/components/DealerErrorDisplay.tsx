import React from 'react';
import { AlertCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface DealerErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function DealerErrorDisplay({ error, onRetry, className = "" }: DealerErrorDisplayProps) {
  const isDealerError = error.toLowerCase().includes('dealer') || 
                       error.toLowerCase().includes('inactive') ||
                       error.toLowerCase().includes('dealer_no_activ');

  if (!isDealerError) {
    return null;
  }

  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-orange-800">Service Temporarily Unavailable</CardTitle>
        </div>
        <CardDescription className="text-orange-700">
          Your account needs to be activated to access the booking system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-orange-700">
          <p className="mb-2">This usually happens when:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Your dealer account hasn't been activated yet</li>
            <li>Your IP address needs to be whitelisted</li>
            <li>Your account credentials need to be verified</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-orange-800">Next Steps:</h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-orange-600" />
              <span>Contact Bussystem support:</span>
              <a 
                href="mailto:support@bussystem.eu?subject=Dealer Account Activation&body=Please activate my dealer account. Login: [YOUR_LOGIN]"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                support@bussystem.eu
              </a>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-orange-600" />
              <span>Visit their website:</span>
              <a 
                href="https://bussystem.eu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                bussystem.eu
              </a>
            </div>
          </div>
        </div>

        {onRetry && (
          <div className="pt-2">
            <Button 
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
          <strong>Note:</strong> This is a temporary issue that will be resolved once your account is activated by Bussystem support.
        </div>
      </CardContent>
    </Card>
  );
}
