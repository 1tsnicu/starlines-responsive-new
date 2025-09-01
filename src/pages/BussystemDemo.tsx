// src/pages/BussystemDemo.tsx
import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BussystemAutocomplete } from '@/components/BussystemAutocomplete';
import { BussystemRouteResults } from '@/components/BussystemRouteResults';
import BussystemBookingFlow, { type BookingResult } from '@/components/BussystemBookingFlow';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BussPoint, RouteSummary, useRouteSearch, ping } from '@/lib/bussystem';
import { Search, MapPin, Calendar, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';

type DemoStep = 'search' | 'results' | 'booking' | 'complete';

interface SearchParams {
  fromPoint: BussPoint | null;
  toPoint: BussPoint | null;
  date: string;
}

export default function BussystemDemo() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('search');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    fromPoint: null,
    toPoint: null,
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedRoute, setSelectedRoute] = useState<RouteSummary | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'testing' | 'connected' | 'error'>('unknown');

  // Use the route search hook
  const { 
    data: routes, 
    loading: routesLoading, 
    error: routesError 
  } = useRouteSearch({
    id_from: searchParams.fromPoint?.point_id,
    id_to: searchParams.toPoint?.point_id,
    date: searchParams.date,
    trans: 'bus',
    change: 'auto',
    currency: 'EUR',
    lang: 'ru',
  });

  // Test API connectivity
  const testApiConnection = async () => {
    setApiStatus('testing');
    try {
      await ping();
      setApiStatus('connected');
    } catch (error) {
      // dealer_no_activ is actually a success - means API works but account needs activation
      if (error instanceof Error && error.message === 'dealer_no_activ') {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
      console.error('API connection test failed:', error);
    }
  };

  const handleSearch = () => {
    if (searchParams.fromPoint && searchParams.toPoint && searchParams.date) {
      setCurrentStep('results');
    }
  };

  const handleRouteSelect = (route: RouteSummary) => {
    setSelectedRoute(route);
    setCurrentStep('booking');
  };

  const handleBookingComplete = (result: BookingResult) => {
    setBookingResult(result);
    setCurrentStep('complete');
  };

  const resetDemo = () => {
    setCurrentStep('search');
    setSearchParams({
      fromPoint: null,
      toPoint: null,
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedRoute(null);
    setBookingResult(null);
  };

  // Quick search presets for demo
  const quickSearches = [
    {
      name: 'Прага → Киев',
      from: { point_id: '3', point_ru_name: 'Прага', point_latin_name: 'Prague' },
      to: { point_id: '6', point_ru_name: 'Киев', point_latin_name: 'Kiev' },
    },
    {
      name: 'Кишинев → Бухарест',
      from: { point_id: '1', point_ru_name: 'Кишинев', point_latin_name: 'Chisinau' },
      to: { point_id: '2', point_ru_name: 'Бухарест', point_latin_name: 'Bucharest' },
    },
  ];

  const setQuickSearch = (preset: typeof quickSearches[0]) => {
    setSearchParams({
      ...searchParams,
      fromPoint: preset.from as BussPoint,
      toPoint: preset.to as BussPoint,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Bussystem API Demo"
        description="Полная интеграция с Bussystem API для бронирования автобусных билетов"
      />

      {/* API Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Статус API</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={testApiConnection}
              disabled={apiStatus === 'testing'}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${apiStatus === 'testing' ? 'animate-spin' : ''}`} />
              Тест подключения
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={
                apiStatus === 'connected' ? 'default' : 
                apiStatus === 'error' ? 'destructive' : 
                'secondary'
              }
            >
              {apiStatus === 'unknown' && 'Не протестировано'}
              {apiStatus === 'testing' && 'Тестирование...'}
              {apiStatus === 'connected' && 'Подключено'}
              {apiStatus === 'error' && 'Ошибка подключения'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {apiStatus === 'connected' && 'API доступен, но dealer_no_activ - нужна активация аккаунта'}
              {apiStatus === 'error' && 'Проверьте настройки в .env.local'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Demo Steps Navigation */}
      <div className="flex items-center space-x-2 mb-6">
        {['search', 'results', 'booking', 'complete'].map((step, index) => (
          <React.Fragment key={step}>
            <Badge 
              variant={currentStep === step ? 'default' : 'outline'}
              className="px-3 py-1"
            >
              {index + 1}. {step === 'search' && 'Поиск'}
              {step === 'results' && 'Результаты'}
              {step === 'booking' && 'Бронирование'}
              {step === 'complete' && 'Завершено'}
            </Badge>
            {index < 3 && <span className="text-muted-foreground">→</span>}
          </React.Fragment>
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetDemo}
          className="ml-4"
        >
          Сбросить демо
        </Button>
      </div>

      {/* Step 1: Search Form */}
      {currentStep === 'search' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Поиск автобусных маршрутов</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick presets */}
              <div>
                <Label className="text-sm font-medium">Быстрый поиск:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickSearches.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuickSearch(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* From Point */}
                <div>
                  <Label htmlFor="from">Откуда</Label>
                  <BussystemAutocomplete
                    placeholder="Выберите город отправления"
                    onSelect={(point) => setSearchParams({...searchParams, fromPoint: point})}
                    value={searchParams.fromPoint?.point_ru_name || searchParams.fromPoint?.point_latin_name || ''}
                  />
                  {searchParams.fromPoint && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {searchParams.fromPoint.point_id}
                    </p>
                  )}
                </div>

                {/* To Point */}
                <div>
                  <Label htmlFor="to">Куда</Label>
                  <BussystemAutocomplete
                    placeholder="Выберите город назначения"
                    onSelect={(point) => setSearchParams({...searchParams, toPoint: point})}
                    value={searchParams.toPoint?.point_ru_name || searchParams.toPoint?.point_latin_name || ''}
                  />
                  {searchParams.toPoint && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {searchParams.toPoint.point_id}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <Label htmlFor="date">Дата поездки</Label>
                  <Input
                    id="date"
                    type="date"
                    value={searchParams.date}
                    onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Параметры запроса:</strong> trans=bus, change=auto, currency=EUR, lang=ru
                  <br />
                  <strong>Лимит API:</strong> Максимум ~100 поисков на 1 оплаченную поездку
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSearch}
                disabled={!searchParams.fromPoint || !searchParams.toPoint || !searchParams.date}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Найти маршруты
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Search Results */}
      {currentStep === 'results' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Результаты поиска</span>
                </div>
                <Button variant="outline" onClick={() => setCurrentStep('search')}>
                  Изменить поиск
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    <strong>Маршрут:</strong> {searchParams.fromPoint?.point_ru_name} → {searchParams.toPoint?.point_ru_name}
                  </span>
                  <span>
                    <strong>Дата:</strong> {searchParams.date}
                  </span>
                </div>
              </div>

              <BussystemRouteResults
                routes={routes}
                loading={routesLoading}
                error={routesError}
                onRouteSelect={handleRouteSelect}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Booking Flow */}
      {currentStep === 'booking' && selectedRoute && (
        <BussystemBookingFlow
          route={selectedRoute}
          onBack={() => setCurrentStep('results')}
          onComplete={handleBookingComplete}
        />
      )}

      {/* Step 4: Booking Complete */}
      {currentStep === 'complete' && bookingResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Бронирование завершено!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">Детали бронирования:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Тип:</strong> {bookingResult.type === 'online_payment' ? 'Онлайн оплата' : 'Оплата в автобусе'}</div>
                  <div><strong>ID заказа:</strong> {bookingResult.order?.order_id}</div>
                  {bookingResult.order?.security && (
                    <div><strong>Код безопасности:</strong> {bookingResult.order.security}</div>
                  )}
                  {bookingResult.message && (
                    <div><strong>Сообщение:</strong> {bookingResult.message}</div>
                  )}
                </div>
              </div>

              {bookingResult.printUrl && (
                <Button 
                  onClick={() => window.open(bookingResult.printUrl, '_blank')}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Открыть билет для печати
                </Button>
              )}

              <div className="flex space-x-4">
                <Button variant="outline" onClick={resetDemo} className="flex-1">
                  Новый поиск
                </Button>
                <Button onClick={() => setCurrentStep('search')} className="flex-1">
                  Вернуться к поиску
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Developer Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Информация для разработчиков</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Статус реализации:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✅ Полный API клиент (20+ endpoints)</li>
                <li>✅ Автокомплит городов</li>
                <li>✅ Поиск маршрутов</li>
                <li>✅ Просмотр доступных мест</li>
                <li>✅ Создание заказов</li>
                <li>✅ Онлайн оплата и Pay-on-board</li>
                <li>✅ SMS валидация</li>
                <li>✅ Печать билетов</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Технические детали:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><strong>API:</strong> test-api.bussystem.eu</li>
                <li><strong>Формат:</strong> JSON (Accept: application/json)</li>
                <li><strong>TypeScript:</strong> Полная типизация</li>
                <li><strong>React Hooks:</strong> Debounced search, caching</li>
                <li><strong>Error Handling:</strong> Graceful error recovery</li>
                <li><strong>UI:</strong> shadcn/ui components</li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Для активации:</strong> Свяжитесь с Bussystem для активации dealer аккаунта "infobus-ws" 
              для получения живых данных вместо ошибки "dealer_no_activ".
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
