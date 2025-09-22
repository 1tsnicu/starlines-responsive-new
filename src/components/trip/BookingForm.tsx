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
import { useLocalization } from '@/contexts/LocalizationContext';

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
  const { t } = useLocalization();
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

  // Validation functions
  const validateBirthDate = (birthDate: string): boolean => {
    if (!birthDate) return false;
    
    const date = new Date(birthDate);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()); // Max 120 years old
    const maxDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()); // Min 1 year old
    
    return date >= minDate && date <= maxDate && !isNaN(date.getTime());
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone.trim()) return false;
    
    // Phone must start with +373 or +383 or any other + country code
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.trim());
  };

  // Check if form is valid for submission
  const isFormValid = (): boolean => {
    // Check if all required fields are filled and valid
    const hasValidPassengers = passengerData.every(passenger => 
      Boolean(passenger.name.trim()) && 
      Boolean(passenger.surname.trim()) && 
      Boolean(passenger.birth_date) && 
      validateBirthDate(passenger.birth_date)
    );

    const hasValidContact = Boolean(contactInfo.phone.trim()) && 
                           validatePhoneNumber(contactInfo.phone) && 
                           Boolean(contactInfo.email.trim());

    return hasValidPassengers && hasValidContact;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    const errors: string[] = [];
    
    passengerData.forEach((passenger, index) => {
      if (!passenger.name.trim()) errors.push(`${t('bookingForm.passenger')} ${index + 1}: ${t('bookingForm.validation.nameRequired')}`);
      if (!passenger.surname.trim()) errors.push(`${t('bookingForm.passenger')} ${index + 1}: ${t('bookingForm.validation.surnameRequired')}`);
      
      // Enhanced birth date validation
      if (!passenger.birth_date) {
        errors.push(`${t('bookingForm.passenger')} ${index + 1}: ${t('bookingForm.validation.birthDateRequired')}`);
      } else if (!validateBirthDate(passenger.birth_date)) {
        errors.push(`${t('bookingForm.passenger')} ${index + 1}: ${t('bookingForm.validation.birthDateInvalid')}`);
      }
      
      // Document validation based on route requirements
      if (route?.need_doc === 1 || true) {
        if (!passenger.document_type?.trim()) errors.push(`${t('bookingForm.passenger')} ${index + 1}: ${t('bookingForm.validation.documentTypeRequired')}`);
        if (!passenger.document_number?.trim()) errors.push(`${t('bookingForm.passenger')} ${index + 1}: ${t('bookingForm.validation.documentNumberRequired')}`);
      }
      
      if ((route?.need_gender === 1 || true) && !passenger.gender?.trim()) {
        errors.push(`${t('bookingForm.passenger')} ${index + 1}: ${t('bookingForm.validation.genderRequired')}`);
      }
      
      if ((route?.need_citizenship === 1 || true) && !passenger.citizenship?.trim()) {
        errors.push(`${t('bookingForm.passenger')} ${index + 1}: ${t('bookingForm.validation.citizenshipRequired')}`);
      }
    });

    // Enhanced phone validation
    if (!contactInfo.phone.trim()) {
      errors.push(t('bookingForm.validation.phoneRequired'));
    } else if (!validatePhoneNumber(contactInfo.phone)) {
      errors.push(t('bookingForm.validation.phoneInvalid'));
    }
    
    if (!contactInfo.email.trim()) errors.push(t('bookingForm.validation.emailRequired'));

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Check if we have a prepared booking request
      if (!preparedBookingRequest) {
        setValidationErrors([t('bookingForm.errors.dataNotReady')]);
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
      onBookingError(error instanceof Error ? error.message : t('bookingForm.errors.bookingFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {t('bookingForm.completeYourBooking')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('bookingForm.providePassengerInfo')}
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
              {t('bookingForm.passengerInformation')}
            </h3>
            
            {passengerData.map((passenger, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t('bookingForm.passenger')} {index + 1}</Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${index}`}>{t('bookingForm.firstName')} *</Label>
                    <Input
                      id={`name-${index}`}
                      value={passenger.name}
                      onChange={(e) => updatePassengerData(index, 'name', e.target.value)}
                      placeholder={t('bookingForm.placeholders.firstName')}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`surname-${index}`}>{t('bookingForm.lastName')} *</Label>
                    <Input
                      id={`surname-${index}`}
                      value={passenger.surname}
                      onChange={(e) => updatePassengerData(index, 'surname', e.target.value)}
                      placeholder={t('bookingForm.placeholders.lastName')}
                      required
                    />
                  </div>
                  
                  <div className="lg:col-span-2">
                    <Label htmlFor={`birth-${index}`}>{t('bookingForm.birthDate')} *</Label>
                    <Input
                      id={`birth-${index}`}
                      type="date"
                      value={passenger.birth_date}
                      onChange={(e) => updatePassengerData(index, 'birth_date', e.target.value)}
                      required
                      className={!validateBirthDate(passenger.birth_date) && passenger.birth_date ? 'border-red-500' : ''}
                    />
                    {passenger.birth_date && !validateBirthDate(passenger.birth_date) && (
                      <p className="text-sm text-red-500 mt-1">
                        {t('bookingForm.validation.birthDateInvalid')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Document Information - Show if required by route */}
                {(route?.need_doc === 1 || true) && (
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-gray-700">{t('bookingForm.documentInformation')}</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`docType-${index}`}>{t('bookingForm.documentType')} *</Label>
                        <Select 
                          value={passenger.document_type || ''} 
                          onValueChange={(value) => updatePassengerData(index, 'document_type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('bookingForm.placeholders.selectDocumentType')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passport">{t('bookingForm.documentTypes.passport')}</SelectItem>
                            <SelectItem value="id_card">{t('bookingForm.documentTypes.idCard')}</SelectItem>
                            <SelectItem value="birth_certificate">{t('bookingForm.documentTypes.birthCertificate')}</SelectItem>
                            <SelectItem value="drivers_license">{t('bookingForm.documentTypes.driversLicense')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`docNumber-${index}`}>{t('bookingForm.documentNumber')} *</Label>
                        <Input
                          id={`docNumber-${index}`}
                          value={passenger.document_number || ''}
                          onChange={(e) => updatePassengerData(index, 'document_number', e.target.value)}
                          placeholder={t('bookingForm.placeholders.documentNumber')}
                          required
                        />
                      </div>
                      
                      {route?.need_doc_expire_date === 1 && (
                        <div>
                          <Label htmlFor={`docExpire-${index}`}>{t('bookingForm.documentExpiryDate')}</Label>
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
                    <Label htmlFor={`gender-${index}`}>{t('bookingForm.gender')} *</Label>
                    <Select 
                      value={passenger.gender || ''} 
                      onValueChange={(value) => updatePassengerData(index, 'gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('bookingForm.placeholders.selectGender')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">{t('bookingForm.genders.male')}</SelectItem>
                        <SelectItem value="F">{t('bookingForm.genders.female')}</SelectItem>
                        <SelectItem value="O">{t('bookingForm.genders.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Citizenship - Show if required by route */}
                {(route?.need_citizenship === 1 || true) && (
                  <div>
                    <Label htmlFor={`citizenship-${index}`}>{t('bookingForm.citizenship')} *</Label>
                    <Input
                      id={`citizenship-${index}`}
                      value={passenger.citizenship || ''}
                      onChange={(e) => updatePassengerData(index, 'citizenship', e.target.value)}
                      placeholder={t('bookingForm.placeholders.citizenship')}
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
              {t('bookingForm.contactInformation')}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">{t('bookingForm.phoneNumber')} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t('bookingForm.placeholders.phone')}
                  required
                  className={!validatePhoneNumber(contactInfo.phone) && contactInfo.phone ? 'border-red-500' : ''}
                />
                {contactInfo.phone && !validatePhoneNumber(contactInfo.phone) && (
                  <p className="text-sm text-red-500 mt-1">
                    {t('bookingForm.validation.phoneInvalid')}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">{t('bookingForm.emailAddress')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('bookingForm.placeholders.email')}
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
              {t('bookingForm.promocodeOptional')}
            </h3>
            
            <div>
              <Label htmlFor="promocode">{t('bookingForm.promocode')}</Label>
              <Input
                id="promocode"
                value={promocode}
                onChange={(e) => setPromocode(e.target.value)}
                placeholder={t('bookingForm.placeholders.promocode')}
              />
            </div>
          </div>

          <Separator />

          {/* Booking Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('bookingForm.bookingSummary')}</h3>
            
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>{t('bookingForm.passengers')}:</span>
                <span>{passengers}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('bookingForm.trips')}:</span>
                <span>{isRoundTrip ? t('bookingForm.roundTrip') : t('bookingForm.oneWay')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('bookingForm.totalPrice')}:</span>
                <span className="font-bold">{formatBookingPrice(bookingSummary.totalPrice, bookingSummary.currency)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('bookingForm.processingBooking')}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('bookingForm.completeBooking')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
