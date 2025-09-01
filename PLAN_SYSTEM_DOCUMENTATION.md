# Bus Plan Visualization System - Complete Documentation

## Overview

This system provides comprehensive bus plan visualization capabilities for the Starlight Routes application. It includes XML API integration, intelligent caching, seat selection, and interactive visualization components.

## System Architecture

### Core Components

1. **Type Definitions** (`src/types/getPlan.ts`)
   - Complete TypeScript interfaces for all API responses
   - Seat and floor definitions
   - Configuration and state management types

2. **HTTP Client** (`src/lib/getPlanHttp.ts`)
   - Raw API communication with XML/JSON support
   - Rate limiting and error handling
   - Automatic retries and timeout management

3. **Data Normalization** (`src/lib/normalizePlan.ts`)
   - XML to JSON conversion
   - Support for API versions 1.1 and 2.0
   - Seat layout parsing and validation

4. **Intelligent Caching** (`src/lib/planCache.ts`)
   - TTL-based cache with automatic cleanup
   - Memory management and statistics
   - Background preloading support

5. **Main API Client** (`src/lib/planApi.ts`)
   - High-level API for plan management
   - Batch operations and analysis tools
   - Error handling and logging

6. **React Visualization** (`src/components/BusPlanVisualization.tsx`)
   - Interactive seat selection
   - Multi-floor navigation
   - Zoom and orientation controls

7. **Demo Page** (`src/pages/PlanDemo.tsx`)
   - Complete demonstration interface
   - Configuration testing
   - Performance monitoring

## API Integration

### Supported Endpoints

The system works with the `get_plan` API endpoint that provides bus layout information:

```
POST /api/v1/get_plan
```

### Request Parameters

```typescript
interface PlanRequest {
  bus_type_id: string;    // Bus type identifier
  orientation?: 'h' | 'v'; // Layout orientation (default: 'h')
  version?: 1.1 | 2.0;    // API version (default: 2.0)
}
```

### Response Formats

The API supports both XML and JSON responses. The system automatically handles both formats and normalizes them to a consistent structure.

## Usage Examples

### Basic Plan Loading

```typescript
import { getBusPlan } from '@/lib/planApi';

// Load a specific bus plan
const result = await getBusPlan('22', {
  orientation: 'h',
  version: 2.0,
  useCache: true
});

if (result.success && result.data) {
  console.log('Plan loaded:', result.data.plan);
}
```

### React Component Integration

```tsx
import { BusPlanVisualization } from '@/components/BusPlanVisualization';
import { useState } from 'react';

const MyComponent = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  return (
    <BusPlanVisualization
      plan={busPlan}
      config={{
        orientation: 'h',
        showSeatNumbers: true,
        enableSelection: true,
        maxSelections: 4
      }}
      selectionState={{
        selectedSeats,
        maxSeats: 4
      }}
      onSelectionChange={setSelectedSeats}
      showControls={true}
      showStatistics={true}
    />
  );
};
```

### Batch Operations

```typescript
import { preloadBusPlans, getBusPlanCacheStats } from '@/lib/planApi';

// Preload multiple plans
const busTypeIds = ['1', '2', '22', '15'];
const result = await preloadBusPlans(busTypeIds, {
  orientation: 'h',
  version: 2.0
});

console.log(`Preloaded ${result.success} plans, ${result.failed} failed`);

// Check cache performance
const stats = getBusPlanCacheStats();
console.log(`Cache hit rate: ${stats.hit_rate}%`);
```

### Plan Analysis

```typescript
import { analyzeBusPlan } from '@/lib/planApi';

const analysis = analyzeBusPlan(busPlan);
console.log('Total seats:', analysis.statistics.totalSeats);
console.log('Available seats:', analysis.statistics.availableSeats);
console.log('Layout complexity:', analysis.insights.planComplexity);
```

## Configuration Options

### Plan Visualization Config

```typescript
interface BusPlanConfig {
  orientation: 'h' | 'v';           // Layout orientation
  version: 1.1 | 2.0;               // API version
  showSeatNumbers: boolean;         // Display seat numbers
  enableSelection: boolean;         // Allow seat selection
  selectionMode: 'single' | 'multiple'; // Selection mode
  maxSelections?: number;           // Maximum selectable seats
  seatSize: 'small' | 'medium' | 'large'; // Visual seat size
  colorScheme: 'default' | 'contrast' | 'colorblind'; // Color scheme
}
```

### Cache Configuration

```typescript
interface CacheConfig {
  ttl: number;                      // Time to live in milliseconds
  maxEntries: number;               // Maximum cached entries
  cleanupInterval: number;          // Cleanup interval in milliseconds
}
```

