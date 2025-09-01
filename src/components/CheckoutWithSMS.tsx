// Real Checkout Example with SMS Integration
// Shows how to integrate SMS validation in a real booking flow

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  User, 
  Phone, 
  CheckCircle, 
  Clock,
  MapPin,
  Calendar
} from 'lucide-react';

import { SMSCheckoutStep } from '@/components/SMSCheckoutStep';
import { OrderLookup } from '@/components/OrderLookup';

// Simulate a real checkout flow
export function CheckoutWithSMS() {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSMSValidated, setIsSMSValidated] = useState(false);
  const [bookingData, setBookingData] = useState({
    route: 'București → Cluj-Napoca',
    date: '2024-09-15',
    time: '08:30',
    passengers: 2,
    total: 150,
    currency: 'RON'
  });

  // Mock session ID - in real app this would come from auth context
  const sidGuest = 'demo-session-12345';

  const steps = [
    { id: 1, title: 'Detalii Pasageri', icon: User },
    { id: 2, title: 'Verificare Telefon', icon: Phone },
    { id: 3, title: 'Plată', icon: CreditCard },
    { id: 4, title: 'Confirmare', icon: CheckCircle }
  ];

  const handleSMSValidation = (isValid: boolean, phone: string) => {
    setIsSMSValidated(isValid);
    if (isValid) {
      setPhoneNumber(phone);
      // Auto-advance to payment step
      setTimeout(() => setStep(3), 1000);
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const progressValue = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Finalizare Rezervare
          </CardTitle>
          <CardDescription>
            {bookingData.route} • {bookingData.date} • {bookingData.time}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progres rezervare</span>
              <span className="text-sm text-muted-foreground">
                Pasul {step} din {steps.length}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
            
            {/* Steps */}
            <div className="flex justify-between">
              {steps.map((stepItem, index) => {
                const StepIcon = stepItem.icon;
                const isActive = step === stepItem.id;
                const isCompleted = step > stepItem.id;
                
                return (
                  <div key={stepItem.id} className="flex flex-col items-center">
                    <div className={`
                      rounded-full p-2 border-2 transition-colors
                      ${isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isActive 
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }
                    `}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className={`
                      text-xs mt-1 text-center
                      ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}
                    `}>
                      {stepItem.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Passenger Details */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Detalii Pasageri</CardTitle>
                <CardDescription>
                  Introduceți informațiile pentru toți pasagerii
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Demo - Pasageri pre-completați</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>1. Ion Popescu</span>
                      <Badge variant="outline">Adult</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Maria Popescu</span>
                      <Badge variant="outline">Adult</Badge>
                    </div>
                  </div>
                </div>
                
                <Button onClick={() => setStep(2)} className="w-full">
                  Continuă la Verificare Telefon
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: SMS Validation */}
          {step === 2 && (
            <SMSCheckoutStep
              phoneNumber={phoneNumber}
              onPhoneChange={setPhoneNumber}
              onValidationComplete={handleSMSValidation}
              sidGuest={sidGuest}
              isRequired={true}
            />
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Opțiuni de Plată
                </CardTitle>
                <CardDescription>
                  Alegeți metoda de plată dorită
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSMSValidated && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Telefon verificat: {phoneNumber}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button className="w-full h-12 text-left justify-start" variant="outline">
                    <CreditCard className="mr-3 h-5 w-5" />
                    Card de Credit/Debit
                  </Button>
                  <Button className="w-full h-12 text-left justify-start" variant="outline">
                    <Phone className="mr-3 h-5 w-5" />
                    SMS/Mobile Payment
                  </Button>
                </div>

                <Button onClick={() => setStep(4)} className="w-full">
                  Finalizează Plata
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  Rezervare Confirmată!
                </CardTitle>
                <CardDescription className="text-center">
                  Biletele au fost trimise pe email și SMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-lg font-semibold">Comandă #1026449</div>
                  <Badge className="bg-green-50 text-green-700">Confirmată</Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email confirmare:</span>
                    <span>ion.popescu@email.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SMS trimis la:</span>
                    <span>{phoneNumber}</span>
                  </div>
                </div>

                <Button onClick={() => setStep(1)} variant="outline" className="w-full">
                  Rezervare Nouă
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rezumat Rezervare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{bookingData.route}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{bookingData.date} • {bookingData.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{bookingData.passengers} pasageri</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Bilete ({bookingData.passengers}x)</span>
                  <span>{bookingData.currency} {bookingData.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa procesare</span>
                  <span>{bookingData.currency} 5</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{bookingData.currency} {bookingData.total + 5}</span>
                </div>
              </div>

              {step >= 2 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Status Verificare:</div>
                    <div className="flex items-center gap-2">
                      {isSMSValidated ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-700">SMS verificat</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-700">În așteptare SMS</span>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Order Lookup for Support */}
          {step >= 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Căutare Rapidă</CardTitle>
                <CardDescription>
                  Pentru suport sau modificări
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderLookup 
                  defaultOrderId="1026449"
                  showFullDetails={false}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
