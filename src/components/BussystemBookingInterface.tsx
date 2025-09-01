// Integrated booking interface using the new Bussystem components
import React, { useState } from 'react';
import { BussPoint, RouteSummary } from '@/lib/bussystem';
import { BussystemAutocomplete } from '@/components/BussystemAutocomplete';
import { BussystemRouteResults } from '@/components/BussystemRouteResults';
import { BussystemBookingFlow, type BookingResult } from '@/components/BussystemBookingFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, CheckCircle } from 'lucide-react';

type ViewState = 'search' | 'results' | 'booking' | 'confirmation';

interface SearchParams {
  fromPoint: BussPoint | null;
  toPoint: BussPoint | null;
  date: string;
}

export function BussystemBookingInterface() {
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    fromPoint: null,
    toPoint: null,
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedRoute, setSelectedRoute] = useState<RouteSummary | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  const handleSearch = () => {
    if (searchParams.fromPoint && searchParams.toPoint && searchParams.date) {
      setCurrentView('results');
    }
  };

  const handleRouteSelect = (route: RouteSummary) => {
    setSelectedRoute(route);
    setCurrentView('booking');
  };

  const handleBookingComplete = (result: BookingResult) => {
    setBookingResult(result);
    setCurrentView('confirmation');
  };

  const handleBack = () => {
    switch (currentView) {
      case 'results':
        setCurrentView('search');
        break;
      case 'booking':
        setCurrentView('results');
        break;
      case 'confirmation':
        setCurrentView('search');
        break;
      default:
        setCurrentView('search');
    }
  };

  const resetInterface = () => {
    setCurrentView('search');
    setSearchParams({
      fromPoint: null,
      toPoint: null,
      date: new Date().toISOString().split('T')[0],
    });
    setSelectedRoute(null);
    setBookingResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header with back button */}
      {currentView !== 'search' && (
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">
              {currentView === 'results' && 'Результаты поиска'}
              {currentView === 'booking' && 'Бронирование билета'}
              {currentView === 'confirmation' && 'Подтверждение бронирования'}
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      {currentView === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Поиск автобусных маршрутов</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Откуда</Label>
                <BussystemAutocomplete
                  placeholder="Выберите город отправления"
                  onSelect={(point) => setSearchParams({...searchParams, fromPoint: point})}
                  value={searchParams.fromPoint?.point_ru_name || searchParams.fromPoint?.point_latin_name || ''}
                />
              </div>
              
              <div>
                <Label>Куда</Label>
                <BussystemAutocomplete
                  placeholder="Выберите город назначения"
                  onSelect={(point) => setSearchParams({...searchParams, toPoint: point})}
                  value={searchParams.toPoint?.point_ru_name || searchParams.toPoint?.point_latin_name || ''}
                />
              </div>
              
              <div>
                <Label>Дата поездки</Label>
                <Input
                  type="date"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
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
      )}

      {/* Search Results */}
      {currentView === 'results' && searchParams.fromPoint && searchParams.toPoint && (
        <Card>
          <CardHeader>
            <CardTitle>
              Маршруты: {searchParams.fromPoint.point_ru_name} → {searchParams.toPoint.point_ru_name}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Дата: {searchParams.date}
            </div>
          </CardHeader>
          <CardContent>
            <BussystemRouteResults
              routes={[]} // This will be populated by the useRouteSearch hook inside BussystemRouteResults
              loading={false}
              error={null}
              onRouteSelect={handleRouteSelect}
            />
          </CardContent>
        </Card>
      )}

      {/* Booking Flow */}
      {currentView === 'booking' && selectedRoute && (
        <BussystemBookingFlow
          route={selectedRoute}
          onBack={handleBack}
          onComplete={handleBookingComplete}
        />
      )}

      {/* Confirmation */}
      {currentView === 'confirmation' && bookingResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Бронирование завершено!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="space-y-2 text-sm">
                <div><strong>Тип оплаты:</strong> {bookingResult.type === 'online_payment' ? 'Онлайн оплата' : 'Оплата в автобусе'}</div>
                <div><strong>ID заказа:</strong> {bookingResult.order.order_id}</div>
                {bookingResult.order.security && (
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
                Открыть билет для печати
              </Button>
            )}

            <Button 
              onClick={resetInterface}
              variant="outline"
              className="w-full"
            >
              Новый поиск
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default BussystemBookingInterface;
