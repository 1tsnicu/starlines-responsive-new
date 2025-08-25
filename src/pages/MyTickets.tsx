import { useState, useEffect } from "react";
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
import { useLocalization } from "@/contexts/LocalizationContext";
import { useAuth } from "@/contexts/AuthContext";

const MyTickets = () => {
  const { t } = useLocalization();
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("lookup");
  const [orderNumber, setOrderNumber] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const handleTicketLookup = async () => {
    if (!orderNumber.trim() || !securityCode.trim()) {
      toast({
        title: t('myTickets.missingInformation'),
        description: t('myTickets.enterBothFields'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const ticketData = await lookupTicket(orderNumber, securityCode);
      setTicket(ticketData);
      toast({
        title: t('myTickets.ticketFound'),
        description: t('myTickets.ticketRetrieved'),
      });
    } catch (error) {
      toast({
        title: t('myTickets.ticketNotFound'),
        description: t('myTickets.checkDetails'),
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
      title: t('myTickets.copied'),
      description: `${type} ${t('myTickets.copiedToClipboard')}`,
    });
  };

  const handleDownloadPDF = () => {
    if (!ticket) return;
    
    // Create PDF content
    const pdfContent = `
      STARLINES - BILET DE AUTOBUZ
      
      Numărul Comenzii: ${ticket.orderNumber}
      Codul de Securitate: ${ticket.securityCode}
      
      RUTA: ${ticket.route}
      DATA: ${ticket.date}
      ORA: ${ticket.time}
      PASAGERI: ${ticket.passengers}
      
      STATUS: ${ticket.status}
      TOTAL PLĂTIT: ${ticket.currency} ${ticket.totalPrice}
      
      IMPORTANT:
      - Prezintă acest bilet la îmbarcare
      - Să ajungi cu 30 de minute înainte de plecare
      - Biletul este valabil doar pentru data și ruta specificată
      
      Pentru asistență: +373 22 123 456
      Email: support@starlines.md
      
      Mulțumim că ai ales Starlines!
    `;
    
    // Create blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilet-${ticket.orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: t('myTickets.pdfDownloaded'),
      description: t('myTickets.pdfDownloadedDesc'),
    });
  };

  const handleEmailTicket = () => {
    if (!ticket) return;
    
    // Create email content
    const subject = encodeURIComponent(`Bilet Starlines - ${ticket.orderNumber}`);
    const body = encodeURIComponent(`
      Salut!
      
      Iată detaliile biletului tău:
      
      Numărul Comenzii: ${ticket.orderNumber}
      Codul de Securitate: ${ticket.securityCode}
      
      RUTA: ${ticket.route}
      DATA: ${ticket.date}
      ORA: ${ticket.time}
      PASAGERI: ${ticket.passengers}
      
      STATUS: ${ticket.status}
      TOTAL PLĂTIT: ${ticket.currency} ${ticket.totalPrice}
      
      IMPORTANT:
      - Prezintă acest bilet la îmbarcare
      - Să ajungi cu 30 de minute înainte de plecare
      - Biletul este valabil doar pentru data și ruta specificată
      
      Pentru asistență: +373 22 123 456
      Email: support@starlines.md
      
      Mulțumim că ai ales Starlines!
      
      Cu dragoste,
      Echipa Starlines
    `);
    
    // Open default email client
    window.open(`mailto:?subject=${subject}&body=${body}`);
    
    toast({
      title: t('myTickets.emailSent'),
      description: t('myTickets.emailSentDesc'),
    });
  };

  const generateQRCode = (data: string) => {
    // Simple QR code generation using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    canvas.width = 200;
    canvas.height = 200;
    
    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 200, 200);
    
    // Create simple QR-like pattern (simplified version)
    ctx.fillStyle = 'black';
    
    // Generate a simple pattern based on the data
    const pattern = data.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    for (let i = 0; i < 200; i += 10) {
      for (let j = 0; j < 200; j += 10) {
        if ((i + j + pattern) % 20 < 10) {
          ctx.fillRect(i, j, 8, 8);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  const handleSignIn = () => {
    setAuthMode("signin");
    setShowAuthDialog(true);
  };

  const handleCreateAccount = () => {
    setAuthMode("signup");
    setShowAuthDialog(true);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (authMode === "signin") {
        // Sign in with Supabase
        const { error } = await signIn(authForm.email, authForm.password);
        
        if (error) {
          toast({
            title: t('myTickets.signInError'),
            description: error.message || t('myTickets.invalidCredentials'),
            variant: "destructive"
          });
        } else {
          setShowAuthDialog(false);
          // Clear form
          setAuthForm({
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: ""
          });
          toast({
            title: t('myTickets.signInSuccess'),
            description: t('myTickets.welcomeBack'),
          });
        }
      } else {
        // Sign up with Supabase
        if (authForm.password !== authForm.confirmPassword) {
          toast({
            title: t('myTickets.signUpError'),
            description: t('myTickets.passwordMismatch'),
            variant: "destructive"
          });
          return;
        }

        const { error } = await signUp(authForm.email, authForm.password, authForm.firstName, authForm.lastName);
        
        if (error) {
          toast({
            title: t('myTickets.signUpError'),
            description: error.message || t('myTickets.fillAllFields'),
            variant: "destructive"
          });
        } else {
          setShowAuthDialog(false);
          // Clear form
          setAuthForm({
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: ""
          });
          toast({
            title: t('myTickets.signUpSuccess'),
            description: t('myTickets.accountCreated'),
          });
        }
      }
    } catch (error) {
      toast({
        title: t('myTickets.authError'),
        description: t('myTickets.tryAgain'),
        variant: "destructive"
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setAuthForm({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: ""
      });
      toast({
        title: t('myTickets.signOutSuccess'),
        description: t('myTickets.signedOut'),
      });
    } catch (error) {
      toast({
        title: t('myTickets.signOutError'),
        description: t('myTickets.tryAgain'),
        variant: "destructive"
      });
    }
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
            <h1 className="text-3xl font-bold text-foreground mb-2">{t('myTickets.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('myTickets.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lookup" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              {t('myTickets.lookupTab')}
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              {t('myTickets.accountTab')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lookup" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lookup Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('myTickets.findTicket')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="orderNumber">{t('myTickets.orderNumber')}</Label>
                    <Input
                      id="orderNumber"
                      placeholder={t('myTickets.orderNumberPlaceholder')}
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="securityCode">{t('myTickets.securityCode')}</Label>
                    <Input
                      id="securityCode"
                      placeholder={t('myTickets.securityCodePlaceholder')}
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
                    {loading ? t('myTickets.searching') : t('myTickets.findTicketButton')}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground text-center">
                    <p>{t('myTickets.helpText1')}</p>
                    <p>{t('myTickets.helpText2')}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Display */}
              <div>
                {ticket ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{t('myTickets.ticketDetails')}</span>
                        {getStatusBadge(ticket.status)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('myTickets.orderNumber')}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{ticket.orderNumber}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(ticket.orderNumber, t('myTickets.orderNumber'))}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('myTickets.route')}</span>
                          <span className="font-medium">{ticket.route.from.name} → {ticket.route.to.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('myTickets.date')}</span>
                          <span>{ticket.departureDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('myTickets.time')}</span>
                          <span>{ticket.route.departureTime} - {ticket.route.arrivalTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('myTickets.passengers')}</span>
                          <span>{ticket.passengers.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{t('myTickets.totalPaid')}</span>
                          <span className="font-bold text-primary">
                            {ticket.currency} {ticket.totalPrice}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button size="sm" className="gap-2 flex-1" onClick={handleDownloadPDF}>
                          <Download className="h-4 w-4" />
                          {t('myTickets.downloadPDF')}
                        </Button>
                        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 flex-1">
                              <QrCode className="h-4 w-4" />
                              {t('myTickets.showQR')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('myTickets.qrCodeTitle')}</DialogTitle>
                              <DialogDescription>
                                {t('myTickets.qrCodeDescription')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="text-center space-y-4">
                              <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center p-4">
                                {ticket && (
                                  <img 
                                    src={generateQRCode(`${ticket.orderNumber}-${ticket.securityCode}-${ticket.route}-${ticket.date}`)} 
                                    alt="QR Code" 
                                    className="w-full h-full"
                                  />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {t('myTickets.order')}: {ticket.orderNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Scanează acest QR code pentru a verifica biletul
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={handleEmailTicket}>
                          <Mail className="h-4 w-4" />
                          {t('myTickets.email')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full">
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center text-muted-foreground">
                        <Ticket className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>{t('myTickets.enterOrderDetails')}</p>
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
                  <CardTitle>{t('myTickets.accountInformation')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!isAuthenticated ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ticket className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {t('myTickets.signInMessage')}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {t('myTickets.createAccountMessage')}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={handleSignIn}>{t('myTickets.signIn')}</Button>
                        <Button variant="outline" onClick={handleCreateAccount}>{t('myTickets.createAccount')}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ticket className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {t('myTickets.welcomeMessage')}
                      </h3>
                      {user && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      )}
                      <p className="text-muted-foreground mb-4">
                        {t('myTickets.accountActive')}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={handleSignOut}>
                          {t('myTickets.signOut')}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('myTickets.recentBookings')}</CardTitle>
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
                                {ticket.passengers} {ticket.passengers === 1 ? t('myTickets.passenger') : t('myTickets.passengers')}
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
                  <CardTitle>{t('myTickets.quickActions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Download className="h-6 w-6" />
                      <span>{t('myTickets.downloadAllTickets')}</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Mail className="h-6 w-6" />
                      <span>{t('myTickets.emailAllTickets')}</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <Calendar className="h-6 w-6" />
                      <span>{t('myTickets.viewCalendar')}</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                      <ArrowRight className="h-6 w-6" />
                      <span>{t('myTickets.bookNewTrip')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Authentication Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === "signin" ? t('myTickets.signIn') : t('myTickets.createAccount')}
            </DialogTitle>
            <DialogDescription>
              {authMode === "signin" 
                ? t('myTickets.signInDescription') 
                : t('myTickets.signUpDescription')
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('myTickets.firstName')}</Label>
                    <Input
                      id="firstName"
                      value={authForm.firstName}
                      onChange={(e) => setAuthForm({...authForm, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('myTickets.lastName')}</Label>
                    <Input
                      id="lastName"
                      value={authForm.lastName}
                      onChange={(e) => setAuthForm({...authForm, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="email">{t('myTickets.email')}</Label>
              <Input
                id="email"
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">{t('myTickets.password')}</Label>
              <Input
                id="password"
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                required
              />
            </div>
            
            {authMode === "signup" && (
              <div>
                <Label htmlFor="confirmPassword">{t('myTickets.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={authForm.confirmPassword}
                  onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                  required
                />
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={formLoading}
              >
                {formLoading ? t('myTickets.processing') : (
                  authMode === "signin" ? t('myTickets.signIn') : t('myTickets.createAccount')
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAuthDialog(false)}
                disabled={formLoading}
              >
                {t('myTickets.cancel')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTickets;