## Error Handling

The system includes comprehensive error handling at multiple levels:

### API Errors

```typescript
interface PlanApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}
```

### Common Error Codes

- `NETWORK_ERROR`: Network connectivity issues
- `TIMEOUT_ERROR`: Request timeout
- `PARSE_ERROR`: XML/JSON parsing failed
- `VALIDATION_ERROR`: Data validation failed
- `CACHE_ERROR`: Cache operation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests

### Error Recovery

The system automatically handles:
- Network timeouts with exponential backoff
- Rate limiting with request queuing
- Cache failures with direct API fallback
- XML parsing errors with format detection

## Performance Optimization

### Caching Strategy

1. **Memory Cache**: Fast access to recently used plans
2. **TTL Management**: Automatic expiration of stale data
3. **Preloading**: Background loading of common plans
4. **Compression**: Efficient memory usage for large plans

### Request Optimization

1. **Rate Limiting**: Prevents API overload
2. **Request Deduplication**: Avoids duplicate requests
3. **Batch Loading**: Efficient bulk operations
4. **Connection Pooling**: Reuses HTTP connections

### Rendering Optimization

1. **Virtual Scrolling**: Handles large seat layouts
2. **Memoization**: Prevents unnecessary re-renders
3. **Lazy Loading**: Loads floors on demand
4. **Progressive Enhancement**: Graceful degradation

## Testing

### Demo Page Features

Access the demo at `/plan-demo` to test:

1. **Bus Type Selection**: Choose from predefined or custom bus types
2. **Configuration Testing**: Adjust all visualization settings
3. **Performance Monitoring**: View cache statistics and performance metrics
4. **Error Simulation**: Test error handling scenarios

### Test Bus Types

The demo includes several test bus types:
- `1`: Standard City Bus (45 seats)
- `2`: Double Decker (80 seats)
- `22`: Minibus (25 seats)
- `15`: Express Bus (50 seats)

### Integration Testing

```typescript
// Test plan loading
await getBusPlan('22');

// Test seat selection
const plan = await getBusPlan('22');
// Select seats and verify state

// Test cache performance
const stats = getBusPlanCacheStats();
// Verify hit rates and performance
```

## Security Considerations

### API Security

1. **CORS Configuration**: Proper cross-origin setup required
2. **Rate Limiting**: Prevents abuse and overload
3. **Input Validation**: Sanitizes all user inputs
4. **Error Sanitization**: Prevents information leakage

### Data Protection

1. **Cache Security**: No sensitive data in memory cache
2. **Request Logging**: Configurable logging levels
3. **Error Reporting**: Safe error messages for users

## Monitoring and Analytics

### Performance Metrics

1. **API Response Times**: Track request latency
2. **Cache Hit Rates**: Monitor cache effectiveness
3. **Error Rates**: Track and analyze failures
4. **Memory Usage**: Monitor cache memory consumption

### User Analytics

1. **Seat Selection Patterns**: Track user preferences
2. **Plan Usage**: Monitor popular bus types
3. **Performance Impact**: Measure user experience

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure proxy in `vite.config.ts`
2. **Timeout Issues**: Adjust timeout settings in HTTP client
3. **Memory Leaks**: Monitor cache cleanup and clear when needed
4. **XML Parsing**: Check API response format and version

### Debug Mode

Enable debug logging:

```typescript
localStorage.setItem('debug-bus-plans', 'true');
```

### Performance Issues

1. Check cache hit rates
2. Monitor API response times
3. Verify memory usage
4. Check network connectivity

## API Proxy Configuration

For development, add to `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://your-api-server.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
```

## Future Enhancements

### Planned Features

1. **Real-time Updates**: WebSocket integration for live seat status
2. **Accessibility**: Enhanced screen reader support
3. **Mobile Optimization**: Touch-friendly interactions
4. **Offline Support**: Service worker integration
5. **Advanced Analytics**: Detailed usage tracking

### Performance Improvements

1. **Service Worker Caching**: Browser-level caching
2. **Compression**: Gzip response compression
3. **CDN Integration**: Static asset optimization
4. **Progressive Loading**: Incremental plan loading

## Contributing

### Code Standards

1. Follow TypeScript strict mode
2. Use ESLint and Prettier
3. Write comprehensive tests
4. Document all public APIs

### Testing Requirements

1. Unit tests for all utility functions
2. Integration tests for API calls
3. Component tests for React components
4. E2E tests for critical user flows

This documentation provides a complete guide to the bus plan visualization system. For specific implementation details, refer to the individual source files and their inline documentation.
