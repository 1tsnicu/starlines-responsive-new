// Exemplu de integrare a sistemului Points în componenta SearchForm existentă

import React, { useState } from 'react';
import { PointAutocomplete } from './src/components/PointAutocomplete';
import { Button } from './src/components/ui/button';
import { Card, CardContent } from './src/components/ui/card';
import { CalendarDays, Users, ArrowLeftRight } from 'lucide-react';
import type { PointCity } from './src/types/points';

interface EnhancedSearchFormProps {
  onSearch: (params: {
    from: PointCity;
    to: PointCity;
    date: string;
    passengers: number;
  }) => void;
}

export function EnhancedSearchForm({ onSearch }: EnhancedSearchFormProps) {
  const [fromPoint, setFromPoint] = useState<PointCity | null>(null);
  const [toPoint, setToPoint] = useState<PointCity | null>(null);
  const [date, setDate] = useState<string>('');
  const [passengers, setPassengers] = useState(1);

  const handleSearch = () => {
    if (fromPoint && toPoint && date) {
      onSearch({
        from: fromPoint,
        to: toPoint,
        date,
        passengers
      });
    }
  };

  const swapPoints = () => {
    const temp = fromPoint;
    setFromPoint(toPoint);
    setToPoint(temp);
  };

  const canSearch = fromPoint && toPoint && date;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          {/* From Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Plecare din
            </label>
            <PointAutocomplete
              value={fromPoint}
              onSelect={setFromPoint}
              placeholder="Oraș plecare..."
              transport="all"
              language="ro"
              showStations={true}
            />
          </div>

          {/* Swap Button */}
          <div className="flex justify-center lg:justify-start">
            <Button
              variant="outline"
              size="icon"
              onClick={swapPoints}
              className="h-10 w-10"
              disabled={!fromPoint && !toPoint}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          {/* To Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Sosire în
            </label>
            <PointAutocomplete
              value={toPoint}
              onSelect={setToPoint}
              placeholder="Oraș destinație..."
              transport="all"
              language="ro"
              showStations={true}
            />
          </div>

          {/* Date & Passengers */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                <CalendarDays className="h-4 w-4 inline mr-1" />
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                <Users className="h-4 w-4 inline mr-1" />
                Pasageri
              </label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={handleSearch}
            disabled={!canSearch}
            size="lg"
            className="px-8"
          >
            Caută Curse
          </Button>
        </div>

        {/* Selected Route Preview */}
        {fromPoint && toPoint && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-800">
                Ruta selectată:
              </span>
              <span className="text-blue-600">
                {fromPoint.name} → {toPoint.name}
              </span>
            </div>
            {(fromPoint.country_name !== toPoint.country_name) && (
              <div className="mt-1 text-xs text-blue-600">
                ⚡ Călătorie internațională: {fromPoint.country_name} → {toPoint.country_name}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Exemplu de utilizare în pagina de căutare
export function SearchPageExample() {
  const handleSearch = (params: {
    from: PointCity;
    to: PointCity;
    date: string;
    passengers: number;
  }) => {
    console.log('Searching for routes:', params);
    
    // Aici s-ar face apelul către API-ul de căutare curse
    // cu parametrii from.id, to.id, date, passengers
    
    // Exemplu navigare către rezultate:
    // navigate(`/search-results?from=${params.from.id}&to=${params.to.id}&date=${params.date}&passengers=${params.passengers}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Căutare Curse</h1>
        <p className="text-gray-600">
          Folosește autocomplete pentru a găsi rapid orașul de plecare și destinația
        </p>
      </div>
      
      <EnhancedSearchForm onSearch={handleSearch} />
      
      {/* Alte secțiuni existente */}
      <div className="mt-12">
        {/* Popular routes, recent searches, etc. */}
      </div>
    </div>
  );
}

// Integrare în HeroSection existent
export function HeroSectionWithPoints() {
  // Similar cu SearchPageExample dar integrat în design-ul HeroSection
  // Poate fi adaptat pentru a înlocui componenta SearchForm existentă
  
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Călătorește Ușor
          </h1>
          <p className="text-xl lg:text-2xl mb-8 opacity-90">
            Găsește și rezervă bilete pentru destinația ta preferată
          </p>
        </div>
        
        <EnhancedSearchForm onSearch={(params) => {
          // Logica de căutare
          console.log('Hero search:', params);
        }} />
      </div>
    </section>
  );
}
