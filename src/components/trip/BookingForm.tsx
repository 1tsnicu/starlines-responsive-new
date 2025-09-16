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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  BookingSummary,
  RouteItem
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
  route?: RouteItem; // Route information for field requirements
  onBookingSuccess: (response: BookingResponse) => void;
  onBookingError: (error: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  passengers,
  isRoundTrip,
  bookingSummary,
  preparedBookingRequest,
  route,
  onBookingSuccess,
  onBookingError
}) => {
  // Debug logging
  console.log('BookingForm - route data:', route);
  console.log('BookingForm - need_doc:', route?.need_doc);
  console.log('BookingForm - need_gender:', route?.need_gender);
  console.log('BookingForm - need_citizenship:', route?.need_citizenship);
  const [passengerData, setPassengerData] = useState<PassengerData[]>(() => 
    Array.from({ length: passengers }, () => ({
      name: '',
      surname: '',
      birth_date: '',
      phone: '',
      email: '',
      document_type: '',
      document_number: '',
      document_expire_date: '',
      citizenship: '',
      gender: ''
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
      
      // Document validation based on route requirements
      if (route?.need_doc === 1 || true) {
        if (!passenger.document_type?.trim()) errors.push(`Passenger ${index + 1}: Document type is required`);
        if (!passenger.document_number?.trim()) errors.push(`Passenger ${index + 1}: Document number is required`);
      }
      
      if ((route?.need_gender === 1 || true) && !passenger.gender?.trim()) {
        errors.push(`Passenger ${index + 1}: Gender is required`);
      }
      
      if ((route?.need_citizenship === 1 || true) && !passenger.citizenship?.trim()) {
        errors.push(`Passenger ${index + 1}: Citizenship is required`);
      }
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
        // Include document fields if required
        ...((route?.need_doc === 1 || true) && {
          doc_type: passengerData.map(p => {
            // Map document type strings to numbers
            switch(p.document_type) {
              case 'passport': return 1;
              case 'id_card': return 2;
              case 'birth_certificate': return 3;
              case 'drivers_license': return 4;
              default: return 1; // Default to passport
            }
          }),
          doc_number: passengerData.map(p => p.document_number || ''),
          ...(route?.need_doc_expire_date === 1 && {
            doc_expire_date: passengerData.map(p => p.document_expire_date || '')
          })
        }),
        ...((route?.need_gender === 1 || true) && {
          gender: passengerData.map(p => p.gender || '')
        }),
        ...((route?.need_citizenship === 1 || true) && {
          citizenship: passengerData.map(p => p.citizenship || '')
        })
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

                {/* Document Information - Show if required by route */}
                {(route?.need_doc === 1 || true) && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">Document Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`docType-${index}`}>Document Type *</Label>
                        <Select 
                          value={passenger.document_type || ''} 
                          onValueChange={(value) => updatePassengerData(index, 'document_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="id_card">ID Card</SelectItem>
                            <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`docNumber-${index}`}>Document Number *</Label>
                        <Input
                          id={`docNumber-${index}`}
                          value={passenger.document_number || ''}
                          onChange={(e) => updatePassengerData(index, 'document_number', e.target.value)}
                          placeholder="Enter document number"
                          required
                        />
                      </div>
                      
                      {route?.need_doc_expire_date === 1 && (
                        <div>
                          <Label htmlFor={`docExpire-${index}`}>Document Expiry Date</Label>
                          <Input
                            id={`docExpire-${index}`}
                            type="date"
                            value={passenger.document_expire_date || ''}
                            onChange={(e) => updatePassengerData(index, 'document_expire_date', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Gender - Show if required by route */}
                {(route?.need_gender === 1 || true) && (
                  <div>
                    <Label htmlFor={`gender-${index}`}>Gender *</Label>
                    <Select 
                      value={passenger.gender || ''} 
                      onValueChange={(value) => updatePassengerData(index, 'gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                        <SelectItem value="O">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Citizenship - Show if required by route */}
                {(route?.need_citizenship === 1 || true) && (
                  <div>
                    <Label htmlFor={`citizenship-${index}`}>Citizenship *</Label>
                    <Input
                      id={`citizenship-${index}`}
                      value={passenger.citizenship || ''}
                      onChange={(e) => updatePassengerData(index, 'citizenship', e.target.value)}
                      placeholder="Enter citizenship (e.g., US, UK, DE)"
                      required
                    />
                  </div>
                )}
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
