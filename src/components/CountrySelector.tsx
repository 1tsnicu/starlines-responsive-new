import React, { useState } from 'react';
import { useCountries } from '@/lib/bussystem';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Country {
  country_id: string;
  country_kod: string;
  country_kod_two: string;
  country_name: string;
  currency: string;
  time_zone: string;
}

interface CountrySelectorProps {
  selectedCountry?: Country | null;
  onSelect: (country: Country | null) => void;
  lang?: string;
  placeholder?: string;
  className?: string;
  showAllOption?: boolean;
}

export function CountrySelector({
  selectedCountry,
  onSelect,
  lang = "ru",
  placeholder = "Selectează țara",
  className = "",
  showAllOption = true
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: countries, loading, error } = useCountries({ lang });

  const handleSelect = (country: Country | null) => {
    onSelect(country);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={`w-full justify-between ${className}`}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            {selectedCountry ? (
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedCountry.country_name}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedCountry.country_kod_two || selectedCountry.country_kod}
                </Badge>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <ScrollArea className="h-[300px]">
          <div className="p-2">
            {showAllOption && (
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 mb-1"
                onClick={() => handleSelect(null)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Toate țările</div>
                    <div className="text-xs text-gray-500">Fără filtrare</div>
                  </div>
                  {!selectedCountry && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </Button>
            )}
            
            {loading && (
              <div className="p-4 text-center text-sm text-gray-500">
                Se încarcă țările...
              </div>
            )}
            
            {error && (
              <div className="p-4 text-center text-sm text-red-600 bg-red-50 rounded-lg">
                Eroare: {error}
              </div>
            )}
            
            {countries.map((country) => (
              <Button
                key={country.country_id}
                variant="ghost"
                className="w-full justify-start h-auto p-3 mb-1"
                onClick={() => handleSelect(country)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold">
                    {(country.country_kod_two || country.country_kod).slice(0, 2)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{country.country_name}</div>
                    <div className="text-xs text-gray-500">
                      {country.currency} • Zona {country.time_zone}
                    </div>
                  </div>
                  {selectedCountry?.country_id === country.country_id && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
