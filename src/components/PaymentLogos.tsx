import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentLogosProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const PaymentLogos: React.FC<PaymentLogosProps> = ({ 
  className = '', 
  size = 'md',
  showLabels = false 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-12';
      case 'lg':
        return 'h-12 w-20';
      default:
        return 'h-8 w-14';
    }
  };

  const paymentMethods = [
    {
      name: 'Visa',
      logo: (
        <div className={`${getSizeClasses()} bg-blue-600 rounded flex items-center justify-center`}>
          <span className="text-white font-bold text-xs">VISA</span>
        </div>
      )
    },
    {
      name: 'Mastercard',
      logo: (
        <div className={`${getSizeClasses()} bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center`}>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
      )
    },
    {
      name: 'American Express',
      logo: (
        <div className={`${getSizeClasses()} bg-blue-800 rounded flex items-center justify-center`}>
          <span className="text-white font-bold text-xs">AMEX</span>
        </div>
      )
    }
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabels && (
        <span className="text-sm text-muted-foreground mr-2">
          Acceptăm:
        </span>
      )}
      <div className="flex items-center gap-2">
        {paymentMethods.map((method, index) => (
          <div
            key={method.name}
            className="flex items-center gap-2"
            title={method.name}
          >
            {method.logo}
            {showLabels && (
              <span className="text-xs text-muted-foreground">
                {method.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentLogos;
