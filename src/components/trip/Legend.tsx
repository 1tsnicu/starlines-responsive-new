/**
 * LEGEND COMPONENT
 * 
 * Displays seat status legend for seat map
 */

import React from 'react';

import { cn } from '@/lib/utils';
import { LegendProps } from '@/types/tripDetail';
import { useLocalization } from '@/contexts/LocalizationContext';

const Legend: React.FC<LegendProps> = ({ className }) => {
  const { t } = useLocalization();
  const legendItems = [
    {
      label: t('legend.available'),
      color: 'bg-green-100 border-green-300 text-green-800',
      icon: '◻️',
    },
    {
      label: t('legend.selected'),
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      icon: '✅',
    },
    {
      label: t('legend.occupied'),
      color: 'bg-red-100 border-red-300 text-red-800',
      icon: '⬛',
    },
    {
      label: t('legend.notAvailable'),
      color: 'bg-gray-100 border-gray-300 text-gray-500',
      icon: '⬜',
    },
  ];

  return (
    <div className={cn('flex flex-wrap gap-4 text-sm', className)}>
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={cn(
              'w-6 h-6 rounded border-2 flex items-center justify-center text-xs',
              item.color
            )}
          >
            {item.icon}
          </div>
          <span className="text-gray-700">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
