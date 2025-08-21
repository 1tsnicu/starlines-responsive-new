import React from "react";
import { RotateCcw, Clock, CreditCard, AlertTriangle, CheckCircle, FileText, Calendar, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";

const RefundPolicy: React.FC = () => {
  const { formatPrice } = useLocalization();
  const sections = [
    {
      id: "overview",
      title: "1. Refund Policy Overview",
      icon: RotateCcw,
      content: `This Refund Policy outlines the terms and conditions for cancellations and refunds of bus tickets purchased through Starlines. We aim to provide fair and transparent refund terms while maintaining operational efficiency. Refund eligibility depends on the timing of cancellation and ticket type.`
    },
    {
      id: "cancellation-timeframes",
      title: "2. Cancellation Timeframes",
      icon: Clock,
      content: `Refund eligibility is based on when you cancel your booking: More than 24 hours before departure (Full refund minus processing fee), 12-24 hours before departure (75% refund), 2-12 hours before departure (50% refund), Less than 2 hours before departure (No refund), No-show (No refund).`
    },
    {
      id: "refund-processing",
      title: "3. Refund Processing",
      icon: CreditCard,
      content: `Approved refunds are processed within 7-10 business days to the original payment method. Processing fees of ${formatPrice(2)}-${formatPrice(5)} may apply depending on the payment method and cancellation timing. Refunds for cash payments are processed as bank transfers or vouchers.`
    },
    {
      id: "non-refundable",
      title: "4. Non-Refundable Situations",
      icon: AlertTriangle,
      content: `Certain situations are not eligible for refunds: No-shows without prior notification, cancellations due to passenger misconduct, promotional or discounted tickets (unless specified), tickets purchased with vouchers or credits, force majeure events beyond our control.`
    },
    {
      id: "exceptions",
      title: "5. Special Circumstances",
      icon: CheckCircle,
      content: `We may provide exceptions for: Medical emergencies (with valid documentation), Death in family (with death certificate), Military deployment (with official orders), Natural disasters affecting travel, Service cancellations by Starlines (full refund including fees).`
    },
    {
      id: "process",
      title: "6. How to Request a Refund",
      content: `To request a refund: Log into your account and find your booking, click "Cancel Booking" or "Request Refund", provide reason for cancellation, submit required documentation (if applicable), await confirmation email with refund details.`
    }
  ];

  const refundScenarios = [
    {
      scenario: "Standard Cancellation",
      timeframe: "> 24 hours before",
      refundAmount: "100% minus processing fee",
      processingFee: `${formatPrice(2)}-${formatPrice(5)}`,
      color: "text-green-600 bg-green-50"
    },
    {
      scenario: "Late Cancellation",
      timeframe: "12-24 hours before", 
      refundAmount: "75% of ticket price",
      processingFee: `${formatPrice(2)}-${formatPrice(5)}`,
      color: "text-yellow-600 bg-yellow-50"
    },
    {
      scenario: "Very Late Cancellation",
      timeframe: "2-12 hours before",
      refundAmount: "50% of ticket price", 
      processingFee: `${formatPrice(2)}-${formatPrice(5)}`,
      color: "text-orange-600 bg-orange-50"
    },
    {
      scenario: "Last Minute / No-Show",
      timeframe: "< 2 hours before",
      refundAmount: "No refund",
      processingFee: "N/A",
      color: "text-red-600 bg-red-50"
    }
  ];

  const documentationRequired = [
    { situation: "Medical Emergency", documents: ["Medical certificate", "Doctor's note", "Hospital discharge papers"] },
    { situation: "Death in Family", documents: ["Death certificate", "Proof of relationship", "Official documentation"] },
    { situation: "Military Deployment", documents: ["Official deployment orders", "Military ID", "Command authorization"] },
    { situation: "Natural Disaster", documents: ["News reports", "Official evacuation orders", "Government advisories"] }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <RotateCcw className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Refund & Cancellation Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Understand our refund terms and cancellation procedures. We strive to provide 
              fair and transparent refund policies for all our passengers.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last updated: January 1, 2024
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Version 1.2
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Refund Scenarios */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Refund Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {refundScenarios.map((scenario) => (
              <Card key={scenario.scenario} className="border-border">
                <CardContent className="p-4">
                  <div className={`p-2 rounded-lg mb-3 ${scenario.color}`}>
                    <h4 className="font-semibold text-sm">{scenario.scenario}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Timeframe: </span>
                      <span className="text-muted-foreground">{scenario.timeframe}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Refund: </span>
                      <span className="text-muted-foreground">{scenario.refundAmount}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Fee: </span>
                      <span className="text-muted-foreground">{scenario.processingFee}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-muted"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Policy Content */}
        <div className="space-y-8 mb-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} id={section.id} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                    {Icon && <Icon className="h-6 w-6 text-primary" />}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Documentation Requirements */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documentation for Special Circumstances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentationRequired.map((item) => (
                <div key={item.situation}>
                  <h4 className="font-semibold text-foreground mb-3">{item.situation}</h4>
                  <ul className="space-y-2">
                    {item.documents.map((doc) => (
                      <li key={doc} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> All documentation must be official and verifiable. 
                Photocopies or digital copies are acceptable for initial review, but original documents may be required.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Refund Process */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Refund Processing Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Credit Cards</h4>
                <p className="text-sm text-muted-foreground">3-5 business days</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Bank Transfers</h4>
                <p className="text-sm text-muted-foreground">5-7 business days</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Cash Payments</h4>
                <p className="text-sm text-muted-foreground">7-10 business days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Refunds */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Need Help with Your Refund?
            </h3>
            <p className="text-muted-foreground mb-6">
              Our customer service team is ready to assist you with cancellations and refund requests.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button variant="default">
                <Phone className="h-4 w-4 mr-2" />
                Call Customer Service
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Submit Refund Request
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Phone: <span className="font-medium text-primary">+373 22 123 456</span></p>
              <p>Email: <span className="font-medium text-primary">refunds@starlines.md</span></p>
              <p>Hours: Monday-Friday 8:00 AM - 8:00 PM</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;

