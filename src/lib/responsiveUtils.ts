// Responsive utility constants and functions
// Provides consistent responsive behavior across all components

import { useState, useEffect } from 'react';

// Responsive button heights and sizes
export const responsiveButtonClass = 'h-11 sm:h-10 text-sm sm:text-base px-4 sm:px-6';
export const responsiveButtonSmallClass = 'h-9 sm:h-8 text-xs sm:text-sm px-3 sm:px-4';
export const responsiveButtonLargeClass = 'h-12 sm:h-11 text-base sm:text-lg px-6 sm:px-8';

// Responsive card classes
export const responsiveCardClass = 'p-4 sm:p-6';
export const responsiveCardHeaderClass = 'pb-3 sm:pb-4 lg:pb-6';
export const responsiveCardContentClass = 'pt-0';

// Responsive spacing classes
export const responsiveSpacing = {
  xs: 'space-y-2 sm:space-y-3',
  sm: 'space-y-3 sm:space-y-4',
  md: 'space-y-4 sm:space-y-6',
  lg: 'space-y-6 sm:space-y-8',
  xl: 'space-y-8 sm:space-y-12'
};

// Responsive padding classes
export const responsivePadding = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-12'
};

// Responsive margin classes
export const responsiveMargin = {
  xs: 'm-2 sm:m-3',
  sm: 'm-3 sm:m-4',
  md: 'm-4 sm:m-6',
  lg: 'm-6 sm:m-8',
  xl: 'm-8 sm:m-12'
};

// Icon size responsive classes
export const responsiveIconSize = {
  xs: 'h-3 w-3 sm:h-4 sm:w-4',
  sm: 'h-4 w-4 sm:h-5 sm:w-5',
  md: 'h-5 w-5 sm:h-6 sm:w-6',
  lg: 'h-6 w-6 sm:h-8 sm:w-8',
  xl: 'h-8 w-8 sm:h-10 sm:w-10'
};

// Responsive flex direction classes
export const responsiveFlex = {
  column: 'flex flex-col',
  columnToRow: 'flex flex-col sm:flex-row',
  rowToColumn: 'flex flex-row sm:flex-col',
  row: 'flex flex-row'
};

// Mobile-first visibility classes
export const responsiveVisibility = {
  hiddenMobile: 'hidden sm:block',
  hiddenDesktop: 'block sm:hidden',
  showMobile: 'block sm:hidden',
  showDesktop: 'hidden sm:block'
};

// Typography scale for different screen sizes
export const responsiveTypography = {
  display: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl',
  heading1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl',
  heading2: 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl',
  heading3: 'text-lg sm:text-xl lg:text-2xl xl:text-3xl',
  heading4: 'text-base sm:text-lg lg:text-xl xl:text-2xl',
  body: 'text-sm sm:text-base lg:text-lg',
  small: 'text-xs sm:text-sm lg:text-base',
  tiny: 'text-xs'
};

// Utility function to get responsive classes
export function getResponsiveClass(type: string, size: string): string {
  const classMap: Record<string, Record<string, string>> = {
    spacing: responsiveSpacing,
    padding: responsivePadding,
    margin: responsiveMargin,
    icon: responsiveIconSize,
    typography: responsiveTypography
  };

  return classMap[type]?.[size] || '';
}

// Hook for responsive behavior
export function useResponsiveBreakpoint() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return { isMobile, isTablet, isDesktop };
}
