import React from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock, Download, QrCode, Mail, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getPaymentStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";

const PaymentStatus: React.FC = () => {
  const { formatPrice } = useLocalization();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    const checkStatus = async () => {
      if (paymentId) {
        setLoading(true);
        try {
          const paymentStatus = await getPaymentStatus(paymentId);
          setStatus(paymentStatus);
        } catch (error) {
          console.error("Error checking payment status:", error);
          setStatus("failed");
        } finally {
          setLoading(false);
        }
      }
    };

    checkStatus();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking payment status...</p>
        </div>
      </div>
    );
  }

  const renderStatusContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>

            {/* Success Message */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Payment Successful!
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your booking has been confirmed and your tickets are ready. 
                You'll receive a confirmation email shortly.
              </p>
            </div>

            {/* Booking Details */}
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Booking Confirmed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Booking Reference</span>
                  <span className="font-mono font-medium">STL-2024-001</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span>Chișinău → București</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>January 20, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-bold text-primary">{formatPrice(45.00)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2">
                <Download className="h-4 w-4" />
                Download Tickets
              </Button>
              <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <QrCode className="h-4 w-4" />
                    Show QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Your Ticket QR Code</DialogTitle>
                    <DialogDescription>
                      Show this QR code to the driver when boarding
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-center space-y-4">
                    <div className="w-48 h-48 bg-muted rounded-lg mx-auto flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-black rounded-lg mx-auto mb-2"></div>
                        <p className="text-xs text-muted-foreground">QR Code Placeholder</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Booking: STL-2024-001
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="lg" className="gap-2">
                <Mail className="h-4 w-4" />
                Send to Email
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              <p className="mb-2">
                <strong>Important:</strong> Please arrive at the bus station 30 minutes before departure.
              </p>
              <p>
                If you have any questions, contact our support team at{" "}
                <a href="tel:+37322123456" className="text-primary hover:underline">
                  +373 22 123 456
                </a>
              </p>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="text-center space-y-6">
            {/* Failed Icon */}
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>

            {/* Failed Message */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Payment Failed
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Unfortunately, your payment could not be processed. 
                Don't worry, your booking is safe and you can try again.
              </p>
            </div>

            {/* Error Details */}
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>What Happened?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Payment Declined</p>
                    <p className="text-sm text-muted-foreground">
                      Your bank or card issuer declined the transaction
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Insufficient Funds</p>
                    <p className="text-sm text-muted-foreground">
                      Your account doesn't have enough available balance
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Card Expired</p>
                    <p className="text-sm text-muted-foreground">
                      Your payment card has expired
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Checkout
              </Button>
            </div>

            {/* Alternative Payment */}
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Alternative Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>Bank Transfer</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>Cash at Station</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>Mobile Payment</span>
                  <Badge variant="outline">Available</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Support Info */}
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                Need help? Contact our support team:
              </p>
              <div className="space-y-1">
                <p>📞 <a href="tel:+37322123456" className="text-primary hover:underline">+373 22 123 456</a></p>
                <p>📧 <a href="mailto:support@starlines.md" className="text-primary hover:underline">support@starlines.md</a></p>
                <p>💬 WhatsApp: +373 22 123 456</p>
              </div>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="text-center space-y-6">
            {/* Pending Icon */}
            <div className="w-24 h-24 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-12 w-12 text-warning" />
            </div>

            {/* Pending Message */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Payment Processing
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your payment is being processed. This usually takes a few minutes. 
                Please don't close this page.
              </p>
            </div>

            {/* Status Info */}
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>What's Happening?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                  <span>Payment verification in progress</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <span>Booking confirmation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <span>Ticket generation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-muted rounded-full"></div>
                  <span>Email confirmation</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full animate-pulse" style={{ width: '25%' }}></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Estimated time: 2-5 minutes
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              <p className="mb-2">
                <strong>Note:</strong> You'll receive an email confirmation once the payment is complete.
              </p>
              <p>
                If you don't receive confirmation within 10 minutes, please contact support.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Unknown Status</h2>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment Status</h1>
              <p className="text-muted-foreground">
                {paymentId && `Payment ID: ${paymentId}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Content */}
      <div className="container py-12">
        {renderStatusContent()}
      </div>
    </div>
  );
};

export default PaymentStatus;
