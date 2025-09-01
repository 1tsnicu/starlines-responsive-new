// SMS Validation Demo component
// Shows complete SMS validation workflow integration

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Shield, CheckCircle, Phone } from 'lucide-react';

import { ReserveValidation } from './ReserveValidation';
import type { ReserveValidationResponse } from '@/types/reserveValidation';

interface SMSValidationDemoProps {
  className?: string;
}

export function SMSValidationDemo({ className = '' }: SMSValidationDemoProps) {
  const handleValidationComplete = (result: ReserveValidationResponse) => {
    console.log('✅ Validation completed:', result);
  };

  const handleCanProceed = (canProceed: boolean, phone: string) => {
    console.log(`🚀 Can proceed to reservation: ${canProceed} for ${phone}`);
  };

  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            SMS Validation System Demo
          </CardTitle>
          <CardDescription>
            Complete two-step SMS validation workflow integration with Bussystem API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Phone className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <div className="text-sm font-medium">Step 1</div>
              <div className="text-xs text-muted-foreground">Phone Validation</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <MessageSquare className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
              <div className="text-sm font-medium">Step 2</div>
              <div className="text-xs text-muted-foreground">SMS Code Sending</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <div className="text-sm font-medium">Step 3</div>
              <div className="text-xs text-muted-foreground">Code Verification</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h5 className="font-medium">Features:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">Real-time</Badge>
                Two-step SMS workflow
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">Rate Limited</Badge>
                5 SMS requests per hour
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">Cached</Badge>
                Validation result caching
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">Error Handling</Badge>
                Comprehensive error codes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Demo */}
      <ReserveValidation
        initialPhone=""
        onValidationComplete={handleValidationComplete}
        onCanProceed={handleCanProceed}
      />

      {/* Technical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
          <CardDescription>
            SMS validation system architecture and workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h5 className="font-medium mb-2">API Integration:</h5>
              <div className="text-sm space-y-1 text-muted-foreground">
                <div>• <code>POST /curl/sms_validation.php</code> - SMS API endpoint</div>
                <div>• <code>send_sms=1</code> - Request SMS code</div>
                <div>• <code>check_sms=1</code> - Verify SMS code</div>
                <div>• XML response parsing with error handling</div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Error Codes Handled:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><Badge variant="outline">dealer_no_activ</Badge> Invalid credentials</div>
                <div><Badge variant="outline">sends_limit</Badge> SMS rate limit exceeded</div>
                <div><Badge variant="outline">expired</Badge> Validation expired</div>
                <div><Badge variant="outline">validation_code</Badge> Invalid code</div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Rate Limiting:</h5>
              <div className="text-sm text-muted-foreground">
                <div>• Maximum 5 SMS requests per phone number per hour</div>
                <div>• Automatic tracking and reset</div>
                <div>• Real-time remaining attempts display</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
