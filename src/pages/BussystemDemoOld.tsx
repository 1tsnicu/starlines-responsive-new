import React, { useState } from 'react';
import { BussPoint, RouteSummary, TicketInfo } from '@/lib/bussystem';
import { BussystemAutocomplete } from '@/components/BussystemAutocomplete';
import { RouteSearchResults } from '@/components/RouteSearchResults';
import { BookingFlow } from '@/components/BookingFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Calendar as CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type ViewState = 'search' | 'results' | 'booking' | 'confirmation';

const BussystemDemo = () => {
  const [currentView, setCurrentView] = useState<ViewState>('search');
  
  // Search form data
  const [fromPoint, setFromPoint] = useState<BussPoint | null>(null);
  const [toPoint, setToPoint] = useState<BussPoint | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  // Selected route and ticket
  const [selectedRoute, setSelectedRoute] = useState<RouteSummary | null>(null);
  const [completedTicket, setCompletedTicket] = useState<TicketInfo | null>(null);

  const handleSearch = () => {
    if (fromPoint && toPoint && selectedDate) {
      setCurrentView('results');
    }
  };

  const handleRouteSelect = (route: RouteSummary) => {
    setSelectedRoute(route);
    setCurrentView('booking');
  };

  const handleBookingComplete = (ticket: TicketInfo) => {
    setCompletedTicket(ticket);
    setCurrentView('confirmation');
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedRoute(null);
    setCompletedTicket(null);
  };

  const handleBackToResults = () => {
    setCurrentView('results');
    setSelectedRoute(null);
  };

  const renderSearchForm = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Bussystem API Demo</h1>
        <p className="text-muted-foreground">
          Test complet al integrării cu API-ul Bussystem pentru căutare și rezervare bilete
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Căutare rute</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>De la</Label>
              <BussystemAutocomplete
                placeholder="Selectați orașul de plecare..."
                onSelect={setFromPoint}
              />
              {fromPoint && (
                <div className="text-xs text-muted-foreground">
                  Selectat: {fromPoint.point_ru_name || fromPoint.point_name} (ID: {fromPoint.point_id})
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Către</Label>
              <BussystemAutocomplete
                placeholder="Selectați destinația..."
                onSelect={setToPoint}
              />
              {toPoint && (
                <div className="text-xs text-muted-foreground">
                  Selectat: {toPoint.point_ru_name || toPoint.point_name} (ID: {toPoint.point_id})
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data plecării</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Selectați data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={handleSearch}
            disabled={!fromPoint || !toPoint || !selectedDate}
            className="w-full"
            size="lg"
          >
            <Search className="mr-2 h-4 w-4" />
            Căutare rute
          </Button>
        </CardContent>
      </Card>

      {/* API Status Info */}
      <Card className="max-w-4xl mx-auto border-dashed">
        <CardContent className="p-6">
          <div className="text-sm space-y-2">
            <div className="font-medium">🔧 Status integrare Bussystem API:</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>✅ Autocomplete orașe (get_points.php) - Implementat</li>
              <li>✅ Căutare rute (get_routes.php) - Implementat</li>
              <li>✅ Fluxuri de booking complete - Implementat</li>
              <li>⏳ Dealer account "infobus-ws" - În curs de activare</li>
              <li>🎯 Răspuns actual API: "dealer_no_activ"</li>
            </ul>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
              <strong>Notă:</strong> Toate componentele sunt funcționale și vor afișa date live imediat după activarea dealer-ului de către Bussystem.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHeader = () => {
    if (currentView === 'search') return null;

    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={currentView === 'results' ? handleBackToSearch : handleBackToResults}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentView === 'results' ? 'Înapoi la căutare' : 'Înapoi la rezultate'}
            </Button>
            
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                {currentView === 'results' && 'Rezultate căutare'}
                {currentView === 'booking' && 'Rezervare bilet'}
                {currentView === 'confirmation' && 'Confirmare rezervare'}
              </div>
              {fromPoint && toPoint && selectedDate && (
                <div className="text-sm font-medium">
                  {fromPoint.point_ru_name || fromPoint.point_name} → {toPoint.point_ru_name || toPoint.point_name}
                  <span className="text-muted-foreground ml-2">
                    {format(selectedDate, 'dd.MM.yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {renderHeader()}
      
      {currentView === 'search' && renderSearchForm()}

      {currentView === 'results' && fromPoint && toPoint && selectedDate && (
        <RouteSearchResults
          fromPointId={fromPoint.point_id}
          toPointId={toPoint.point_id}
          date={format(selectedDate, 'yyyy-MM-dd')}
          onRouteSelect={handleRouteSelect}
        />
      )}

      {currentView === 'booking' && selectedRoute && (
        <BookingFlow
          route={selectedRoute}
          onBack={handleBackToResults}
          onComplete={handleBookingComplete}
        />
      )}

      {currentView === 'confirmation' && completedTicket && (
        <div className="text-center space-y-6">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-green-600">
                  Rezervare completă!
                </h2>
                <p className="text-muted-foreground">
                  Biletul dumneavoastră a fost procesat cu succes.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <div className="font-medium">Detalii rezervare:</div>
                  <div>ID: {completedTicket.ticket_id || completedTicket.order_id}</div>
                  {completedTicket.price && (
                    <div>Preț: {completedTicket.price} MDL</div>
                  )}
                </div>

                <Button onClick={handleBackToSearch} className="mt-6">
                  Nouă căutare
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BussystemDemo;
