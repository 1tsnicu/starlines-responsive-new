import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BussystemAutocomplete } from '@/components/BussystemAutocomplete';
import { CountrySelector } from '@/components/CountrySelector';
import { AdvancedCitySearch } from '@/components/AdvancedCitySearch';
import { BussPoint } from '@/lib/bussystem';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe } from 'lucide-react';

interface Country {
  country_id: string;
  country_kod: string;
  country_kod_two: string;
  country_name: string;
  currency: string;
  time_zone: string;
}

export function AutocompleteTestPage() {
  const [selectedPoint1, setSelectedPoint1] = useState<BussPoint | null>(null);
  const [selectedPoint2, setSelectedPoint2] = useState<BussPoint | null>(null);
  const [selectedPoint3, setSelectedPoint3] = useState<BussPoint | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Test Autocomplete & Țări</h1>
        <p className="text-gray-600">
          Testează funcționalitățile de căutare orașe și selectare țări
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Autocomplete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Autocomplete Basic
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BussystemAutocomplete
              placeholder="Căutați orașul (basic)..."
              onSelect={setSelectedPoint1}
              className="w-full"
            />
            
            {selectedPoint1 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">
                  {selectedPoint1.point_ru_name || selectedPoint1.point_latin_name || selectedPoint1.point_name}
                </div>
                <div className="text-sm text-blue-700">
                  ID: {selectedPoint1.point_id} • {selectedPoint1.country_name}
                </div>
                {selectedPoint1.point_name_detail && (
                  <div className="text-xs text-blue-600">
                    {selectedPoint1.point_name_detail}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Country Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Selector Țări
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CountrySelector
              selectedCountry={selectedCountry}
              onSelect={setSelectedCountry}
              placeholder="Selectează țara..."
              className="w-full"
            />
            
            {selectedCountry && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-medium text-green-900">
                    {selectedCountry.country_name}
                  </div>
                  <Badge variant="secondary">
                    {selectedCountry.country_kod}
                  </Badge>
                </div>
                <div className="text-sm text-green-700">
                  ID: {selectedCountry.country_id} • Monedă: {selectedCountry.currency} • Fus: +{selectedCountry.time_zone}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filtered Autocomplete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Autocomplete Filtrat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BussystemAutocomplete
              placeholder="Căutați orașul filtrat..."
              onSelect={setSelectedPoint2}
              country_id={selectedCountry?.country_id}
              trans="bus"
              showCountry={!selectedCountry}
              className="w-full"
            />
            
            {selectedCountry && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filtrat pentru:</span>
                <Badge variant="outline">{selectedCountry.country_name}</Badge>
              </div>
            )}
            
            {selectedPoint2 && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-900">
                  {selectedPoint2.point_ru_name || selectedPoint2.point_latin_name || selectedPoint2.point_name}
                </div>
                <div className="text-sm text-purple-700">
                  ID: {selectedPoint2.point_id} • {selectedPoint2.country_name}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced City Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Căutare Avansată
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdvancedCitySearch
              label="Orașul de plecare"
              placeholder="Căutați orașul cu filtre..."
              onSelect={setSelectedPoint3}
              showFilters={true}
              enableCountryFilter={true}
              enableTransportFilter={true}
              className="w-full"
            />
            
            {selectedPoint3 && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <div className="font-medium text-orange-900">
                  {selectedPoint3.point_ru_name || selectedPoint3.point_latin_name || selectedPoint3.point_name}
                </div>
                <div className="text-sm text-orange-700">
                  ID: {selectedPoint3.point_id} • {selectedPoint3.country_name}
                </div>
                {selectedPoint3.point_name_detail && (
                  <div className="text-xs text-orange-600">
                    {selectedPoint3.point_name_detail}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Rezultate Selecții</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm font-medium text-gray-600">Basic</div>
              <div className="mt-1 text-lg">
                {selectedPoint1 ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-500">
                {selectedPoint1?.point_id || 'Neselectat'}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm font-medium text-gray-600">Țară</div>
              <div className="mt-1 text-lg">
                {selectedCountry ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-500">
                {selectedCountry?.country_kod || 'Neselectată'}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm font-medium text-gray-600">Filtrat</div>
              <div className="mt-1 text-lg">
                {selectedPoint2 ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-500">
                {selectedPoint2?.point_id || 'Neselectat'}
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm font-medium text-gray-600">Avansat</div>
              <div className="mt-1 text-lg">
                {selectedPoint3 ? '✅' : '❌'}
              </div>
              <div className="text-xs text-gray-500">
                {selectedPoint3?.point_id || 'Neselectat'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
