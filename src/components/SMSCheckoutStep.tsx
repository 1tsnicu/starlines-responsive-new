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
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-base sm:text-lg">Verificare Număr de Telefon</span>
          </div>
          {isRequired && <Badge variant="secondary" className="self-start sm:self-center">Obligatoriu</Badge>}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
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
              <Label htmlFor="phone" className="text-sm sm:text-base">Număr de telefon</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+40 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => onPhoneChange(e.target.value)}
                disabled={isLoading}
                className="text-base sm:text-sm"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                Veți primi un cod de verificare prin SMS
              </p>
            </div>

            {remainingAttempts < 5 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  Încercări rămase: {remainingAttempts}/5
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleSendCode} 
                disabled={isLoading || !phoneNumber}
                className="flex-1 h-11 sm:h-10"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className="text-sm sm:text-base">Trimite Cod SMS</span>
              </Button>
              {!isRequired && (
                <Button variant="outline" onClick={handleSkip} className="h-11 sm:h-10 sm:w-auto">
                  <span className="text-sm sm:text-base">Omite</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Code Verification Step */}
        {step === 'code' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm sm:text-base">Cod de verificare</Label>
              <Input
                id="code"
                placeholder="XXXX"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
                maxLength={6}
                className="text-center text-lg sm:text-base tracking-widest"
              />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Codul a fost trimis la numărul {phoneNumber}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={handleVerifyCode}
                disabled={isLoading || !verificationCode}
                className="flex-1 h-11 sm:h-10"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <span className="text-sm sm:text-base">Verifică Cod</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep('phone');
                  setVerificationCode('');
                  setError(null);
                }}
                className="h-11 sm:h-10 sm:w-auto"
              >
                <span className="text-sm sm:text-base">Înapoi</span>
              </Button>
            </div>

            <Button 
              variant="ghost" 
              onClick={handleSendCode}
              disabled={isLoading || remainingAttempts <= 0}
              className="w-full h-11 sm:h-10"
            >
              <span className="text-sm sm:text-base">Retrimite cod SMS</span>
            </Button>
          </div>
        )}

        {/* Verification Complete */}
        {step === 'verified' && (
          <div className="text-center space-y-4 py-4 sm:py-6">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-green-800">Verificare Completă!</h3>
              <p className="text-sm sm:text-base text-green-600 mt-1">
                Numărul {phoneNumber} a fost verificat cu succes
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 text-xs sm:text-sm">
              Verificat prin SMS
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
