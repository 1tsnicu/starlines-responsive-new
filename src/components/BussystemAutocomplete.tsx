import React, { useState, useRef, useEffect } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { usePointsAutocomplete, BussPoint } from '@/lib/bussystem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useLocalization } from '@/contexts/LocalizationContext';

interface BussystemAutocompleteProps {
  placeholder?: string;
  value?: string;
  onSelect: (point: BussPoint) => void;
  className?: string;
  // New advanced filtering props
  country_id?: string | number;
  trans?: "bus" | "train" | "air" | "travel" | "hotel" | "all";
  lang?: string;
  showCountry?: boolean;
  showDetails?: boolean;
  minLength?: number;
}

export function BussystemAutocomplete({ 
  placeholder, 
  value = "",
  onSelect,
  className = "",
  country_id,
  trans = "bus",
  lang,
  showCountry = true,
  showDetails = true,
  minLength = 2
}: BussystemAutocompleteProps) {
  const { t, currentLanguage } = useLocalization();
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prefer current UI language unless a lang prop is explicitly provided
  const languageForApi = lang || currentLanguage || 'ru';

  const { data: points, loading, error } = usePointsAutocomplete(inputValue, {
    country_id,
    trans,
    lang: languageForApi,
    minLength
  });

  // Sync inputValue with value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debug logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔍 Autocomplete Debug:', {
        inputValue,
        value,
        minLength,
        pointsCount: points?.length || 0,
        loading,
        error,
        isOpen
      });
    }
  }, [inputValue, value, points, loading, error, isOpen, minLength]);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
        zIndex: 999999,
        maxHeight: '240px',
        overflow: 'auto'
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Show/hide dropdown based on input focus and data
  useEffect(() => {
    if (inputValue.length >= minLength && (points.length > 0 || loading || error)) {
      updateDropdownPosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [points, loading, error, inputValue, minLength]);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (isOpen) {
      const handleUpdate = () => updateDropdownPosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSelectPoint = (point: BussPoint) => {
    const displayName = point.point_ru_name || point.point_latin_name || point.point_name || '';
    setInputValue(displayName);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect(point);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < points.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && points[selectedIndex]) {
          handleSelectPoint(points[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const getDisplayName = (point: BussPoint) => {
    const name = point.point_ru_name || point.point_latin_name || point.point_name || '';
    const country = showCountry && point.country_name ? `, ${point.country_name}` : '';
    return `${name}${country}`;
  };

  const getSecondaryInfo = (point: BussPoint) => {
    const details = [];
    if (showDetails && point.point_name_detail) {
      details.push(point.point_name_detail);
    }
    if (showCountry && point.country_kod) {
      details.push(point.country_kod);
    }
    return details.join(' • ');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder ?? t('search.citySearchPlaceholder')}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length > 0) {
              updateDropdownPosition();
              setIsOpen(true);
            }
          }}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <MapPin className="h-4 w-4 text-blue-500" />
          )}
        </div>
      </div>

      {isOpen && inputValue.length > 0 && (
        <div 
          className="absolute top-full left-0 w-full bg-white border shadow-xl rounded-lg mt-1"
          style={{ zIndex: 999999, maxHeight: '240px', overflow: 'auto' }}
        >
          <CardContent className="p-0">
            {loading && inputValue.length >= minLength && (
              <div className="p-4 text-center text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-blue-500" />
                {t('autocomplete.searching')}
              </div>
            )}
            
            {error && !error.includes('must contain 3 or more characters') && (
              <div className="p-4 text-center text-sm text-red-600 bg-red-50 rounded-lg m-2">
                {t('common.error')}: {error}
              </div>
            )}
            
            {inputValue.length > 0 && inputValue.length < minLength && (
              <div className="p-4 text-center text-sm text-gray-600 bg-gray-50 rounded-lg m-2">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-blue-500" />
                {t('autocomplete.enterAtLeast')} {minLength} {t('autocomplete.charactersForSearch')}
              </div>
            )}
            
            {!loading && !error && points.length === 0 && inputValue.length >= minLength && (
              <div className="p-4 text-center text-sm text-gray-500">
                {t('autocomplete.noResultsFor')} "{inputValue}"
              </div>
            )}
            
            {points.map((point, index) => {
              const secondaryInfo = getSecondaryInfo(point);
              return (
                <Button
                  key={point.point_id}
                  variant="ghost"
                  className={`w-full justify-start p-4 h-auto text-left rounded-none border-b last:border-b-0 border-gray-100 hover:bg-blue-50 transition-colors duration-200 ${
                    index === selectedIndex ? 'bg-blue-100' : 'bg-transparent'
                  }`}
                  onClick={() => handleSelectPoint(point)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-gray-800">
                        {getDisplayName(point)}
                      </div>
                      {secondaryInfo && (
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {secondaryInfo}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </div>
      )}
    </div>
  );
}
