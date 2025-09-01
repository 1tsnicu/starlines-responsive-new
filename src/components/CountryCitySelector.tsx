import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Globe, 
  MapPin, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Loader2,
  Flag
} from 'lucide-react';

import { pointsAPI } from '../lib/pointsApi';
import type { CountryItem, PointCity, CountryGroup, TransportType, LanguageCode } from '../types/points';

interface CountryCitySelectorProps {
  value?: {
    country?: CountryItem;
    city?: PointCity;
  };
  onSelect: (selection: { country?: CountryItem; city?: PointCity }) => void;
  transport?: TransportType;
  language?: LanguageCode;
  onBack?: () => void;
  className?: string;
}

export function CountryCitySelector({
  value,
  onSelect,
  transport = 'all',
  language = 'en',
  onBack,
  className = ""
}: CountryCitySelectorProps) {
  const [view, setView] = useState<'countries' | 'cities'>('countries');
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [countryGroups, setCountryGroups] = useState<CountryGroup[]>([]);
  const [cities, setCities] = useState<PointCity[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryItem | null>(value?.country || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load countries on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [countriesResponse, groupsResponse] = await Promise.all([
          pointsAPI.getCountries({ lang: language }),
          pointsAPI.getCountryGroups({ lang: language })
        ]);

        if (countriesResponse.success) {
          setCountries(countriesResponse.data || []);
        }
        
        if (groupsResponse.success) {
          setCountryGroups(groupsResponse.data || []);
        }

        if (!countriesResponse.success && !groupsResponse.success) {
          setError('Failed to load countries');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [language]);

  // Load cities when country is selected
  useEffect(() => {
    if (selectedCountry && view === 'cities') {
      const loadCities = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await pointsAPI.getCitiesByCountry(selectedCountry.country_id, {
            transport,
            lang: language
          });

          if (response.success) {
            setCities(response.data || []);
          } else {
            setError(response.error?.message || 'Failed to load cities');
            setCities([]);
          }
        } catch (err) {
          setError('Network error occurred');
          setCities([]);
        } finally {
          setLoading(false);
        }
      };

      loadCities();
    }
  }, [selectedCountry, view, transport, language]);

  const loadCountries = async () => {
    setLoading(true);
    setError(null);

    try {
      const [countriesResponse, groupsResponse] = await Promise.all([
        pointsAPI.getCountries({ lang: language }),
        pointsAPI.getCountryGroups({ lang: language })
      ]);

      if (countriesResponse.success) {
        setCountries(countriesResponse.data || []);
      }
      
      if (groupsResponse.success) {
        setCountryGroups(groupsResponse.data || []);
      }

      if (!countriesResponse.success && !groupsResponse.success) {
        setError('Failed to load countries');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadCitiesForCountry = async (countryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await pointsAPI.getCitiesByCountry(countryId, {
        transport,
        lang: language
      });

      if (response.success) {
        setCities(response.data || []);
      } else {
        setError(response.error?.message || 'Failed to load cities');
        setCities([]);
      }
    } catch (err) {
      setError('Network error occurred');
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country: CountryItem) => {
    setSelectedCountry(country);
    onSelect({ country, city: undefined });
    setView('cities');
  };

  const handleCitySelect = (city: PointCity) => {
    onSelect({ country: selectedCountry || undefined, city });
  };

  const handleBackToCountries = () => {
    setView('countries');
    setCities([]);
    setError(null);
  };

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.iso2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.iso3?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCountries = filteredCountries.reduce((acc, country) => {
    const firstLetter = country.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(country);
    return acc;
  }, {} as Record<string, CountryItem[]>);

  if (loading && (countries.length === 0 || cities.length === 0)) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {view === 'cities' && (
              <Button variant="ghost" size="sm" onClick={handleBackToCountries}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {onBack && view === 'countries' && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {view === 'countries' ? 'Select Country' : `Cities in ${selectedCountry?.name}`}
              </CardTitle>
              <CardDescription>
                {view === 'countries' 
                  ? 'Choose your departure or destination country'
                  : 'Choose your departure or destination city'
                }
              </CardDescription>
            </div>
          </div>
        </div>
        
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={view === 'countries' ? "Search countries..." : "Search cities..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={view === 'countries' ? loadCountries : () => loadCitiesForCountry(selectedCountry!.country_id)}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {view === 'countries' && (
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Countries List</TabsTrigger>
              <TabsTrigger value="grouped">By Region</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1">
                  {Object.keys(groupedCountries)
                    .sort()
                    .map(letter => (
                      <div key={letter}>
                        <div className="sticky top-0 bg-background py-2 px-3 text-sm font-medium text-muted-foreground border-b">
                          {letter}
                        </div>
                        {groupedCountries[letter].map(country => (
                          <div
                            key={country.country_id}
                            onClick={() => handleCountrySelect(country)}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                <Flag className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{country.name}</p>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  {country.iso2 && <span>{country.iso2}</span>}
                                  {country.currency && <span>• {country.currency}</span>}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="grouped">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {countryGroups.map((group, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        {group.country_name}
                        {group.currency && (
                          <Badge variant="outline" className="text-xs">
                            {group.currency}
                          </Badge>
                        )}
                      </h3>
                      <div className="text-xs text-muted-foreground mb-2">
                        {group.points.length} cities available
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {group.points.slice(0, 6).map(point => (
                          <Badge key={point.point_id} variant="secondary" className="text-xs">
                            {point.point_name}
                          </Badge>
                        ))}
                        {group.points.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.points.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        {view === 'cities' && (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Loading cities...</span>
                </div>
              ) : filteredCities.length > 0 ? (
                filteredCities.map(city => (
                  <div
                    key={city.point_id}
                    onClick={() => handleCitySelect(city)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <MapPin className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{city.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          {city.latitude && city.longitude && (
                            <span>{city.latitude.toFixed(2)}, {city.longitude.toFixed(2)}</span>
                          )}
                          {city.population && city.population > 10000 && (
                            <span>• {(city.population / 1000).toFixed(0)}k people</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No cities found</p>
                  <p className="text-xs text-muted-foreground">Try a different search term</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
