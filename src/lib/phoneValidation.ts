/**
 * Phone number validation utilities
 * Handles various international phone number formats
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Validate and format phone number
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  if (!phone) {
    return {
      isValid: false,
      formatted: '',
      error: 'Phone number is required'
    };
  }

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with +
  if (!cleaned.startsWith('+')) {
    return {
      isValid: false,
      formatted: '',
      error: 'Phone number must start with country code (e.g., +373)'
    };
  }

  // Remove the + for digit counting
  const digitsOnly = cleaned.slice(1);
  
  // Check length (international numbers are typically 7-15 digits)
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      isValid: false,
      formatted: '',
      error: 'Phone number must be 7-15 digits long (excluding country code)'
    };
  }

  // Check if it contains only digits after +
  if (!/^\d+$/.test(digitsOnly)) {
    return {
      isValid: false,
      formatted: '',
      error: 'Phone number can only contain digits after country code'
    };
  }

  return {
    isValid: true,
    formatted: cleaned
  };
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const validation = validatePhoneNumber(phone);
  if (!validation.isValid) {
    return phone; // Return original if invalid
  }

  const digits = validation.formatted.slice(1);
  const countryCode = validation.formatted.slice(0, 1) + digits.slice(0, 3);
  const number = digits.slice(3);

  // Format as +XXX XXX XXX XXX
  if (number.length <= 7) {
    return `${countryCode} ${number}`;
  } else {
    return `${countryCode} ${number.slice(0, 3)} ${number.slice(3)}`;
  }
}

/**
 * Get phone number examples for different countries
 */
export function getPhoneExamples(): Record<string, string> {
  return {
    'Moldova': '+373 60 123 456',
    'Romania': '+40 721 234 567',
    'Ukraine': '+380 50 123 4567',
    'Russia': '+7 912 345 6789',
    'Poland': '+48 123 456 789',
    'Czech Republic': '+420 123 456 789'
  };
}

/**
 * Validate phone number with specific country requirements
 */
export function validatePhoneForCountry(phone: string, countryCode: string): PhoneValidationResult {
  const baseValidation = validatePhoneNumber(phone);
  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const digits = baseValidation.formatted.slice(1);
  
  // Country-specific validation
  switch (countryCode.toUpperCase()) {
    case 'MD': // Moldova
      if (!digits.startsWith('373')) {
        return {
          isValid: false,
          formatted: '',
          error: 'Moldova phone numbers must start with +373'
        };
      }
      if (digits.length !== 11) { // +373 + 8 digits
        return {
          isValid: false,
          formatted: '',
          error: 'Moldova phone numbers must be +373 followed by 8 digits'
        };
      }
      break;
      
    case 'RO': // Romania
      if (!digits.startsWith('40')) {
        return {
          isValid: false,
          formatted: '',
          error: 'Romania phone numbers must start with +40'
        };
      }
      break;
      
    case 'UA': // Ukraine
      if (!digits.startsWith('380')) {
        return {
          isValid: false,
          formatted: '',
          error: 'Ukraine phone numbers must start with +380'
        };
      }
      break;
  }

  return baseValidation;
}
