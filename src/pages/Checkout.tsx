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
  const { formatPrice } = useLocalization();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState<"idle" | "sending" | "sent" | "verifying" | "success" | "error">("idle");
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Get route and fare info from URL params
  const routeId = searchParams.get("routeId");
  const fareId = searchParams.get("fareId");
  const passengers = parseInt(searchParams.get("passengers") || "1");

  const route = routes.find(r => r.id === routeId);
  const fare = fareTypes.find(f => f.id === fareId);

  if (!route || !fare) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Invalid route or fare</h2>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: "passengers", title: "Passengers", description: "Enter passenger details" },
    { id: "contact", title: "Contact", description: "Your contact information" },
    { id: "review", title: "Review", description: "Review your booking" },
    { id: "payment", title: "Payment", description: "Complete payment" }
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
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: value }
    }));
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

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const totalPrice = (fare.price * passengers) + 2.50 - promoDiscount;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Passenger Details</h3>
              <p className="text-muted-foreground mb-6">
                Please provide the details for all passengers
              </p>
            </div>

            {formData.passengers.map((passenger, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">Passenger {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`firstName-${index}`}>First Name</Label>
                      <Input
                        id={`firstName-${index}`}
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, "firstName", e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                      <Input
                        id={`lastName-${index}`}
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, "lastName", e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dateOfBirth-${index}`}>Date of Birth</Label>
                      <Input
                        id={`dateOfBirth-${index}`}
                        type="date"
                        value={passenger.dateOfBirth}
                        onChange={(e) => handlePassengerChange(index, "dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`nationality-${index}`}>Nationality</Label>
                      <Select
                        value={passenger.nationality}
                        onValueChange={(value) => handlePassengerChange(index, "nationality", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nationality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MD">Moldova</SelectItem>
                          <SelectItem value="RO">Romania</SelectItem>
                          <SelectItem value="UA">Ukraine</SelectItem>
                          <SelectItem value="RU">Russia</SelectItem>
                          <SelectItem value="EU">Other EU</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`documentType-${index}`}>Document Type</Label>
                      <Select
                        value={passenger.documentType}
                        onValueChange={(value) => handlePassengerChange(index, "documentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="id">National ID</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`documentNumber-${index}`}>Document Number</Label>
                      <Input
                        id={`documentNumber-${index}`}
                        value={passenger.documentNumber}
                        onChange={(e) => handlePassengerChange(index, "documentNumber", e.target.value)}
                        placeholder="Enter document number"
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
              <h3 className="text-xl font-semibold text-foreground mb-4">Contact Information</h3>
              <p className="text-muted-foreground mb-6">
                We'll use this information to send you booking confirmations and updates
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => handleContactChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
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
                        placeholder="Enter phone number"
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
                      {otpStatus === "idle" && "Verify Phone Number"}
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
                          <InputOTPSlot key={index} {...slot} />
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
              <h3 className="text-xl font-semibold text-foreground mb-4">Review Your Booking</h3>
              <p className="text-muted-foreground mb-6">
                Please review all details before proceeding to payment
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trip Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Trip Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">{route.from.name} → {route.to.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">January 20, 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{route.departureTime} - {route.arrivalTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{route.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fare Type</span>
                    <span className="font-medium">{fare.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span className="font-medium">{passengers}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Price Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fare per person</span>
                    <span>{formatPrice(fare.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span>{passengers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>{formatPrice(2.50)}</span>
                  </div>
                  
                  {promoDiscount > 0 && (
                    <div className="flex items-center justify-between text-success">
                      <span>Promo discount</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle>Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handlePromoCode} disabled={!promoCode.trim()}>
                    Apply
                  </Button>
                </div>
                {promoStatus === "valid" && (
                  <p className="text-sm text-success mt-2">✓ Promo code applied successfully!</p>
                )}
                {promoStatus === "invalid" && (
                  <p className="text-sm text-destructive mt-2">✗ Invalid promo code</p>
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
                      I agree to the terms and conditions
                    </label>
                    <p className="text-sm text-muted-foreground">
                      By checking this box, you agree to our{" "}
                      <a href="/legal/terms" className="text-primary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/legal/privacy" className="text-primary hover:underline">
                        Privacy Policy
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
              <h3 className="text-xl font-semibold text-foreground mb-2">Ready for Payment</h3>
              <p className="text-muted-foreground mb-6">
                You're almost done! Click the button below to proceed to secure payment
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment powered by Stripe</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(totalPrice)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total amount to be charged
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
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
              <p className="text-muted-foreground">
                {route.from.name} → {route.to.name} • {passengers} {passengers === 1 ? "passenger" : "passengers"}
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
        <div className="max-w-4xl mx-auto mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button size="lg" className="px-8">
              Proceed to Payment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
