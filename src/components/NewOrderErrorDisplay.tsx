import React from 'react';
import { AlertCircle, Clock, User, Phone, Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface NewOrderErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function NewOrderErrorDisplay({ error, onRetry, className = "" }: NewOrderErrorDisplayProps) {
  // Parse error to determine type and provide specific guidance
  const getErrorInfo = (error: string) => {
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('dealer_no_activ')) {
      return {
        type: 'dealer',
        title: 'Service Temporarily Unavailable',
        description: 'Your account needs to be activated to create orders.',
        icon: AlertCircle,
        color: 'orange',
        solutions: [
          'Contact Bussystem support to activate your dealer account',
          'Verify your IP address is whitelisted',
          'Check your account credentials'
        ],
        contact: 'support@bussystem.eu'
      };
    }
    
    if (errorLower.includes('interval_no_found')) {
      return {
        type: 'route',
        title: 'Route Not Found',
        description: 'The selected route is no longer available.',
        icon: Calendar,
        color: 'blue',
        solutions: [
          'Try a different date or time',
          'Select a different route',
          'Check if the route is still active'
        ]
      };
    }
    
    if (errorLower.includes('route_no_activ')) {
      return {
        type: 'route',
        title: 'Route Not Active',
        description: 'This route is not available for booking.',
        icon: AlertCircle,
        color: 'red',
        solutions: [
          'Select a different route',
          'Check if the route is temporarily suspended',
          'Try again later'
        ]
      };
    }
    
    if (errorLower.includes('interval_no_activ')) {
      return {
        type: 'schedule',
        title: 'Schedule Not Active',
        description: 'This departure time is not available for booking.',
        icon: Clock,
        color: 'red',
        solutions: [
          'Select a different departure time',
          'Check if the schedule is still valid',
          'Try a different date'
        ]
      };
    }
    
    if (errorLower.includes('no_seat')) {
      return {
        type: 'seat',
        title: 'No Seats Selected',
        description: 'Please select seats before creating an order.',
        icon: User,
        color: 'yellow',
        solutions: [
          'Go back and select seats for all passengers',
          'Make sure seat selection is complete',
          'Check if seats are still available'
        ]
      };
    }
    
    if (errorLower.includes('no_name') || errorLower.includes('no_phone')) {
      return {
        type: 'passenger',
        title: 'Missing Passenger Information',
        description: 'Please complete all required passenger details.',
        icon: User,
        color: 'yellow',
        solutions: [
          'Fill in all passenger names and surnames',
          'Provide a valid phone number',
          'Complete all required fields'
        ]
      };
    }
    
    if (errorLower.includes('телефон') || errorLower.includes('phone') || errorLower.includes('номер') || 
        errorLower.includes('ошибка в указанном номере телефона')) {
      return {
        type: 'phone',
        title: 'Invalid Phone Number',
        description: 'The phone number format is not valid.',
        icon: Phone,
        color: 'yellow',
        solutions: [
          'Use international format: +373XXXXXXXX',
          'Include country code (e.g., +373 for Moldova)',
          'Remove spaces and special characters',
          'Ensure the number is 8-15 digits long'
        ]
      };
    }
    
    if (errorLower.includes('no_doc') || errorLower.includes('no_birth_date')) {
      return {
        type: 'passenger',
        title: 'Missing Document Information',
        description: 'Please provide all required document details.',
        icon: CreditCard,
        color: 'yellow',
        solutions: [
          'Fill in document type and number',
          'Provide birth dates for all passengers',
          'Complete all required document fields'
        ]
      };
    }
    
    if (errorLower.includes('date')) {
      return {
        type: 'date',
        title: 'Invalid Date',
        description: 'The selected date is not valid for booking.',
        icon: Calendar,
        color: 'red',
        solutions: [
          'Select a date within the allowed range (today to 6 months)',
          'Check the date format (YYYY-MM-DD)',
          'Make sure the date is not in the past'
        ]
      };
    }
    
    if (errorLower.includes('new_order')) {
      return {
        type: 'system',
        title: 'System Error',
        description: 'A system error occurred while creating the order.',
        icon: AlertCircle,
        color: 'red',
        solutions: [
          'Try again in a few moments',
          'Check your internet connection',
          'Contact support if the problem persists'
        ]
      };
    }
    
    // Default error
    return {
      type: 'unknown',
      title: 'Booking Error',
      description: 'An error occurred while creating your order.',
      icon: AlertCircle,
      color: 'gray',
      solutions: [
        'Try again in a few moments',
        'Check all your information',
        'Contact support if the problem persists'
      ]
    };
  };

  const errorInfo = getErrorInfo(error);
  const IconComponent = errorInfo.icon;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'orange':
        return {
          card: 'border-orange-200 bg-orange-50',
          title: 'text-orange-800',
          description: 'text-orange-700',
          icon: 'text-orange-600',
          button: 'border-orange-300 text-orange-700 hover:bg-orange-100'
        };
      case 'red':
        return {
          card: 'border-red-200 bg-red-50',
          title: 'text-red-800',
          description: 'text-red-700',
          icon: 'text-red-600',
          button: 'border-red-300 text-red-700 hover:bg-red-100'
        };
      case 'blue':
        return {
          card: 'border-blue-200 bg-blue-50',
          title: 'text-blue-800',
          description: 'text-blue-700',
          icon: 'text-blue-600',
          button: 'border-blue-300 text-blue-700 hover:bg-blue-100'
        };
      case 'yellow':
        return {
          card: 'border-yellow-200 bg-yellow-50',
          title: 'text-yellow-800',
          description: 'text-yellow-700',
          icon: 'text-yellow-600',
          button: 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
        };
      default:
        return {
          card: 'border-gray-200 bg-gray-50',
          title: 'text-gray-800',
          description: 'text-gray-700',
          icon: 'text-gray-600',
          button: 'border-gray-300 text-gray-700 hover:bg-gray-100'
        };
    }
  };

  const colors = getColorClasses(errorInfo.color);

  return (
    <Card className={`${colors.card} ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${colors.icon}`} />
          <CardTitle className={colors.title}>{errorInfo.title}</CardTitle>
        </div>
        <CardDescription className={colors.description}>
          {errorInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p className="mb-2 font-medium">What you can do:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {errorInfo.solutions.map((solution, index) => (
              <li key={index} className={colors.description}>{solution}</li>
            ))}
          </ul>
        </div>

        {errorInfo.contact && (
          <div className="text-sm">
            <p className="font-medium mb-1">Need help?</p>
            <p className={colors.description}>
              Contact support: <a href={`mailto:${errorInfo.contact}`} className="underline">{errorInfo.contact}</a>
            </p>
          </div>
        )}

        {onRetry && (
          <div className="pt-2">
            <Button 
              onClick={onRetry}
              variant="outline"
              size="sm"
              className={colors.button}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Technical details:</strong> {error}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
