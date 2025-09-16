// src/components/BussystemBookingFlow.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NewOrderErrorDisplay } from './NewOrderErrorDisplay';
import Stepper from '@/components/Stepper';
import { RouteSummary, PassengerInfo, OrderInfo, buyTicket, reserveValidation, smsValidation, reserveTicket, buildPrintTicketURL } from '@/lib/bussystem';
import { newOrder } from '@/lib/bussystem';
import type { NewOrderPayload, NewOrderResponse } from '@/types/newOrder';
import { validatePhoneNumber } from '@/lib/phoneValidation';
import { Clock, CreditCard, Smartphone, Download, ArrowLeft } from 'lucide-react';

interface BookingResult {
  type: 'online_payment' | 'pay_on_board';
  ticket?: Record<string, unknown>;
  reservation?: Record<string, unknown>;
  order: OrderInfo;
  printUrl?: string;
  message?: string;
}

interface BussystemBookingFlowProps {
  route: RouteSummary;
  onBack: () => void;
  onComplete: (result: BookingResult) => void;
}

interface FormErrors {
  [key: string]: string;
}

// Step 1: Passenger Information Form
function PassengerForm({ 
  route, 
  passengers, 
  setPassengers, 
  errors 
}: { 
  route: RouteSummary;
  passengers: PassengerInfo[];
  setPassengers: (passengers: PassengerInfo[]) => void;
  errors: FormErrors;
}) {
  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const addPassenger = () => {
    setPassengers([...passengers, { first_name: '', last_name: '' }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Информация о пассажирах</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Маршрут: {route.point_from} → {route.point_to} ({route.date_from}, {route.time_from})
        </p>
      </div>

      {passengers.map((passenger, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-base flex justify-between items-center">
              Пассажир {index + 1}
              {passengers.length > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => removePassenger(index)}
                >
                  Удалить
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`firstName-${index}`}>Имя *</Label>
                <Input
                  id={`firstName-${index}`}
                  value={passenger.first_name}
                  onChange={(e) => updatePassenger(index, 'first_name', e.target.value)}
                  placeholder="Иван"
                  className={errors[`firstName-${index}`] ? 'border-red-500' : ''}
                />
                {errors[`firstName-${index}`] && (
                  <p className="text-sm text-red-500 mt-1">{errors[`firstName-${index}`]}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor={`lastName-${index}`}>Фамилия *</Label>
                <Input
                  id={`lastName-${index}`}
                  value={passenger.last_name}
                  onChange={(e) => updatePassenger(index, 'last_name', e.target.value)}
                  placeholder="Петров"
                  className={errors[`lastName-${index}`] ? 'border-red-500' : ''}
                />
                {errors[`lastName-${index}`] && (
                  <p className="text-sm text-red-500 mt-1">{errors[`lastName-${index}`]}</p>
                )}
              </div>
            </div>

            {route.need_middlename === 1 && (
              <div>
                <Label htmlFor={`middleName-${index}`}>Отчество</Label>
                <Input
                  id={`middleName-${index}`}
                  value={passenger.document_number || ''}
                  onChange={(e) => updatePassenger(index, 'document_number', e.target.value)}
                  placeholder="Иванович"
                />
              </div>
            )}

            {route.need_birth === 1 && (
              <div>
                <Label htmlFor={`birthDate-${index}`}>Дата рождения *</Label>
                <Input
                  id={`birthDate-${index}`}
                  type="date"
                  value={passenger.birth_date || ''}
                  onChange={(e) => updatePassenger(index, 'birth_date', e.target.value)}
                  className={errors[`birthDate-${index}`] ? 'border-red-500' : ''}
                />
                {errors[`birthDate-${index}`] && (
                  <p className="text-sm text-red-500 mt-1">{errors[`birthDate-${index}`]}</p>
                )}
              </div>
            )}

            {route.need_gender === 1 && (
              <div>
                <Label htmlFor={`gender-${index}`}>Пол *</Label>
                <Select 
                  value={passenger.gender || ''} 
                  onValueChange={(value) => updatePassenger(index, 'gender', value)}
                >
                  <SelectTrigger className={errors[`gender-${index}`] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Выберите пол" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Мужской</SelectItem>
                    <SelectItem value="F">Женский</SelectItem>
                  </SelectContent>
                </Select>
                {errors[`gender-${index}`] && (
                  <p className="text-sm text-red-500 mt-1">{errors[`gender-${index}`]}</p>
                )}
              </div>
            )}

            {route.need_doc === 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`docType-${index}`}>Тип документа *</Label>
                  <Select 
                    value={passenger.document_type || ''} 
                    onValueChange={(value) => updatePassenger(index, 'document_type', value)}
                  >
                    <SelectTrigger className={errors[`docType-${index}`] ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passport">Паспорт</SelectItem>
                      <SelectItem value="id_card">ID карта</SelectItem>
                      <SelectItem value="birth_certificate">Свидетельство о рождении</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors[`docType-${index}`] && (
                    <p className="text-sm text-red-500 mt-1">{errors[`docType-${index}`]}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor={`docNumber-${index}`}>Номер документа *</Label>
                  <Input
                    id={`docNumber-${index}`}
                    value={passenger.document_number || ''}
                    onChange={(e) => updatePassenger(index, 'document_number', e.target.value)}
                    placeholder="1234567890"
                    className={errors[`docNumber-${index}`] ? 'border-red-500' : ''}
                  />
                  {errors[`docNumber-${index}`] && (
                    <p className="text-sm text-red-500 mt-1">{errors[`docNumber-${index}`]}</p>
                  )}
                </div>
              </div>
            )}

            {route.need_citizenship === 1 && (
              <div>
                <Label htmlFor={`citizenship-${index}`}>Гражданство *</Label>
                <Input
                  id={`citizenship-${index}`}
                  value={passenger.document_number || ''}
                  onChange={(e) => updatePassenger(index, 'document_number', e.target.value)}
                  placeholder="Молдова"
                  className={errors[`citizenship-${index}`] ? 'border-red-500' : ''}
                />
                {errors[`citizenship-${index}`] && (
                  <p className="text-sm text-red-500 mt-1">{errors[`citizenship-${index}`]}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor={`phone-${index}`}>Телефон {index === 0 ? '*' : ''}</Label>
              <Input
                id={`phone-${index}`}
                value={passenger.phone || ''}
                onChange={(e) => {
                  let value = e.target.value;
                  // Auto-add + if user starts typing digits
                  if (value && !value.startsWith('+') && /^\d/.test(value)) {
                    value = '+' + value;
                  }
                  updatePassenger(index, 'phone', value);
                }}
                placeholder="+373 60 123 456"
                className={errors[`phone-${index}`] ? 'border-red-500' : ''}
              />
              {errors[`phone-${index}`] && (
                <p className="text-sm text-red-500 mt-1">{errors[`phone-${index}`]}</p>
              )}
              {index === 0 && !errors[`phone-${index}`] && passenger.phone && (
                <p className="text-xs text-muted-foreground mt-1">
                  Пример: +373 60 123 456, +40 721 234 567
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {parseInt(route.max_seats || '10') > passengers.length && (
        <Button 
          variant="outline" 
          onClick={addPassenger}
          className="w-full"
        >
          Добавить пассажира
        </Button>
      )}
    </div>
  );
}

// Step 2: Payment Method Selection
function PaymentMethodSelection({ 
  onPaymentMethodSelect 
}: { 
  onPaymentMethodSelect: (method: 'online' | 'onboard') => void 
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Способ оплаты</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6" onClick={() => onPaymentMethodSelect('online')}>
            <div className="flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Онлайн оплата</h4>
                <p className="text-sm text-muted-foreground">
                  Оплата картой сразу после бронирования
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6" onClick={() => onPaymentMethodSelect('onboard')}>
            <div className="flex items-center space-x-3">
              <Smartphone className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Оплата в автобусе</h4>
                <p className="text-sm text-muted-foreground">
                  Резервация с подтверждением по SMS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main booking flow component
export function BussystemBookingFlow({ route, onBack, onComplete }: BussystemBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([
    { first_name: '', last_name: '' }
  ]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'onboard' | null>(null);
  const [smsCode, setSmsCode] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Timer for order lock
  useEffect(() => {
    if (order && route.lock_min && timeLeft === null) {
      setTimeLeft(parseInt(route.lock_min) * 60);
    }
  }, [order, route.lock_min, timeLeft]);

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validatePassengers = () => {
    const newErrors: FormErrors = {};
    let isValid = true;

    passengers.forEach((passenger, index) => {
      if (!passenger.first_name.trim()) {
        newErrors[`firstName-${index}`] = 'Обязательное поле';
        isValid = false;
      }
      if (!passenger.last_name.trim()) {
        newErrors[`lastName-${index}`] = 'Обязательное поле';
        isValid = false;
      }
      if (index === 0 && !passenger.phone?.trim()) {
        newErrors[`phone-${index}`] = 'Телефон основного пассажира обязателен';
        isValid = false;
      } else if (index === 0 && passenger.phone?.trim()) {
        // Validate phone number format
        const phoneValidation = validatePhoneNumber(passenger.phone);
        if (!phoneValidation.isValid) {
          newErrors[`phone-${index}`] = phoneValidation.error || 'Неверный формат номера телефона';
          isValid = false;
        }
      }
      if (route.need_birth === 1 && !passenger.birth_date) {
        newErrors[`birthDate-${index}`] = 'Обязательное поле';
        isValid = false;
      }
      if (route.need_gender === 1 && !passenger.gender) {
        newErrors[`gender-${index}`] = 'Обязательное поле';
        isValid = false;
      }
      if (route.need_doc === 1) {
        if (!passenger.document_type) {
          newErrors[`docType-${index}`] = 'Обязательное поле';
          isValid = false;
        }
        if (!passenger.document_number?.trim()) {
          newErrors[`docNumber-${index}`] = 'Обязательное поле';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handlePassengerSubmit = async () => {
    if (!validatePassengers()) return;

    setLoading(true);
    try {
      // Build new_order payload
      const payload: NewOrderPayload = {
        date: [route.date_from], // Array of dates
        interval_id: [route.interval_id], // Array of interval IDs
        seat: [passengers.map((_, index) => String(index + 1))], // Simple seat assignment
        name: passengers.map(p => p.first_name || ''),
        surname: passengers.map(p => p.last_name || ''),
        phone: passengers[0]?.phone || '',
        email: '', // Default email since PassengerInfo doesn't have email
        currency: "EUR",
        lang: "ro"
      };
      
      const orderResult = await newOrder(payload);
      
      // Convert NewOrderResponse to OrderInfo
      const orderInfo: OrderInfo = {
        order_id: String(orderResult.order_id), // Convert number to string
        security: orderResult.security,
        status: orderResult.status,
        price: orderResult.price_total,
        currency: orderResult.currency,
        passengers: passengers
      };
      
      setOrder(orderInfo);
      setCurrentStep(2);
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethod = (method: 'online' | 'onboard') => {
    setPaymentMethod(method);
    if (method === 'online') {
      setCurrentStep(3);
    } else {
      setCurrentStep(4); // SMS validation step
    }
  };

  const handleOnlinePayment = async () => {
    if (!order) return;

    setLoading(true);
    try {
      const ticket = await buyTicket({
        order_id: Number(order.order_id), // Convert string to number
        lang: 'ro',
        v: '1.1'
      });
      
      onComplete({
        type: 'online_payment',
        ticket: ticket as Record<string, unknown>,
        order,
        printUrl: buildPrintTicketURL({
          order_id: order.order_id,
          security: order.security || '',
          lang: 'ru'
        })
      });
    } catch (error) {
      setErrors({ payment: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleSmsValidation = async () => {
    if (!order || !passengers[0]?.phone || !smsCode) return;

    setLoading(true);
    try {
      await smsValidation({
        phone: passengers[0].phone,
        code: smsCode,
      });
      
      const reservation = await reserveTicket({
        order_id: order.order_id,
      });
      
      onComplete({
        type: 'pay_on_board',
        reservation,
        order,
        message: 'Места зарезервированы. Оплатите водителю при посадке.'
      });
    } catch (error) {
      setErrors({ sms: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const sendSmsCode = async () => {
    if (!order || !passengers[0]?.phone) return;

    setLoading(true);
    try {
      await reserveValidation({
        order_id: order.order_id,
        phone: passengers[0].phone,
      });
      // SMS should be sent automatically
    } catch (error) {
      setErrors({ sms: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'passengers', number: 1, title: 'Пассажиры', description: 'Информация о пассажирах' },
    { id: 'payment', number: 2, title: 'Оплата', description: 'Способ оплаты' },
    { id: 'confirmation', number: 3, title: 'Подтверждение', description: 'Завершение бронирования' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Бронирование билета</h2>
          {timeLeft && timeLeft > 0 && (
            <div className="flex items-center space-x-2 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>Резервация истекает через: {formatTime(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <Stepper steps={steps} currentStep={currentStep} />

      {/* Error display */}
      {errors.general && (
        <NewOrderErrorDisplay 
          error={errors.general} 
          onRetry={() => {
            setErrors({});
            if (currentStep === 2) {
              handlePassengerSubmit();
            }
          }}
        />
      )}

      {/* Step content */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <PassengerForm 
            route={route}
            passengers={passengers}
            setPassengers={setPassengers}
            errors={errors}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handlePassengerSubmit}
              disabled={loading}
            >
              {loading ? 'Создание заказа...' : 'Продолжить'}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <PaymentMethodSelection onPaymentMethodSelect={handlePaymentMethod} />
        </div>
      )}

      {currentStep === 3 && paymentMethod === 'online' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Онлайн оплата</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    К оплате: {route.price_one_way} {route.currency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    За {passengers.length} пассажир(ов)
                  </p>
                </div>
                
                {errors.payment && (
                  <Alert>
                    <AlertDescription>{errors.payment}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleOnlinePayment}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Обработка платежа...' : 'Оплатить сейчас'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 4 && paymentMethod === 'onboard' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Подтверждение по SMS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  SMS код будет отправлен на номер: {passengers[0]?.phone}
                </p>
                
                <Button 
                  onClick={sendSmsCode}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? 'Отправка...' : 'Отправить SMS код'}
                </Button>
                
                <div>
                  <Label htmlFor="smsCode">SMS код</Label>
                  <Input
                    id="smsCode"
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value)}
                    placeholder="Введите код из SMS"
                    className={errors.sms ? 'border-red-500' : ''}
                  />
                  {errors.sms && (
                    <p className="text-sm text-red-500 mt-1">{errors.sms}</p>
                  )}
                </div>
                
                <Button 
                  onClick={handleSmsValidation}
                  disabled={loading || !smsCode}
                  className="w-full"
                >
                  {loading ? 'Подтверждение...' : 'Подтвердить резервацию'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default BussystemBookingFlow;
export type { BookingResult };
