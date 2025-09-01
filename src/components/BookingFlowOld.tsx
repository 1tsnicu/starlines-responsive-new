// Legacy component - redirects to new BussystemBookingFlow
import BussystemBookingFlow, { type BookingResult } from './BussystemBookingFlow';
import { RouteSummary, TicketInfo } from '@/lib/bussystem';

interface BookingFlowProps {
  route: RouteSummary;
  onBack: () => void;
  onComplete: (ticket: TicketInfo) => void;
}

export function BookingFlow({ route, onBack, onComplete }: BookingFlowProps) {
  const handleComplete = (result: BookingResult) => {
    // Convert BookingResult to TicketInfo for backwards compatibility
    const ticket: TicketInfo = {
      ticket_id: result.order.order_id,
      order_id: result.order.order_id,
      status: 'confirmed',
      ...result.ticket
    };
    onComplete(ticket);
  };

  return (
    <BussystemBookingFlow
      route={route}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}

export default BookingFlow;

export function BookingFlow({ route, onBack, onComplete }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('passenger-info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Booking data
  const [passengers, setPassengers] = useState<PassengerInfo[]>([{
    first_name: '',
    last_name: '',
    phone: ''
  }]);
  
  const [currentOrder, setCurrentOrder] = useState<OrderInfo | null>(null);
  const [currentTicket, setCurrentTicket] = useState<TicketInfo | null>(null);
  const [smsCode, setSmsCode] = useState('');
  
  // Session for consistent API calls
  const [session] = useState(() => 
    `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const addPassenger = () => {
    setPassengers([...passengers, { first_name: '', last_name: '', phone: '' }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const validatePassengerInfo = () => {
    for (const passenger of passengers) {
      if (!passenger.first_name?.trim() || !passenger.last_name?.trim()) {
        return false;
      }
    }
    return true;
  };

  const handleCreateOrder = async () => {
    if (!validatePassengerInfo()) {
      setError('Vă rugăm să completați toate câmpurile obligatorii.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await newOrder({
        route_id: route.route_id!,
        date: route.date!,
        passengers,
        session,
      });

      setCurrentOrder(order);
      setCurrentStep('payment-method');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!currentOrder) return;

    setLoading(true);
    setError(null);

    try {
      const ticket = await buyTicket({
        order_id: currentOrder.order_id,
        payment_method: 'online',
        session,
      });

      setCurrentTicket(ticket);
      setCurrentStep('confirmation');
      onComplete(ticket);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnBoardFlow = async () => {
    if (!currentOrder) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Reserve validation
      await reserveValidation({
        order_id: currentOrder.order_id,
        phone: passengers[0].phone,
        session,
      });

      // Check if SMS validation is required (this depends on the operator)
      // For now, we'll assume it's required and show SMS input
      setCurrentStep('processing');
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const handleSmsValidation = async () => {
    if (!smsCode || !passengers[0].phone) return;

    setLoading(true);
    setError(null);

    try {
      await smsValidation({
        phone: passengers[0].phone,
        code: smsCode,
        session,
      });

      // Create new order after SMS validation (some operators require this)
      const newOrderAfterSms = await newOrder({
        route_id: route.route_id!,
        date: route.date!,
        passengers,
        session,
      });

      // Finalize reservation
      const reservation = await reserveTicket({
        order_id: newOrderAfterSms.order_id,
        session,
      });

      setCurrentTicket(reservation);
      setCurrentStep('confirmation');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;

    setLoading(true);
    try {
      await cancelTicket({
        order_id: currentOrder.order_id,
        session,
      });
      onBack();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const renderPassengerInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Informații călători</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {passengers.map((passenger, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Călător {index + 1}</h4>
              {passengers.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePassenger(index)}
                >
                  Elimină
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`first_name_${index}`}>Prenume *</Label>
                <Input
                  id={`first_name_${index}`}
                  value={passenger.first_name}
                  onChange={(e) => updatePassenger(index, 'first_name', e.target.value)}
                  placeholder="Prenume"
                  required
                />
              </div>
              <div>
                <Label htmlFor={`last_name_${index}`}>Nume *</Label>
                <Input
                  id={`last_name_${index}`}
                  value={passenger.last_name}
                  onChange={(e) => updatePassenger(index, 'last_name', e.target.value)}
                  placeholder="Nume"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor={`phone_${index}`}>Telefon</Label>
              <Input
                id={`phone_${index}`}
                value={passenger.phone || ''}
                onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                placeholder="+373xxxxxxxx"
                type="tel"
              />
            </div>
          </div>
        ))}

        <Button variant="outline" onClick={addPassenger} className="w-full">
          Adaugă călător
        </Button>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Înapoi
          </Button>
          <Button 
            onClick={handleCreateOrder} 
            disabled={loading || !validatePassengerInfo()}
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Continuă
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentMethod = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Metodă de plată</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentOrder && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Comanda este rezervată pentru {currentOrder.lock_min || 20} minute.
              ID comandă: {currentOrder.order_id}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div 
            className={`border rounded-lg p-4 cursor-pointer ${
              paymentMethod === 'online' ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setPaymentMethod('online')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                checked={paymentMethod === 'online'}
                onChange={() => setPaymentMethod('online')}
              />
              <div>
                <h4 className="font-medium">Plată online</h4>
                <p className="text-sm text-muted-foreground">
                  Plată imediată cu cardul bancar
                </p>
              </div>
            </div>
          </div>

          <div 
            className={`border rounded-lg p-4 cursor-pointer ${
              paymentMethod === 'pay-on-board' ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setPaymentMethod('pay-on-board')}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                checked={paymentMethod === 'pay-on-board'}
                onChange={() => setPaymentMethod('pay-on-board')}
              />
              <div>
                <h4 className="font-medium">Plată la îmbarcare</h4>
                <p className="text-sm text-muted-foreground">
                  Rezervare gratuită, plată cash în autobuz
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleCancelOrder} className="flex-1">
            Anulează
          </Button>
          <Button 
            onClick={paymentMethod === 'online' ? handleOnlinePayment : handlePayOnBoardFlow}
            disabled={loading}
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {paymentMethod === 'online' ? 'Plătește acum' : 'Rezervă'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSmsValidation = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span>Verificare telefon</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A fost trimis un cod de verificare la numărul {passengers[0].phone}.
            Vă rugăm să introduceți codul primit.
          </AlertDescription>
        </Alert>

        <div>
          <Label htmlFor="sms_code">Cod SMS</Label>
          <Input
            id="sms_code"
            value={smsCode}
            onChange={(e) => setSmsCode(e.target.value)}
            placeholder="Introduceți codul din SMS"
            maxLength={6}
          />
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleCancelOrder} className="flex-1">
            Anulează
          </Button>
          <Button 
            onClick={handleSmsValidation}
            disabled={loading || !smsCode}
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Verifică
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderConfirmation = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>Rezervare confirmată</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {paymentMethod === 'online' 
              ? 'Biletul a fost cumpărat cu succes!' 
              : 'Rezervarea a fost confirmată!'}
          </AlertDescription>
        </Alert>

        {currentTicket && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID Bilet:</span>
                <div className="font-mono">{currentTicket.ticket_id || currentTicket.order_id}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={paymentMethod === 'online' ? 'default' : 'secondary'}>
                  {paymentMethod === 'online' ? 'Plătit' : 'Rezervat'}
                </Badge>
              </div>
            </div>

            {currentOrder?.security && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const printUrl = buildPrintTicketURL({
                    order_id: currentOrder.order_id,
                    security: currentOrder.security!,
                    lang: 'ru'
                  });
                  window.open(printUrl, '_blank');
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Descarcă bilet
              </Button>
            )}
          </div>
        )}

        <Separator />

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            {paymentMethod === 'online' 
              ? 'Biletul electronic a fost trimis pe email.' 
              : 'Vă rugăm să ajungeți cu 15 minute înainte de plecare pentru plata în cash.'}
          </p>
          <p>Păstrați această confirmare ca dovadă a rezervării.</p>
        </div>

        <Button onClick={() => window.location.reload()} className="w-full">
          Rezervare nouă
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Route summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ruta selectată</h3>
              <p className="text-sm text-muted-foreground">
                {route.departure_time} - {route.arrival_time}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">{route.price} {route.currency || 'MDL'}</div>
              <div className="text-sm text-muted-foreground">per persoană</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current step */}
      {currentStep === 'passenger-info' && renderPassengerInfo()}
      {currentStep === 'payment-method' && renderPaymentMethod()}
      {currentStep === 'processing' && renderSmsValidation()}
      {currentStep === 'confirmation' && renderConfirmation()}
    </div>
  );
}
