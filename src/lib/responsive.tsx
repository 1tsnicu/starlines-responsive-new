// Responsive component library
// Provides responsive React components

import React from 'react';
import { cn } from '@/lib/utils';

// Responsive wrapper component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '6xl' | '7xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = '7xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  const paddingClasses = {
    'none': '',
    'sm': 'px-3 sm:px-4 lg:px-6',
    'md': 'px-4 sm:px-6 lg:px-8',
    'lg': 'px-6 sm:px-8 lg:px-12'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function ResponsiveGrid({ 
  children, 
  className = '',
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    'sm': 'gap-3',
    'md': 'gap-4 sm:gap-6',
    'lg': 'gap-6 sm:gap-8'
  };

  const gridClasses = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(
      'grid',
      gridClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export function ResponsiveText({ 
  children, 
  className = '',
  variant = 'body',
  as: Component = 'p'
}: ResponsiveTextProps) {
  const variantClasses = {
    'h1': 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold',
    'h2': 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold',
    'h3': 'text-lg sm:text-xl lg:text-2xl font-semibold',
    'h4': 'text-base sm:text-lg lg:text-xl font-semibold',
    'body': 'text-sm sm:text-base',
    'small': 'text-xs sm:text-sm',
    'caption': 'text-xs'
  };

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
}
