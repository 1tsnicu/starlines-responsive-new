import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PointAutocomplete } from '../components/PointAutocomplete';
import { CountryCitySelector } from '../components/CountryCitySelector';
import { ArrowRight, ArrowLeft, Check, MapPin, Calendar, Clock } from 'lucide-react';
import type { PointCity, CountryItem } from '../types/points';

interface RouteSelection {
  from?: PointCity;
  to?: PointCity;
  method: 'autocomplete' | 'selector';
}

export function PointsIntegrationExample() {
  const [step, setStep] = useState<'method' | 'selection' | 'result'>('method');
  const [method, setMethod] = useState<'autocomplete' | 'selector'>('autocomplete');
  const [route, setRoute] = useState<RouteSelection>({ method: 'autocomplete' });
  const [selectorState, setSelectorState] = useState<{
    country?: CountryItem;
    city?: PointCity;
    type: 'from' | 'to';
  }>({ type: 'from' });

  const handleMethodSelect = (selectedMethod: 'autocomplete' | 'selector') => {
    setMethod(selectedMethod);
    setRoute({ method: selectedMethod });
    setStep('selection');
  };

  const handleAutocompleteSelect = (point: PointCity | null, type: 'from' | 'to') => {
    setRoute(prev => ({ ...prev, [type]: point }));
  };

  const handleSelectorComplete = (data: { country?: CountryItem; city?: PointCity }) => {
    if (data.city && selectorState.type) {
      setRoute(prev => ({ ...prev, [selectorState.type]: data.city }));
      
      // Move to next step based on current selection
      if (selectorState.type === 'from') {
        setSelectorState({ type: 'to' });
      } else if (route.from) {
        setStep('result');
      }
    }
  };

  const canProceed = route.from && route.to;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Points Integration Example</h1>
        <p className="text-muted-foreground">
          Real-world example of using get_points components in a booking flow
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {(['method', 'selection', 'result'] as const).map((s, index) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              step === s ? 'bg-blue-100 text-blue-700' : 
              ['method', 'selection', 'result'].indexOf(step) > index ? 'bg-green-100 text-green-700' : 
              'bg-gray-100 text-gray-500'
            }`}>
              {['method', 'selection', 'result'].indexOf(step) > index ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-current opacity-20" />
              )}
              {s === 'method' ? 'Choose Method' : s === 'selection' ? 'Select Route' : 'Review'}
            </div>
            {index < 2 && <ArrowRight className="h-4 w-4 text-gray-400" />}
          </React.Fragment>
        ))}
      </div>

      {step === 'method' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleMethodSelect('autocomplete')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Autocomplete Search
              </CardTitle>
              <CardDescription>
                Fast, real-time search as you type. Perfect for users who know their destination.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="font-medium">Best for:</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• Quick route planning</li>
                    <li>• Users familiar with destinations</li>
                    <li>• Mobile-friendly input</li>
                    <li>• Reduced cognitive load</li>
                  </ul>
                </div>
                <Badge variant="secondary">Recommended</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleMethodSelect('selector')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Country → City Browser
              </CardTitle>
              <CardDescription>
                Browse hierarchically through countries and cities. Great for exploration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm space-y-1">
                  <p className="font-medium">Best for:</p>
                  <ul className="text-muted-foreground text-xs space-y-0.5">
                    <li>• Exploring new destinations</li>
                    <li>• International travel planning</li>
                    <li>• Users who prefer browsing</li>
                    <li>• Detailed location info needed</li>
                  </ul>
                </div>
                <Badge variant="outline">Exploratory</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'selection' && method === 'autocomplete' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Route</CardTitle>
            <CardDescription>
              Enter departure and destination cities using autocomplete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">From (Departure)</label>
                <PointAutocomplete
                  value={route.from || null}
                  onSelect={(point) => handleAutocompleteSelect(point, 'from')}
                  placeholder="Search departure city..."
                  transport="all"
                  language="en"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">To (Destination)</label>
                <PointAutocomplete
                  value={route.to || null}
                  onSelect={(point) => handleAutocompleteSelect(point, 'to')}
                  placeholder="Search destination city..."
                  transport="all"
                  language="en"
                />
              </div>
            </div>

            {canProceed && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setStep('method')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setStep('result')}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 'selection' && method === 'selector' && (
        <Card>
          <CardHeader>
            <CardTitle>
              Select {selectorState.type === 'from' ? 'Departure' : 'Destination'} Location
            </CardTitle>
            <CardDescription>
              Browse countries and cities to find your {selectorState.type === 'from' ? 'departure point' : 'destination'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CountryCitySelector
              value={selectorState}
              onSelect={handleSelectorComplete}
              transport="all"
              language="en"
            />
            
            {route.from && selectorState.type === 'to' && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Departure selected:</p>
                <p className="text-sm text-green-600">{route.from.name}</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep('method')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              {route.from && selectorState.type === 'to' && (
                <Button variant="outline" onClick={() => setSelectorState({ type: 'from' })}>
                  Change Departure
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'result' && canProceed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Route Selected
            </CardTitle>
            <CardDescription>
              Your route has been configured. Ready to search for tickets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">From</Badge>
                <div>
                  <p className="font-medium">{route.from?.name}</p>
                  <p className="text-sm text-muted-foreground">{route.from?.country_name}</p>
                </div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-blue-600" />
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">To</Badge>
                <div>
                  <p className="font-medium">{route.to?.name}</p>
                  <p className="text-sm text-muted-foreground">{route.to?.country_name}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Next Steps
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Add travel dates</li>
                    <li>• Search available routes</li>
                    <li>• Compare prices & schedules</li>
                    <li>• Select seats & book</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Method Used</h4>
                  <Badge variant={method === 'autocomplete' ? 'default' : 'secondary'}>
                    {method === 'autocomplete' ? 'Autocomplete Search' : 'Country → City Browser'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setRoute({ method });
                setStep('selection');
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Change Route
              </Button>
              
              <Button onClick={() => alert('Integration with search/booking flow would happen here')}>
                Search Tickets
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
