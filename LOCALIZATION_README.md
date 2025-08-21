# 🌍 Localization & Currency System - Starlines

## 📋 Overview

The Starlines application now includes a comprehensive localization and currency system that allows users to switch between different languages and currencies seamlessly.

## 🚀 Features Implemented

### 🌐 Language Support
- **Romanian (RO)** 🇷🇴 - Default language
- **Russian (RU)** 🇷🇺 - Full translation support
- **English (EN)** 🇬🇧 - Complete localization

### 💰 Currency Support
- **Euro (EUR)** 🇪🇺 - Default currency
- **Moldovan Leu (MDL)** 🇲🇩 - Local currency
- **US Dollar (USD)** 🇺🇸 - International currency
- **Romanian Leu (RON)** 🇷🇴 - Regional currency

### 🔄 Real-time Conversion
- Automatic currency conversion based on exchange rates
- Dynamic price formatting across all components
- Persistent user preferences (stored in localStorage)

## 🏗️ Architecture

### Context Provider
```typescript
// src/contexts/LocalizationContext.tsx
export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Manages language and currency state
  // Provides conversion and formatting functions
  // Handles localStorage persistence
}
```

### Hook Usage
```typescript
import { useLocalization } from "@/contexts/LocalizationContext";

const MyComponent = () => {
  const { 
    currentLanguage, 
    setLanguage, 
    currentCurrency, 
    setCurrency,
    formatPrice,
    t 
  } = useLocalization();
  
  // Use localization functions
};
```

## 📱 UI Components

### Header Dropdowns
- **Language Selector**: Globe icon with flag and language code
- **Currency Selector**: Credit card icon with flag and currency code
- Responsive design (shows full text on larger screens)

### Dropdown Content
Each dropdown shows:
- Flag emoji for visual identification
- Full language/currency name
- Code abbreviation in parentheses
- Hover effects and smooth transitions

## 🎯 Key Functions

### Language Management
```typescript
// Switch language
setLanguage('en'); // Changes to English

// Get language info
getLanguageName('ru'); // Returns "Русский"
getLanguageFlag('en'); // Returns "🇬🇧"
```

### Currency Management
```typescript
// Switch currency
setCurrency('MDL'); // Changes to Moldovan Leu

// Get currency info
getCurrencySymbol('USD'); // Returns "$"
getCurrencyFlag('RON'); // Returns "🇷🇴"
```

### Price Formatting
```typescript
// Format prices in current currency
formatPrice(150.50); // Returns "€150.50" (EUR), "150.50 L" (MDL), etc.

// Convert between currencies
convertCurrency(100, 'EUR', 'MDL'); // Returns 1950 (based on exchange rates)
```

### Translation
```typescript
// Get translated text
t('header.home'); // Returns "Acasă" (RO), "Главная" (RU), "Home" (EN)
```

## 🔧 Implementation Details

### Exchange Rates (Mock Data)
```typescript
const EXCHANGE_RATES = {
  EUR: { EUR: 1, MDL: 19.5, USD: 1.08, RON: 4.97 },
  MDL: { EUR: 0.051, MDL: 1, USD: 0.055, RON: 0.255 },
  USD: { EUR: 0.93, MDL: 18.1, USD: 1, RON: 4.6 },
  RON: { EUR: 0.201, MDL: 3.92, USD: 0.217, RON: 1 }
};
```

### Price Formatting Rules
- **EUR/USD**: Symbol before amount (€150.50, $150.50)
- **MDL/RON**: Symbol after amount (150.50 L, 150.50 Lei)
- Automatic decimal places (2 decimals)
- Currency-specific formatting

### Persistence
- Language preference stored in `localStorage['starlines-language']`
- Currency preference stored in `localStorage['starlines-currency']`
- Settings persist across browser sessions

## 📱 Responsive Design

### Desktop
- Full language names and currency codes visible
- Hover effects on dropdowns
- Tooltips for additional information

### Mobile
- Compact display with flags and codes
- Touch-friendly dropdown interactions
- Optimized for small screens

## 🎨 Styling

### Design System Integration
- Uses existing Tailwind CSS classes
- Consistent with Starlines design language
- Smooth transitions and animations
- Accessible color contrasts

### Visual Elements
- Flag emojis for immediate recognition
- Icons (Globe for language, CreditCard for currency)
- Hover states and focus indicators
- Consistent spacing and typography

## 🔄 State Management

### React Context
- Centralized state management
- Automatic re-renders when preferences change
- Efficient updates across components

### Local Storage
- Persistent user preferences
- No server-side storage required
- Fast initialization on app load

## 📊 Usage Examples

### Component Integration
```typescript
// Before (hardcoded)
<span>€150.50</span>

// After (localized)
<span>{formatPrice(150.50)}</span>
```

### Dynamic Content
```typescript
// Before (hardcoded)
<h1>Acasă</h1>

// After (localized)
<h1>{t('header.home')}</h1>
```

### Currency Conversion
```typescript
// Display price in user's preferred currency
const displayPrice = formatPrice(route.price);

// Convert price for calculations
const priceInMDL = convertCurrency(route.price, 'EUR', 'MDL');
```

## 🚀 Future Enhancements

### Planned Features
- **Real-time exchange rates** from external APIs
- **More languages** (German, French, Italian)
- **Regional formatting** (date, time, number formats)
- **RTL support** for Arabic/Hebrew
- **Currency symbols** in price inputs

### API Integration
- **Exchange rate services** (Fixer.io, CurrencyAPI)
- **Geolocation-based** default settings
- **User preference sync** across devices

## 🧪 Testing

### Manual Testing
1. **Language switching**: Change language and verify all text updates
2. **Currency switching**: Change currency and verify price formatting
3. **Persistence**: Refresh page and verify preferences are maintained
4. **Responsiveness**: Test on different screen sizes

### Automated Testing
- Unit tests for conversion functions
- Integration tests for context provider
- E2E tests for user interactions

## 📝 Notes

### Performance
- Minimal impact on bundle size
- Efficient re-renders with React.memo
- Lazy loading for large translation files

### Accessibility
- Screen reader friendly
- Keyboard navigation support
- High contrast ratios
- ARIA labels for dropdowns

### Browser Support
- Modern browsers (ES6+)
- LocalStorage support required
- Fallback to default values if needed

---

**Implementation Date**: January 2024  
**Status**: ✅ Complete and Functional  
**Next Milestone**: Real-time exchange rates integration
