import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, Mail, Phone, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Stepper from "@/components/Stepper";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { routes, fareTypes, verifyOTP, validatePromoCode } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";

const Checkout = () => {
  const { formatPrice, t } = useLocalization();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Helper function to translate fare types
  const translateFareType = (fareName: string) => {
    const fareTypeMap: Record<string, string> = {
      'Economy': t('fareType.economy'),
      'Standard': t('fareType.standard'),
      'Premium': t('fareType.premium'),
      'Business': t('fareType.business')
    };
    return fareTypeMap[fareName] || fareName;
  };
  
  // Helper function to translate month names
  const translateDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const monthMap: Record<string, string> = {
      'January': t('months.january'),
      'February': t('months.february'),
      'March': t('months.march'),
      'April': t('months.april'),
      'May': t('months.may'),
      'June': t('months.june'),
      'July': t('months.july'),
      'August': t('months.august'),
      'September': t('months.september'),
      'October': t('months.october'),
      'November': t('months.november'),
      'December': t('months.december')
    };
    const translatedMonth = monthMap[month] || month;
    return `${date.getDate()} ${translatedMonth} ${date.getFullYear()}`;
  };
  const [currentStep, setCurrentStep] = useState(0);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "success" | "error">("idle");
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string[]}>({});

  // Get route and fare info from URL params (new format from TripDetails)
  const routeId = searchParams.get("routeId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const passengers = parseInt(searchParams.get("passengers") || "1");
  const fareType = searchParams.get("fareType") || "economy";
  const price = parseFloat(searchParams.get("price") || "0");
  const departureTime = searchParams.get("departureTime");
  const arrivalTime = searchParams.get("arrivalTime");
  const duration = searchParams.get("duration");
  const operator = searchParams.get("operator");

  // Create route object from URL params
  const route = routeId && from && to ? {
    id: routeId,
    from: { name: from },
    to: { name: to },
    departureTime: departureTime || "08:00",
    arrivalTime: arrivalTime || "16:00",
    duration: duration || "8h",
    operator: operator || "Starlines"
  } : null;

  // Create fare object from URL params
  const fare = price > 0 ? {
    id: fareType,
    name: fareType.charAt(0).toUpperCase() + fareType.slice(1),
    price: price
  } : null;

  if (!route || !fare) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('tripDetails.error.routeNotFound')}</h2>
          <Button onClick={() => navigate("/search")}>{t('tripDetails.backToRoutes')}</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: "passengers", title: t('checkout.step1.title'), description: t('checkout.step1.desc') },
    { id: "contact", title: t('checkout.step2.title'), description: t('checkout.step2.desc') },
    { id: "review", title: t('checkout.step3.title'), description: t('checkout.step3.desc') },
    { id: "payment", title: t('checkout.step4.title'), description: t('checkout.step4.desc') }
  ];

  const [formData, setFormData] = useState({
    passengers: Array.from({ length: passengers }, () => ({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      documentType: "passport",
      documentNumber: ""
    })),
    contact: {
      email: "",
      phone: "",
      phonePrefix: "+373"
    }
  });

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const newPassengers = [...formData.passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setFormData(prev => ({ ...prev, passengers: newPassengers }));
    
    // Clear validation errors when user starts typing
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      setValidationErrors({});
    }
  };

  const handleOtpRequest = async () => {
    setOtpStatus("sending");
    // Simulate OTP request
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpStatus("sent");
    setOtpDialogOpen(true);
  };

  const handleOtpVerify = async () => {
    setOtpStatus("verifying");
    const isValid = await verifyOTP(formData.contact.phone, otp);
    if (isValid) {
      setOtpStatus("success");
      setTimeout(() => setOtpDialogOpen(false), 1500);
    } else {
      setOtpStatus("error");
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setPromoStatus("validating");
    const result = await validatePromoCode(promoCode);
    
    if (result.valid) {
      setPromoStatus("valid");
      setPromoDiscount(result.discount);
    } else {
      setPromoStatus("invalid");
      setPromoDiscount(0);
    }
  };

  // Validation functions for each step (without setting state to avoid infinite loops)
  const validatePassengerDetails = () => {
    return formData.passengers.every(passenger => 
      passenger.firstName.trim() !== '' &&
      passenger.lastName.trim() !== '' &&
      passenger.dateOfBirth !== '' &&
      passenger.nationality !== '' &&
      passenger.documentNumber.trim() !== ''
    );
  };

  const validateContactInfo = () => {
    return formData.contact.email.trim() !== '' && 
           formData.contact.phone.trim() !== '';
  };

  const validateTerms = () => {
    // This would be a checkbox state, but for now we'll assume it's always true
    // You can add a termsAccepted state if needed
    return true;
  };

  // Separate functions to set validation errors when needed
  const setPassengerValidationErrors = () => {
    const errors: {[key: string]: string[]} = {};
    
    formData.passengers.forEach((passenger, index) => {
      const passengerErrors: string[] = [];
      
      if (passenger.firstName.trim() === '') {
        passengerErrors.push(t('checkout.validation.firstNameRequired'));
      }
      if (passenger.lastName.trim() === '') {
        passengerErrors.push(t('checkout.validation.lastNameRequired'));
      }
      if (passenger.dateOfBirth === '') {
        passengerErrors.push(t('checkout.validation.dateOfBirthRequired'));
      }
      if (passenger.nationality === '') {
        passengerErrors.push(t('checkout.validation.nationalityRequired'));
      }
      if (passenger.documentNumber.trim() === '') {
        passengerErrors.push(t('checkout.validation.documentNumberRequired'));
      }
      
      if (passengerErrors.length > 0) {
        errors[`passenger-${index}`] = passengerErrors;
      }
    });
    
    setValidationErrors(errors);
  };

  const setContactValidationErrors = () => {
    const errors: {[key: string]: string[]} = {};
    
    if (formData.contact.email.trim() === '') {
      errors.email = [t('checkout.validation.emailRequired')];
    }
    if (formData.contact.phone.trim() === '') {
      errors.phone = [t('checkout.validation.phoneRequired')];
    }
    
    setValidationErrors(errors);
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: // Passenger Details
        return validatePassengerDetails();
      case 1: // Contact Info
        return validateContactInfo();
      case 2: // Review
        return validateTerms();
      case 3: // Payment
        return true; // Always can proceed from payment
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (canProceedToNextStep()) {
        setCurrentStep(currentStep + 1);
        // Clear validation errors when moving to next step
        setValidationErrors({});
      } else {
        // Set validation errors for current step only when user tries to proceed
        switch (currentStep) {
          case 0: // Passenger Details
            setPassengerValidationErrors();
            break;
          case 1: // Contact Info
            setContactValidationErrors();
            break;
          case 2: // Review
            // Terms validation is always true for now
            break;
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { convertCurrency } = useLocalization();
  const totalPrice = (fare.price * passengers) + 2.50 - promoDiscount;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('checkout.passengerDetails.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('checkout.passengerDetails.desc')}
              </p>
            </div>

            {formData.passengers.map((passenger, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{t('checkout.passengerDetails.passenger')} {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`firstName-${index}`}>{t('checkout.passengerDetails.firstName')}</Label>
                      <Input
                        id={`firstName-${index}`}
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, "firstName", e.target.value)}
                        placeholder={t('checkout.passengerDetails.firstNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`lastName-${index}`}>{t('checkout.passengerDetails.lastName')}</Label>
                      <Input
                        id={`lastName-${index}`}
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, "lastName", e.target.value)}
                        placeholder={t('checkout.passengerDetails.lastNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dateOfBirth-${index}`}>{t('checkout.passengerDetails.dateOfBirth')}</Label>
                      <Input
                        id={`dateOfBirth-${index}`}
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) => handlePassengerChange(index, "dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`nationality-${index}`}>{t('checkout.passengerDetails.nationality')}</Label>
                      <Select
                        value={passenger.nationality}
                        onValueChange={(value) => handlePassengerChange(index, "nationality", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('checkout.passengerDetails.nationalityPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MD">{t('countries.md')}</SelectItem>
                          <SelectItem value="RO">{t('countries.ro')}</SelectItem>
                          <SelectItem value="UA">{t('countries.ua')}</SelectItem>
                          <SelectItem value="RU">{t('countries.ru')}</SelectItem>
                          <SelectItem value="EU">{t('countries.eu')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`documentType-${index}`}>{t('checkout.passengerDetails.documentType')}</Label>
                      <Select
                        value={passenger.documentType}
                        onValueChange={(value) => handlePassengerChange(index, "documentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">{t('checkout.passengerDetails.documentType.passport')}</SelectItem>
                          <SelectItem value="id">National ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`documentNumber-${index}`}>{t('checkout.passengerDetails.documentNumber')}</Label>
                      <Input
                        id={`documentNumber-${index}`}
                        value={passenger.documentNumber}
                        onChange={(e) => handlePassengerChange(index, "documentNumber", e.target.value)}
                        placeholder={t('checkout.passengerDetails.documentNumberPlaceholder')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('checkout.contact.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('checkout.contact.desc')}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t('checkout.contact.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => handleContactChange("email", e.target.value)}
                      placeholder={t('checkout.contact.emailPlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('checkout.contact.phone')}</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.contact.phonePrefix}
                        onValueChange={(value) => handleContactChange("phonePrefix", value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+373">+373</SelectItem>
                          <SelectItem value="+40">+40</SelectItem>
                          <SelectItem value="+380">+380</SelectItem>
                          <SelectItem value="+7">+7</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.contact.phone}
                        onChange={(e) => handleContactChange("phone", e.target.value)}
                        placeholder={t('checkout.contact.phonePlaceholder')}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleOtpRequest}
                      disabled={otpStatus === "sending" || !formData.contact.phone}
                      className="w-full"
                    >
                      {otpStatus === "sending" && "Sending..."}
                      {otpStatus === "sent" && "OTP Sent ✓"}
                      {otpStatus === "idle" && t('checkout.contact.verifyPhone')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OTP Dialog */}
            <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verify Your Phone Number</DialogTitle>
                  <DialogDescription>
                    Enter the 6-digit code sent to {formData.contact.phonePrefix} {formData.contact.phone}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    render={({ slots }) => (
                      <InputOTPGroup className="gap-2">
                        {slots.map((slot, index) => (
                          <InputOTPSlot key={index} index={index} {...slot} />
                        ))}
                      </InputOTPGroup>
                    )}
                  />
                  
                  {otpStatus === "error" && (
                    <p className="text-sm text-destructive text-center">
                      Invalid code. Please try again.
                    </p>
                  )}
                  
                  {otpStatus === "success" && (
                    <div className="flex items-center justify-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span>Phone number verified successfully!</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setOtpDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleOtpVerify}
                      disabled={otp.length !== 6 || otpStatus === "verifying"}
                      className="flex-1"
                    >
                      {otpStatus === "verifying" ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t('checkout.review.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('checkout.review.desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trip Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('checkout.review.tripSummary.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.tripSummary.route')}</span>
                    <span className="font-medium">{route.from.name} → {route.to.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.tripSummary.date')}</span>
                    <span className="font-medium">{date ? translateDate(date) : translateDate(new Date().toISOString().split('T')[0])}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.tripSummary.time')}</span>
                    <span className="font-medium">{route.departureTime} - {route.arrivalTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.tripSummary.duration')}</span>
                    <span className="font-medium">{route.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.tripSummary.fareType')}</span>
                    <span className="font-medium">{translateFareType(fare.name)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.tripSummary.passengers')}</span>
                    <span className="font-medium">{passengers}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('checkout.review.priceBreakdown.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.priceBreakdown.farePerPerson')}</span>
                    <span>{formatPrice(fare.price, undefined, 'EUR')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.priceBreakdown.passengers')}</span>
                    <span>{passengers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('checkout.review.priceBreakdown.serviceFee')}</span>
                    <span>{formatPrice(2.50, undefined, 'EUR')}</span>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <div className="flex items-center justify-between text-success">
                      <span>{t('checkout.review.promoCode.discount')}</span>
                      <span>-{formatPrice(promoDiscount, undefined, 'EUR')}</span>
                    </div>
                  )}
                  
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>{t('checkout.review.priceBreakdown.total')}</span>
                    <span className="text-primary">{formatPrice(totalPrice, undefined, 'EUR')}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.review.promoCode.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('checkout.review.promoCode.placeholder')}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handlePromoCode} disabled={!promoCode.trim()}>
                    {t('checkout.review.promoCode.apply')}
                  </Button>
                </div>
                {promoStatus === "valid" && (
                  <p className="text-sm text-success mt-2">{t('checkout.review.promoCode.success')}</p>
                )}
                {promoStatus === "invalid" && (
                  <p className="text-sm text-destructive mt-2">{t('checkout.review.promoCode.error')}</p>
                )}
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {t('checkout.terms.agree')}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {t('checkout.terms.description')}{" "}
                      <a href="/legal/terms" className="text-primary hover:underline">
                        {t('checkout.terms.termsOfService')}
                      </a>{" "}
                      {t('checkout.terms.and')}{" "}
                      <a href="/legal/privacy" className="text-primary hover:underline">
                        {t('checkout.terms.privacyPolicy')}
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('checkout.payment.ready.title')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('checkout.payment.ready.desc')}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{t('checkout.payment.secure')}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(totalPrice, undefined, 'EUR')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('checkout.payment.totalAmount')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('checkout.back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('checkout.title')}</h1>
              <p className="text-muted-foreground">
                {route.from.name} → {route.to.name} • {passengers} {passengers === 1 ? t('checkout.passenger') : t('checkout.passengers')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stepper */}
        <div className="mb-8">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-8">
          {/* Validation Error Message - Only show when user tries to proceed */}
          {validationErrors && Object.keys(validationErrors).length > 0 && currentStep < steps.length - 1 && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive text-center">
                {t('checkout.validation.completeAllFields')}
              </p>
            </div>
          )}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('checkout.payment.previous')}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
                className={!canProceedToNextStep() ? "opacity-50 cursor-not-allowed" : ""}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button size="lg" className="px-8">
                {t('checkout.payment.proceed')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
