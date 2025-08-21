import { useState } from "react";
import { Search, Download, QrCode, Mail, Copy, ArrowRight, Ticket, Calendar, MapPin, Clock, Bus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { lookupTicket } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MyTickets = () => {
  const [activeTab, setActiveTab] = useState("lookup");
  const [orderNumber, setOrderNumber] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleTicketLookup = async () => {
    if (!orderNumber.trim() || !securityCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both order number and security code.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const ticketData = await lookupTicket(orderNumber, securityCode);
      setTicket(ticketData);
      toast({
        title: "Ticket Found",
        description: "Your ticket has been retrieved successfully.",
      });
    } catch (error) {
      toast({
        title: "Ticket Not Found",
        description: "Please check your order number and security code.",
        variant: "destructive"
      });
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} has been copied to clipboard.`,
    });
  };

  const mockTickets = [
    {
      id: "1",
      orderNumber: "STL-2024-001",
      route: "Chișinău → București",
      date: "January 20, 2024",
      time: "08:00 - 16:30",
      status: "confirmed",
      passengers: 1,
      totalPrice: 45,
      currency: "EUR"
    },
    {
      id: "2",
      orderNumber: "STL-2024-002",
      route: "Chișinău → Istanbul",
      date: "January 25, 2024",
      time: "20:00 - 18:15",
      status: "upcoming",
      passengers: 2,
      totalPrice: 178,
      currency: "EUR"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-success">Confirmed</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Tickets</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Look up your tickets, download PDFs, and manage your bookings
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lookup" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Look Up Ticket
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              My Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lookup" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lookup Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Find Your Ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      placeholder="e.g., STL-2024-001"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="securityCode">Security Code</Label>
                    <Input
                      id="securityCode"
                      placeholder="Enter security code"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                      type="password"
                    />
                  </div>
                  <Button 
                    onClick={handleTicketLookup} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Searching..." : "Find Ticket"}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground text-center">
                    <p>Don't have your details?</p>
                    <p>Check your confirmation email or contact support</p>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Display */}
              <div>
                {ticket ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Ticket Details</span>
                        {getStatusBadge(ticket.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Order Number</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{ticket.orderNumber}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(ticket.orderNumber, "Order number")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Route</span>
                          <span className="font-medium">{ticket.route.from.name} → {ticket.route.to.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span>{ticket.departureDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Time</span>
                          <span>{ticket.route.departureTime} - {ticket.route.arrivalTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Passengers</span>
                          <span>{ticket.passengers.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total Paid</span>
                          <span className="font-bold text-primary">
                            {ticket.currency} {ticket.totalPrice}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button size="sm" className="gap-2 flex-1">
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 flex-1">
                              <QrCode className="h-4 w-4" />
                              Show QR
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
                                Order: {ticket.orderNumber}
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="gap-2 flex-1">
                          <Mail className="h-4 w-4" />
                          Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full">
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center text-muted-foreground">
                        <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Enter your order details to find your ticket</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-8">
            <div className="space-y-6">
              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ticket className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Sign in to access your tickets
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create an account or sign in to view all your bookings and tickets
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button>Sign In</Button>
                      <Button variant="outline">Create Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Bus className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{ticket.route}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {ticket.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {ticket.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {ticket.passengers} {ticket.passengers === 1 ? "passenger" : "passengers"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">{getStatusBadge(ticket.status)}</div>
                          <div className="text-sm text-muted-foreground">
                            {ticket.currency} {ticket.totalPrice}
                          </div>
                          <Button variant="ghost" size="sm" className="mt-2">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Download className="h-6 w-6" />
                      <span>Download All Tickets</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Mail className="h-6 w-6" />
                      <span>Email All Tickets</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Calendar className="h-6 w-6" />
                      <span>View Calendar</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <ArrowRight className="h-6 w-6" />
                      <span>Book New Trip</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyTickets;
