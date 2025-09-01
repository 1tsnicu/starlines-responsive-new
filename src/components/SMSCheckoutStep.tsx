// Practical SMS Integration Component
// For real checkout/booking flows with SMS validation

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { sendSMSCode, verifySMSCode, getRemainingMSAttempts } from '@/lib/smsValidationHttp';
import type { SMSValidationApiResponse } from '@/types/smsValidation';

interface SMSCheckoutStepProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onValidationComplete: (isValid: boolean, phone: string) => void;
  sidGuest: string;
  isRequired?: boolean;
  onSkip?: () => void;
  className?: string;
}

export function SMSCheckoutStep({
  phoneNumber,
  onPhoneChange,
  onValidationComplete,
  sidGuest,
  isRequired = false,
  onSkip,
  className = ''
}: SMSCheckoutStepProps) {
  const [step, setStep] = useState<'phone' | 'code' | 'verified'>('phone');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Vă rugăm introduceți un număr de telefon valid');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: SMSValidationApiResponse = await sendSMSCode(sidGuest, phoneNumber);
      
      if (response.success) {
        setStep('code');
        setRemainingAttempts(getRemainingMSAttempts(phoneNumber));
      } else {
        setError(response.error?.error || 'Eroare la trimiterea codului SMS');
      }
    } catch (err) {
      setError('Eroare de conexiune. Vă rugăm încercați din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError('Vă rugăm introduceți codul de verificare');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response: SMSValidationApiResponse = await verifySMSCode(
        sidGuest, 
        phoneNumber, 
        verificationCode
      );
      
      if (response.success) {
        setStep('verified');
        onValidationComplete(true, phoneNumber);
      } else {
        setError(response.error?.error || 'Cod de verificare incorect');
        // Reset code input for retry
        setVerificationCode('');
      }
    } catch (err) {
      setError('Eroare de conexiune. Vă rugăm încercați din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      onValidationComplete(false, phoneNumber);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Verificare Număr de Telefon
          {isRequired && <Badge variant="secondary">Obligatoriu</Badge>}
        </CardTitle>
        <CardDescription>
          {step === 'phone' && 'Introduceți numărul de telefon pentru verificare prin SMS'}
          {step === 'code' && 'Introduceți codul de verificare primit prin SMS'}
          {step === 'verified' && 'Numărul de telefon a fost verificat cu succes'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Input Step */}
        {step === 'phone' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Număr de telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+40 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => onPhoneChange(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Veți primi un cod de verificare prin SMS
              </p>
            </div>

            {remainingAttempts < 5 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Încercări rămase: {remainingAttempts}/5
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSendCode} 
                disabled={isLoading || !phoneNumber}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Trimite Cod SMS
              </Button>
              {!isRequired && (
                <Button variant="outline" onClick={handleSkip}>
                  Omite
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Code Verification Step */}
        {step === 'code' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Cod de verificare</Label>
              <Input
                id="code"
                placeholder="XXXX"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground">
                Codul a fost trimis la numărul {phoneNumber}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyCode}
                disabled={isLoading || !verificationCode}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verifică Cod
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('phone');
                  setVerificationCode('');
                  setError(null);
                }}
              >
                Înapoi
              </Button>
            </div>

            <Button 
              variant="ghost" 
              onClick={handleSendCode}
              disabled={isLoading || remainingAttempts <= 0}
              className="w-full"
            >
              Retrimite cod SMS
            </Button>
          </div>
        )}

        {/* Verification Complete */}
        {step === 'verified' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Verificare Completă!</h3>
              <p className="text-sm text-green-600">
                Numărul {phoneNumber} a fost verificat cu succes
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Verificat prin SMS
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
