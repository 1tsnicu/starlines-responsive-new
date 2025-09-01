import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PointAutocomplete } from '../components/PointAutocomplete';
import { CountryCitySelector } from '../components/CountryCitySelector';
import { PointsIntegrationExample } from '../components/PointsIntegrationExample';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Search, 
  Navigation,
  Bus,
  Train,
  Plane,
  RefreshCw
} from 'lucide-react';

import { pointsAPI } from '../lib/pointsApi';
import type { PointCity, CountryItem, TransportType, LanguageCode } from '../types/points';

export default function PointsDemo() {
  const [view, setView] = useState<'overview' | 'autocomplete' | 'selector' | 'integration'>('overview');
  const [selectedFromPoint, setSelectedFromPoint] = useState<PointCity | null>(null);
  const [selectedToPoint, setSelectedToPoint] = useState<PointCity | null>(null);
  const [selectedCountryCity, setSelectedCountryCity] = useState<{
    country?: CountryItem;
    city?: PointCity;
  }>({});
  const [transport, setTransport] = useState<TransportType>('all');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [stats, setStats] = useState<{
    autocompleteCount: number;
    countriesCount: number;
    citiesCount: number;
  }>({ autocompleteCount: 0, countriesCount: 0, citiesCount: 0 });

  const handleClearCache = () => {
    pointsAPI.clearCache();
    alert('Cache cleared successfully!');
  };

  const loadDemoStats = async () => {
    try {
      const [autocompleteResponse, countriesResponse] = await Promise.all([
        pointsAPI.autocomplete('a', { lang: language, transport }),
        pointsAPI.getCountries({ lang: language })
      ]);

      setStats({
        autocompleteCount: autocompleteResponse.data?.length || 0,
        countriesCount: countriesResponse.data?.length || 0,
        citiesCount: selectedCountryCity.country 
          ? (await pointsAPI.getCitiesByCountry(selectedCountryCity.country.country_id, { lang: language })).data?.length || 0
          : 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const getTransportIcon = (transportType: TransportType) => {
    const iconProps = { className: "h-4 w-4" };
    switch (transportType) {
      case 'bus': return <Bus {...iconProps} />;
      case 'train': return <Train {...iconProps} />;
      case 'air': return <Plane {...iconProps} />;
      default: return <Navigation {...iconProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Points System Demo</h1>
          </div>
          <p className="text-muted-foreground">
            Complete demonstration of Bussystem get_points API integration with autocomplete, country/city selection, and more.
          </p>
        </div>

        {/* Global Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Global Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Transport Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'bus', 'train', 'air'] as TransportType[]).map(type => (
                    <Button
                      key={type}
                      variant={transport === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTransport(type)}
                      className="flex items-center gap-2"
                    >
                      {getTransportIcon(type)}
                      {type}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <div className="flex flex-wrap gap-2">
                  {(['en', 'ru', 'ua', 'de', 'pl', 'cz'] as LanguageCode[]).map(lang => (
                    <Button
                      key={lang}
                      variant={language === lang ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLanguage(lang)}
                    >
                      {lang.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Actions</label>
                <div className="space-y-2">
                  <Button onClick={loadDemoStats} variant="outline" size="sm" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load Stats
                  </Button>
                  <Button onClick={handleClearCache} variant="outline" size="sm" className="w-full">
                    Clear Cache
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Stats Display */}
            {(stats.autocompleteCount > 0 || stats.countriesCount > 0) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">API Statistics</h4>
                <div className="flex gap-4">
                  <Badge variant="secondary">
                    Autocomplete: {stats.autocompleteCount} results
                  </Badge>
                  <Badge variant="secondary">
                    Countries: {stats.countriesCount}
                  </Badge>
                  {stats.citiesCount > 0 && (
                    <Badge variant="secondary">
                      Cities: {stats.citiesCount}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={view} onValueChange={(value) => setView(value as 'overview' | 'autocomplete' | 'selector' | 'integration')} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="autocomplete">Autocomplete</TabsTrigger>
            <TabsTrigger value="selector">Country/City Selector</TabsTrigger>
            <TabsTrigger value="integration">Integration Example</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Autocomplete Features
                  </CardTitle>
                  <CardDescription>
                    Real-time search with debouncing, caching, and comprehensive results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Debounced search (300ms)</li>
                    <li>✅ Minimum 2 characters</li>
                    <li>✅ Transport type filtering</li>
                    <li>✅ Language localization</li>
                    <li>✅ Results caching (5min)</li>
                    <li>✅ Error handling & retry</li>
                    <li>✅ Station & airport info</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Country/City Features
                  </CardTitle>
                  <CardDescription>
                    Hierarchical selection with grouping and comprehensive data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Countries list & groups</li>
                    <li>✅ Alphabetical indexing</li>
                    <li>✅ Search within countries/cities</li>
                    <li>✅ Currency & timezone info</li>
                    <li>✅ Population data</li>
                    <li>✅ ISO codes support</li>
                    <li>✅ Region-based grouping</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Integration Details</CardTitle>
                <CardDescription>
                  Technical implementation details and features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Request Handling</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• JSON/XML response parsing</li>
                      <li>• Automatic retry logic</li>
                      <li>• Request debouncing</li>
                      <li>• Abort controller for cancellation</li>
                      <li>• Comprehensive error handling</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Data Normalization</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Consistent data structures</li>
                      <li>• Type-safe conversions</li>
                      <li>• Coordinate validation</li>
                      <li>• Deduplication by ID</li>
                      <li>• Localized name handling</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Performance</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Multi-level caching</li>
                      <li>• Configurable TTL</li>
                      <li>• Background cache cleanup</li>
                      <li>• Parallel API calls</li>
                      <li>• Optimized re-renders</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="autocomplete" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Route Planning with Autocomplete</CardTitle>
                <CardDescription>
                  Test the autocomplete functionality for route planning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">From (Departure)</label>
                    <PointAutocomplete
                      value={selectedFromPoint}
                      onSelect={setSelectedFromPoint}
                      placeholder="Search departure city..."
                      transport={transport}
                      language={language}
                      showStations={transport === 'bus' || transport === 'train'}
                      showAirports={transport === 'air'}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">To (Destination)</label>
                    <PointAutocomplete
                      value={selectedToPoint}
                      onSelect={setSelectedToPoint}
                      placeholder="Search destination city..."
                      transport={transport}
                      language={language}
                      showStations={transport === 'bus' || transport === 'train'}
                      showAirports={transport === 'air'}
                    />
                  </div>
                </div>

                {(selectedFromPoint || selectedToPoint) && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <h4 className="font-medium mb-3">Selected Route</h4>
                      <div className="flex items-center gap-4">
                        {selectedFromPoint && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">From</Badge>
                            <span className="text-sm">{selectedFromPoint.name}</span>
                            {selectedFromPoint.country_iso2 && (
                              <Badge variant="secondary">{selectedFromPoint.country_iso2}</Badge>
                            )}
                          </div>
                        )}
                        
                        {selectedFromPoint && selectedToPoint && (
                          <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                        )}
                        
                        {selectedToPoint && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">To</Badge>
                            <span className="text-sm">{selectedToPoint.name}</span>
                            {selectedToPoint.country_iso2 && (
                              <Badge variant="secondary">{selectedToPoint.country_iso2}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selector" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Country → City Selection</CardTitle>
                <CardDescription>
                  Browse countries and cities hierarchically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CountryCitySelector
                  value={selectedCountryCity}
                  onSelect={setSelectedCountryCity}
                  transport={transport}
                  language={language}
                />
                
                {(selectedCountryCity.country || selectedCountryCity.city) && (
                  <Card className="mt-6 bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <h4 className="font-medium mb-3">Selection Summary</h4>
                      <div className="space-y-2">
                        {selectedCountryCity.country && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Country</Badge>
                            <span className="text-sm">{selectedCountryCity.country.name}</span>
                            {selectedCountryCity.country.iso2 && (
                              <Badge variant="secondary">{selectedCountryCity.country.iso2}</Badge>
                            )}
                            {selectedCountryCity.country.currency && (
                              <Badge variant="outline">{selectedCountryCity.country.currency}</Badge>
                            )}
                          </div>
                        )}
                        
                        {selectedCountryCity.city && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">City</Badge>
                            <span className="text-sm">{selectedCountryCity.city.name}</span>
                            {selectedCountryCity.city.population && (
                              <Badge variant="secondary">
                                {(selectedCountryCity.city.population / 1000).toFixed(0)}k people
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-6">
            <PointsIntegrationExample />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
