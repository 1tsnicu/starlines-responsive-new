import { z } from "zod";

// Base validation schemas
export const baseSchemas = {
  id: z.string().uuid(),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number and special character"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  url: z.string().url("Invalid URL format"),
  date: z.string().datetime("Invalid date format"),
  positiveNumber: z.number().positive("Must be a positive number"),
  nonNegativeNumber: z.number().nonnegative("Must be a non-negative number")
};

// Route validation schemas
export const routeSchemas = {
  // Basic route data
  routeBase: z.object({
    from: z.string().min(2, "From location must be at least 2 characters").max(100, "From location too long"),
    to: z.string().min(2, "To location must be at least 2 characters").max(100, "To location too long"),
    operator: z.string().min(2, "Operator must be at least 2 characters").max(100, "Operator too long"),
    frequency: z.enum(["Daily", "Multiple daily", "2x weekly", "3x weekly", "Weekly"], {
      errorMap: () => ({ message: "Invalid frequency value" })
    })
  }),

  // Time validation
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  
  // Duration validation
  duration: z.string().regex(/^\d+h\s*(\d+m)?$/, "Invalid duration format (e.g., 14h or 14h 30m)"),
  
  // Price validation
  price: z.object({
    economy: z.number().min(0, "Economy price must be non-negative").max(10000, "Price too high"),
    premium: z.number().min(0, "Premium price must be non-negative").max(10000, "Price too high"),
    business: z.number().min(0, "Business price must be non-negative").max(10000, "Price too high")
  }).refine(data => data.premium >= data.economy, {
    message: "Premium price must be greater than or equal to economy price",
    path: ["premium"]
  }).refine(data => data.business >= data.premium, {
    message: "Business price must be greater than or equal to premium price",
    path: ["business"]
  }),

  // Amenities validation
  amenities: z.array(z.string().min(1, "Amenity cannot be empty").max(50, "Amenity name too long"))
    .min(1, "At least one amenity is required")
    .max(20, "Too many amenities")
};

// Complete route validation schema
export const routeValidationSchema = z.object({
  ...routeSchemas.routeBase,
  departureTime: routeSchemas.time,
  arrivalTime: routeSchemas.time,
  duration: routeSchemas.duration,
  price: routeSchemas.price,
  amenities: routeSchemas.amenities
}).refine(data => {
  // Validate that departure and arrival times make sense
  const departure = new Date(`2000-01-01T${data.departureTime}:00`);
  const arrival = new Date(`2000-01-01T${data.arrivalTime}:00`);
  
  // If arrival is before departure, it means next day (valid for long journeys)
  if (arrival < departure) {
    arrival.setDate(arrival.getDate() + 1);
  }
  
  const diffHours = (arrival.getTime() - departure.getTime()) / (1000 * 60 * 60);
  const durationHours = parseInt(data.duration.match(/^(\d+)h/)?.[1] || "0");
  
  // Allow some tolerance (within 2 hours)
  return Math.abs(diffHours - durationHours) <= 2;
}, {
  message: "Duration does not match departure and arrival times",
  path: ["duration"]
});

