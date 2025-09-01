import React, { useState, useRef, useEffect } from 'react';
import { usePointsAutocomplete, BussPoint } from '@/lib/bussystem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';

interface BussystemAutocompleteProps {
  placeholder?: string;
  value?: string;
  onSelect: (point: BussPoint) => void;
  className?: string;
}

export function BussystemAutocomplete({ 
  placeholder = "Căutați orașul...", 
  value = "",
  onSelect,
  className = ""
}: BussystemAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: points, loading, error } = usePointsAutocomplete(inputValue);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show/hide dropdown based on input focus and data
  useEffect(() => {
    if (inputValue.length >= 2 && (points.length > 0 || loading || error)) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [points, loading, error, inputValue]);

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
    const country = point.country_name ? `, ${point.country_name}` : '';
    return `${name}${country}`;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= 2 && points.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-auto">
          <CardContent className="p-0">
            {loading && inputValue.length >= 2 && (
              <div className="p-3 text-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                Se caută...
              </div>
            )}
            
            {error && (
              <div className="p-3 text-center text-sm text-destructive">
                Eroare: {error}
              </div>
            )}
            
            {!loading && !error && points.length === 0 && inputValue.length >= 2 && (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Nu s-au găsit rezultate pentru "{inputValue}"
              </div>
            )}
            
            {points.map((point, index) => (
              <Button
                key={point.point_id}
                variant="ghost"
                className={`w-full justify-start p-3 h-auto text-left rounded-none border-b last:border-b-0 text-foreground ${
                  index === selectedIndex ? 'bg-muted' : ''
                }`}
                onClick={() => handleSelectPoint(point)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-2 w-full">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-foreground">
                      {getDisplayName(point)}
                    </div>
                    {point.point_name_detail && (
                      <div className="text-xs text-muted-foreground truncate">
                        {point.point_name_detail}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
