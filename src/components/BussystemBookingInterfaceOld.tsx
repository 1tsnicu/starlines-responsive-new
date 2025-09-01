import React, { useState } from 'react';
import { BussPoint, RouteSummary, TicketInfo } from '@/lib/bussystem';
import SearchForm, { SearchFormParams } from '@/components/SearchForm';
import { RouteSearchResults } from '@/components/RouteSearchResults';
import { BookingFlow } from '@/components/BookingFlow';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ViewState = 'search' | 'results' | 'booking' | 'confirmation';

export function BussystemBookingInterface() {
  const [currentView, setCurrentView] = useState<ViewState>('search');
  const [searchParams, setSearchParams] = useState<SearchFormParams>({});
  const [selectedRoute, setSelectedRoute] = useState<RouteSummary | null>(null);
  const [completedTicket, setCompletedTicket] = useState<TicketInfo | null>(null);

  const handleSearch = (params: SearchFormParams) => {
    setSearchParams(params);
    setCurrentView('results');
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
    setSearchParams({});
    setSelectedRoute(null);
    setCompletedTicket(null);
  };

  const handleBackToResults = () => {
    setCurrentView('results');
    setSelectedRoute(null);
  };

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
              {searchParams.fromPointId && searchParams.toPointId && (
                <div className="text-sm">
                  {searchParams.date} • {searchParams.passengers} 
                  {searchParams.passengers === '1' ? ' călător' : ' călători'}
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
      
      {currentView === 'search' && (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Căutare și rezervare bilete</h1>
            <p className="text-muted-foreground">
              Găsiți și rezervați bilete pentru rutele de transport în timp real
            </p>
          </div>
          
          <SearchForm 
            onSearch={handleSearch}
            showResults={false}
          />
        </div>
      )}

      {currentView === 'results' && (
        <RouteSearchResults
          fromPointId={searchParams.fromPointId}
          toPointId={searchParams.toPointId}
          date={searchParams.date}
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
          <Card>
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
      
      {/* Demo/Development info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-8 border-dashed">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              <div className="font-medium mb-2">🔧 Status integrare Bussystem API:</div>
              <ul className="space-y-1 text-xs">
                <li>✅ Client API complet implementat</li>
                <li>✅ UI componente pentru căutare și booking</li>
                <li>✅ Fluxuri complete: online payment + pay-on-board</li>
                <li>⏳ Dealer account în curs de activare</li>
                <li>🎯 Gata pentru date live la activare</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
