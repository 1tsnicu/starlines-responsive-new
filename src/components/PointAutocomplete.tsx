import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Plane, Train, Bus, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from './ui/command';

import { pointsAPI } from '../lib/pointsApi';
import type { PointCity, TransportType, LanguageCode } from '../types/points';

interface PointAutocompleteProps {
  value?: PointCity | null;
  onSelect: (point: PointCity | null) => void;
  placeholder?: string;
  transport?: TransportType;
  language?: LanguageCode;
  disabled?: boolean;
  showStations?: boolean;
  showAirports?: boolean;
  className?: string;
}

export function PointAutocomplete({
  value,
  onSelect,
  placeholder = "Search cities...",
  transport = 'all',
  language = 'en',
  disabled = false,
  showStations = false,
  showAirports = false,
  className = ""
}: PointAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PointCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchTimeout = useRef<NodeJS.Timeout>();
  const abortController = useRef<AbortController>();

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await pointsAPI.autocomplete(searchQuery, {
        transport,
        lang: language,
        includeAll: true,
        useCache: true
      });

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error?.message || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('Network error occurred');
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, [transport, language]);

  // Handle input change with debouncing
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.trim()) {
      searchTimeout.current = setTimeout(() => {
        debouncedSearch(query.trim());
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, debouncedSearch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const handleSelect = (point: PointCity) => {
    onSelect(point);
    setQuery(point.name);
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setResults([]);
    setError(null);
  };

  const getTransportIcon = (transportType: TransportType) => {
    const iconProps = { className: "h-3 w-3" };
    switch (transportType) {
      case 'bus': return <Bus {...iconProps} />;
      case 'train': return <Train {...iconProps} />;
      case 'air': return <Plane {...iconProps} />;
      default: return <MapPin {...iconProps} />;
    }
  };

  const formatCityDisplay = (city: PointCity) => {
    const parts = [city.name];
    if (city.country_name && city.country_iso2) {
      parts.push(`${city.country_name} (${city.country_iso2})`);
    } else if (city.country_name) {
      parts.push(city.country_name);
    }
    return parts.join(', ');
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            
            <Input
              value={value ? value.name : query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="pl-10 pr-10"
            />
            
            {(value || query) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            
            {loading && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-full min-w-[400px] p-0" align="start">
          <Command>
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Searching...</span>
                </div>
              )}
              
              {error && (
                <div className="p-4 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => debouncedSearch(query)}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}
              
              {!loading && !error && results.length === 0 && query.length >= 3 && (
                <CommandEmpty>
                  <div className="text-center py-6">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No cities found</p>
                    <p className="text-xs text-muted-foreground">Try a different search term</p>
                  </div>
                </CommandEmpty>
              )}
              
              {!loading && !error && results.length > 0 && (
                <CommandGroup>
                  {results.map((city) => (
                    <CommandItem
                      key={city.point_id}
                      onSelect={() => handleSelect(city)}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          {getTransportIcon(transport)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {city.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatCityDisplay(city)}
                          </p>
                          
                          {/* Show stations if available and requested */}
                          {showStations && city.stations && city.stations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {city.stations.slice(0, 2).map((station, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {station.station_name}
                                </Badge>
                              ))}
                              {city.stations.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{city.stations.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Show airports if available and requested */}
                          {showAirports && city.airports && city.airports.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {city.airports.map((airport, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {airport.iata ? `${airport.iata} - ${airport.airport_name}` : airport.airport_name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {city.currency && (
                          <Badge variant="outline" className="text-xs">
                            {city.currency}
                          </Badge>
                        )}
                        {city.population && city.population > 100000 && (
                          <Badge variant="outline" className="text-xs">
                            {(city.population / 1000000).toFixed(1)}M
                          </Badge>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {query.length > 0 && query.length < 3 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Type at least 3 characters to search
                  </p>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected city display */}
      {value && (
        <Card className="mt-2">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{value.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCityDisplay(value)}
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
