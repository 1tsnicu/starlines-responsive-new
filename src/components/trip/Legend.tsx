/**
 * LEGEND COMPONENT
 * 
 * Displays seat status legend for seat map
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { LegendProps } from '@/types/tripDetail';

const Legend: React.FC<LegendProps> = ({ className }) => {
  const legendItems = [
    {
      label: 'Available',
      color: 'bg-green-100 border-green-300 text-green-800',
      icon: '◻️',
    },
    {
      label: 'Selected',
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      icon: '✅',
    },
    {
      label: 'Occupied',
      color: 'bg-red-100 border-red-300 text-red-800',
      icon: '⬛',
    },
    {
      label: 'Not Available',
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
