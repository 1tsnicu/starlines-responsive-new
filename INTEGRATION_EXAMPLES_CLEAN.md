# Integration Examples - Points System

Examples of integrating the Points system into existing components.

## Enhanced Search Form

```tsx
import React, { useState } from 'react';
import { PointAutocomplete } from '@/components/PointAutocomplete';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Users, ArrowLeftRight } from 'lucide-react';
import type { PointCity } from '@/types/points';

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
              Departure from
            </label>
            <PointAutocomplete
              value={fromPoint}
              onSelect={setFromPoint}
              placeholder="Search departure city..."
              transport="all"
              language="en"
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
              Arrival to
            </label>
            <PointAutocomplete
              value={toPoint}
              onSelect={setToPoint}
              placeholder="Search destination city..."
              transport="all"
              language="en"
              showStations={true}
            />
          </div>

          {/* Date & Passengers */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                <CalendarDays className="h-4 w-4 inline mr-1" />
                Date
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
                Passengers
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
            Search Routes
          </Button>
        </div>

        {/* Selected Route Preview */}
        {fromPoint && toPoint && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-blue-800">
                Selected route:
              </span>
              <span className="text-blue-600">
                {fromPoint.name} → {toPoint.name}
              </span>
            </div>
            {(fromPoint.country_name !== toPoint.country_name) && (
              <div className="mt-1 text-xs text-blue-600">
                ⚡ International travel: {fromPoint.country_name} → {toPoint.country_name}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Integration in HeroSection

```tsx
export function HeroSectionWithPoints() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-6xl font-bold mb-4">
            Travel Easy
          </h1>
          <p className="text-xl lg:text-2xl mb-8 opacity-90">
            Find and book tickets to your favorite destination
          </p>
        </div>
        
        <EnhancedSearchForm onSearch={(params) => {
          // Search logic here
          console.log('Hero search:', params);
        }} />
      </div>
    </section>
  );
}
```

## Usage in Existing Search Page

```tsx
// Replace existing SearchForm with enhanced version
export function SearchPageExample() {
  const handleSearch = (params: {
    from: PointCity;
    to: PointCity;
    date: string;
    passengers: number;
  }) => {
    // Navigate to search results with new point IDs
    navigate(`/search-results?from=${params.from.id}&to=${params.to.id}&date=${params.date}&passengers=${params.passengers}`);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Routes</h1>
        <p className="text-gray-600">
          Use autocomplete to quickly find your departure and destination cities
        </p>
      </div>
      
      <EnhancedSearchForm onSearch={handleSearch} />
    </div>
  );
}
```

## Benefits of Integration

- **Improved UX**: Real-time search with debouncing reduces API calls
- **Better Data**: Get precise point IDs for API calls instead of string matching  
- **Multilingual**: Support for 6 languages out of the box
- **Transport Filtering**: Show only relevant stations/airports based on transport type
- **Caching**: Reduced load times with intelligent caching strategy
- **Error Handling**: Graceful fallbacks and retry logic built-in

## Migration Guide

### Step 1: Replace SearchForm imports
```tsx
// Old
import SearchForm from '@/components/SearchForm';

// New  
import { EnhancedSearchForm } from '@/components/EnhancedSearchForm';
```

### Step 2: Update search handler
```tsx
// Old
const handleSearch = (from: string, to: string, date: string) => {
  // String matching logic
};

// New
const handleSearch = (params: {
  from: PointCity;
  to: PointCity; 
  date: string;
  passengers: number;
}) => {
  // Use params.from.id and params.to.id for precise API calls
};
```

### Step 3: Update API calls
```tsx
// Old
const searchRoutes = async (from: string, to: string) => {
  return await api.searchRoutes({ from_text: from, to_text: to });
};

// New
const searchRoutes = async (fromId: string, toId: string) => {
  return await api.searchRoutes({ from_id: fromId, to_id: toId });
};
```
