/**
 * BOOKING FORM COMPONENT
 * 
 * Component for collecting passenger and contact information for booking
 * Handles form validation and data submission
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  PassengerData, 
  BookingRequest, 
  BookingResponse,
  BookingSummary
} from '@/types/tripDetail';
import { 
  apiCreateBooking, 
  validateBookingData, 
  formatBookingPrice 
} from '@/lib/tripDetailApi';

export interface BookingFormProps {
  passengers: number;
  isRoundTrip: boolean;
  bookingSummary: BookingSummary;
  preparedBookingRequest: BookingRequest | null;
  onBookingSuccess: (response: BookingResponse) => void;
  onBookingError: (error: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  passengers,
  isRoundTrip,
  bookingSummary,
  preparedBookingRequest,
  onBookingSuccess,
  onBookingError
}) => {
  const [passengerData, setPassengerData] = useState<PassengerData[]>(() => 
    Array.from({ length: passengers }, () => ({
      name: '',
      surname: '',
      birth_date: '',
      phone: '',
      email: ''
    }))
  );

  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: ''
  });

  const [promocode, setPromocode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updatePassengerData = (index: number, field: keyof PassengerData, value: string) => {
    setPassengerData(prev => prev.map((passenger, i) => 
      i === index ? { ...passenger, [field]: value } : passenger
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const errors: string[] = [];
    
    passengerData.forEach((passenger, index) => {
      if (!passenger.name.trim()) errors.push(`Passenger ${index + 1}: Name is required`);
      if (!passenger.surname.trim()) errors.push(`Passenger ${index + 1}: Surname is required`);
      if (!passenger.birth_date) errors.push(`Passenger ${index + 1}: Birth date is required`);
    });

    if (!contactInfo.phone.trim()) errors.push('Phone number is required');
    if (!contactInfo.email.trim()) errors.push('Email address is required');

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Check if we have a prepared booking request
      if (!preparedBookingRequest) {
        setValidationErrors(['Booking data is not ready. Please ensure you have selected seats for your trip.']);
        setIsSubmitting(false);
        return;
      }

      // Update the prepared request with form data
      const bookingRequest: BookingRequest = {
        ...preparedBookingRequest,
        name: passengerData.map(p => p.name),
        surname: passengerData.map(p => p.surname),
        birth_date: passengerData.map(p => p.birth_date),
        phone: contactInfo.phone,
        email: contactInfo.email,
      };

      // Note: Promocode handling would need to be implemented separately
      // as it's not in the standard new_order API documentation

      // Validate request
      const validationErrors = validateBookingData(bookingRequest);
      if (validationErrors.length > 0) {
        setValidationErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting booking request:', bookingRequest);

      // Submit booking
      const response = await apiCreateBooking(bookingRequest);
      onBookingSuccess(response);

    } catch (error) {
      console.error('Booking error:', error);
      onBookingError(error instanceof Error ? error.message : 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Complete Your Booking
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please provide passenger and contact information to complete your reservation
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Passenger Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Passenger Information
            </h3>
            
            {passengerData.map((passenger, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Passenger {index + 1}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${index}`}>First Name *</Label>
                    <Input
                      id={`name-${index}`}
                      value={passenger.name}
                      onChange={(e) => updatePassengerData(index, 'name', e.target.value)}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`surname-${index}`}>Last Name *</Label>
                    <Input
                      id={`surname-${index}`}
                      value={passenger.surname}
                      onChange={(e) => updatePassengerData(index, 'surname', e.target.value)}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`birth-${index}`}>Birth Date *</Label>
                    <Input
                      id={`birth-${index}`}
                      type="date"
                      value={passenger.birth_date}
                      onChange={(e) => updatePassengerData(index, 'birth_date', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+375291234567"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="info@test-mail.ru"
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Promocode */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Promocode (Optional)
            </h3>
            
            <div>
              <Label htmlFor="promocode">Promocode</Label>
              <Input
                id="promocode"
                value={promocode}
                onChange={(e) => setPromocode(e.target.value)}
                placeholder="Enter promocode"
              />
            </div>
          </div>

          <Separator />

          {/* Booking Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Booking Summary</h3>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Passengers:</span>
                <span>{passengers}</span>
              </div>
              <div className="flex justify-between">
                <span>Trips:</span>
                <span>{isRoundTrip ? 'Round Trip' : 'One Way'}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Price:</span>
                <span className="font-bold">{formatBookingPrice(bookingSummary.totalPrice, bookingSummary.currency)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Booking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Booking
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
