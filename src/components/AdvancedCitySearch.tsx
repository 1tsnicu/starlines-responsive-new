import React, { useState } from 'react';
import { BussystemAutocomplete } from '@/components/BussystemAutocomplete';
import { CountrySelector } from '@/components/CountrySelector';
import { BussPoint } from '@/lib/bussystem';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Filter, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Country {
  country_id: string;
  country_kod: string;
  country_kod_two: string;
  country_name: string;
  currency: string;
  time_zone: string;
}

interface AdvancedCitySearchProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onSelect: (point: BussPoint) => void;
  className?: string;
  lang?: string;
  showFilters?: boolean;
  enableCountryFilter?: boolean;
  enableTransportFilter?: boolean;
}

export function AdvancedCitySearch({
  label = "Selectează orașul",
  placeholder = "Căutați orașul...",
  value = "",
  onSelect,
  className = "",
  lang = "ru",
  showFilters = false,
  enableCountryFilter = true,
  enableTransportFilter = false
}: AdvancedCitySearchProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedTransport, setSelectedTransport] = useState<"bus" | "train" | "air">("bus");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handlePointSelect = (point: BussPoint) => {
    onSelect(point);
  };

  const clearCountryFilter = () => {
    setSelectedCountry(null);
  };

  const transportOptions = [
    { value: "bus" as const, label: "Autobus", icon: "🚌" },
    { value: "train" as const, label: "Tren", icon: "🚆" },
    { value: "air" as const, label: "Avion", icon: "✈️" }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <Label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {label}
        </Label>
      )}

      {/* Main autocomplete */}
      <BussystemAutocomplete
        placeholder={placeholder}
        value={value}
        onSelect={handlePointSelect}
        country_id={selectedCountry?.country_id}
        trans={selectedTransport}
        lang={lang}
        showCountry={!selectedCountry} // Hide country in results if filtered
        className="w-full"
      />

      {/* Active filters display */}
      {(selectedCountry || showFilters) && (
        <div className="flex flex-wrap gap-2 items-center">
          {selectedCountry && (
            <Badge variant="secondary" className="flex items-center gap-1 pr-1">
              <span>{selectedCountry.country_name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-red-100"
                onClick={clearCountryFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {enableTransportFilter && selectedTransport !== "bus" && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>{transportOptions.find(t => t.value === selectedTransport)?.icon}</span>
              <span>{transportOptions.find(t => t.value === selectedTransport)?.label}</span>
            </Badge>
          )}
        </div>
      )}

      {/* Filters section */}
      {showFilters && (
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              {filtersOpen ? 'Ascunde filtrele' : 'Afișează filtrele'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {/* Country filter */}
            {enableCountryFilter && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Filtrează după țară</Label>
                <CountrySelector
                  selectedCountry={selectedCountry}
                  onSelect={setSelectedCountry}
                  lang={lang}
                  placeholder="Toate țările"
                  className="w-full"
                />
              </div>
            )}

            {/* Transport filter */}
            {enableTransportFilter && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Tip transport</Label>
                <div className="flex gap-2">
                  {transportOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedTransport === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTransport(option.value)}
                      className="flex items-center gap-1"
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