// User validation schemas
export const userSchemas = {
  login: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, "Password is required")
  }),

  register: z.object({
    email: baseSchemas.email,
    username: baseSchemas.username,
    password: baseSchemas.password,
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  profile: z.object({
    username: baseSchemas.username.optional(),
    email: baseSchemas.email.optional(),
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: baseSchemas.password.optional()
  })
};

// Search and filter validation
export const searchSchemas = {
  searchQuery: z.object({
    term: z.string().max(200, "Search term too long").optional(),
    country: z.string().max(100, "Country name too long").optional(),
    priceMin: z.number().min(0, "Minimum price must be non-negative").optional(),
    priceMax: z.number().min(0, "Maximum price must be non-negative").optional(),
    durationMin: z.number().min(0, "Minimum duration must be non-negative").optional(),
    durationMax: z.number().min(0, "Maximum duration must be non-negative").optional(),
    sortBy: z.enum(["price", "duration", "departure", "arrival"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional()
  }).refine(data => {
    if (data.priceMin && data.priceMax) {
      return data.priceMax >= data.priceMin;
    }
    if (data.durationMin && data.durationMax) {
      return data.durationMax >= data.durationMin;
    }
    return true;
  }, {
    message: "Maximum values must be greater than or equal to minimum values"
  })
};

// Input sanitization functions
export class InputSanitizer {
  // Remove potentially dangerous HTML/script tags
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  // Sanitize SQL injection attempts
  static sanitizeSql(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/['";\\]/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '')
      .replace(/sp_/gi, '')
      .trim();
  }

  // Sanitize file names
  static sanitizeFileName(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\.\./g, '_')
      .replace(/^\./, '_')
      .trim();
  }

  // Sanitize URLs
  static sanitizeUrl(input: string): string {
    if (typeof input !== 'string') return '';
    
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return '';
      }
      return url.toString();
    } catch {
      return '';
    }
  }

  // Sanitize email
  static sanitizeEmail(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .toLowerCase()
      .replace(/[^\w@.-]/g, '')
      .trim();
  }

  // Sanitize phone number
  static sanitizePhone(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[^\d+\-()\s]/g, '')
      .trim();
  }

  // Sanitize numeric input
  static sanitizeNumber(input: string | number): number | null {
    if (typeof input === 'number') {
      return isFinite(input) ? input : null;
    }
    
    if (typeof input === 'string') {
      const num = parseFloat(input);
      return isFinite(num) ? num : null;
    }
    
    return null;
  }

  // Sanitize date
  static sanitizeDate(input: string): string | null {
    if (typeof input !== 'string') return null;
    
    try {
      const date = new Date(input);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch {
      return null;
    }
  }
}

// CSRF Protection
export class CSRFProtection {
  private static tokenKey = 'starlines_csrf_token';
  
  // Generate CSRF token
  static generateToken(): string {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.tokenKey, token);
    }
    
    return token;
  }
  
  // Get current CSRF token
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.tokenKey);
    }
    return null;
  }
  
  // Validate CSRF token
  static validateToken(token: string): boolean {
    const currentToken = this.getToken();
    return currentToken === token;
  }
  
  // Clear CSRF token
  static clearToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.tokenKey);
    }
  }
}

// Rate limiting
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();
  private static maxAttempts = 5;
  private static windowMs = 15 * 60 * 1000; // 15 minutes
  
  // Check if request is allowed
  static isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now > attempt.resetTime) {
      // Reset or create new attempt
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (attempt.count >= this.maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  }
  
  // Get remaining attempts
  static getRemainingAttempts(identifier: string): number {
    const attempt = this.attempts.get(identifier);
    if (!attempt) return this.maxAttempts;
    
    const now = Date.now();
    if (now > attempt.resetTime) return this.maxAttempts;
    
    return Math.max(0, this.maxAttempts - attempt.count);
  }
  
  // Clear attempts for identifier
  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  // Clear all attempts
  static clearAll(): void {
    this.attempts.clear();
  }
}

// Validation utilities
export const validateAndSanitize = {
  // Validate and sanitize route data
  route: (data: unknown) => {
    const validated = routeValidationSchema.parse(data);
    return {
      ...validated,
      from: InputSanitizer.sanitizeHtml(validated.from),
      to: InputSanitizer.sanitizeHtml(validated.to),
      operator: InputSanitizer.sanitizeHtml(validated.operator),
      amenities: validated.amenities.map(amenity => InputSanitizer.sanitizeHtml(amenity))
    };
  },

  // Validate and sanitize user input
  user: {
    login: (data: unknown) => {
      const validated = userSchemas.login.parse(data);
      return {
        email: InputSanitizer.sanitizeEmail(validated.email),
        password: validated.password // Don't sanitize password
      };
    },
    
    register: (data: unknown) => {
      const validated = userSchemas.register.parse(data);
      return {
        email: InputSanitizer.sanitizeEmail(validated.email),
        username: InputSanitizer.sanitizeHtml(validated.username),
        password: validated.password, // Don't sanitize password
        confirmPassword: validated.confirmPassword
      };
    }
  },

  // Validate and sanitize search queries
  search: (data: unknown) => {
    const validated = searchSchemas.searchQuery.parse(data);
    return {
      ...validated,
      term: validated.term ? InputSanitizer.sanitizeHtml(validated.term) : undefined,
      country: validated.country ? InputSanitizer.sanitizeHtml(validated.country) : undefined
    };
  }
};

// Export all schemas for use in components
export const schemas = {
  route: routeValidationSchema,
  user: userSchemas,
  search: searchSchemas,
  base: baseSchemas
};
