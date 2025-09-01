// Reservation timer management for new_order system
// Handles countdown timers, expiration, and notifications

import type { 
  ReservationTimer, 
  ReservationInfo,
  OrderCreationResult 
} from '@/types/newOrder';

// Global timer storage
const activeTimers = new Map<number, ReservationTimer>();

/**
 * Create and start a reservation timer
 */
export function startReservationTimer(
  reservation: ReservationInfo,
  options: {
    onUpdate?: (remainingMinutes: number, remainingSeconds: number) => void;
    onExpired?: () => void;
    updateInterval?: number; // milliseconds
  } = {}
): ReservationTimer {
  const { onUpdate, onExpired, updateInterval = 1000 } = options;
  
  // Calculate end time
  const reservationMinutes = parseInt(reservation.reservation_until_min) || 20;
  const endTime = Date.now() + (reservationMinutes * 60 * 1000);
  
  // Stop existing timer for this order if any
  stopReservationTimer(reservation.order_id);
  
  // Create timer
  const intervalId = setInterval(() => {
    const remaining = endTime - Date.now();
    
    if (remaining <= 0) {
      // Timer expired
      handleTimerExpired(reservation.order_id);
    } else {
      // Update countdown
      const remainingMinutes = Math.floor(remaining / 60000);
      const remainingSeconds = Math.floor((remaining % 60000) / 1000);
      
      if (onUpdate) {
        onUpdate(remainingMinutes, remainingSeconds);
      }
    }
  }, updateInterval);
  
  const timer: ReservationTimer = {
    orderId: reservation.order_id,
    endTime,
    intervalId,
    onExpired,
    onUpdate
  };
  
  // Store timer
  activeTimers.set(reservation.order_id, timer);
  
  console.log(`Started reservation timer for order ${reservation.order_id}, expires in ${reservationMinutes} minutes`);
  
  return timer;
}

/**
 * Stop a reservation timer
 */
export function stopReservationTimer(orderId: number): boolean {
  const timer = activeTimers.get(orderId);
  
  if (timer) {
    clearInterval(timer.intervalId);
    activeTimers.delete(orderId);
    console.log(`Stopped reservation timer for order ${orderId}`);
    return true;
  }
  
  return false;
}

/**
 * Get remaining time for a reservation
 */
export function getRemainingTime(orderId: number): {
  minutes: number;
  seconds: number;
  total_ms: number;
  expired: boolean;
} | null {
  const timer = activeTimers.get(orderId);
  
  if (!timer) {
    return null;
  }
  
  const remaining = timer.endTime - Date.now();
  
  if (remaining <= 0) {
    return {
      minutes: 0,
      seconds: 0,
      total_ms: 0,
      expired: true
    };
  }
  
  return {
    minutes: Math.floor(remaining / 60000),
    seconds: Math.floor((remaining % 60000) / 1000),
    total_ms: remaining,
    expired: false
  };
}

/**
 * Handle timer expiration
 */
function handleTimerExpired(orderId: number): void {
  const timer = activeTimers.get(orderId);
  
  if (timer) {
    console.log(`Reservation timer expired for order ${orderId}`);
    
    // Call expiration callback
    if (timer.onExpired) {
      timer.onExpired();
    }
    
    // Clean up timer
    clearInterval(timer.intervalId);
    activeTimers.delete(orderId);
    
    // Emit global event for other components
    dispatchTimerExpiredEvent(orderId);
  }
}

/**
 * Dispatch timer expired event
 */
function dispatchTimerExpiredEvent(orderId: number): void {
  const event = new CustomEvent('reservationExpired', {
    detail: { orderId }
  });
  
  window.dispatchEvent(event);
}

/**
 * Get all active timers
 */
export function getActiveTimers(): ReservationTimer[] {
  return Array.from(activeTimers.values());
}

/**
 * Stop all active timers
 */
export function stopAllTimers(): void {
  activeTimers.forEach(timer => {
    clearInterval(timer.intervalId);
  });
  
  activeTimers.clear();
  console.log('Stopped all reservation timers');
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(
  minutes: number, 
  seconds: number,
  format: 'short' | 'long' = 'short'
): string {
  if (format === 'long') {
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  }
  
  // Short format: MM:SS
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Check if reservation is about to expire
 */
export function isExpirationWarning(remainingMs: number, warningThresholdMs: number = 300000): boolean {
  return remainingMs <= warningThresholdMs && remainingMs > 0; // 5 minutes default
}

/**
 * Create reservation timer with automatic UI updates
 */
export function createTimerWithUI(
  reservation: ReservationInfo,
  elementId: string,
  options: {
    onExpired?: () => void;
    warningThreshold?: number; // milliseconds
    format?: 'short' | 'long';
  } = {}
): ReservationTimer {
  const { onExpired, warningThreshold = 300000, format = 'short' } = options;
  const element = document.getElementById(elementId);
  
  return startReservationTimer(reservation, {
    onUpdate: (minutes, seconds) => {
      if (element) {
        const timeText = formatRemainingTime(minutes, seconds, format);
        element.textContent = timeText;
        
        // Add warning class if close to expiration
        const remainingMs = (minutes * 60 + seconds) * 1000;
        if (isExpirationWarning(remainingMs, warningThreshold)) {
          element.classList.add('timer-warning');
        } else {
          element.classList.remove('timer-warning');
        }
      }
    },
    onExpired: () => {
      if (element) {
        element.textContent = 'EXPIRED';
        element.classList.add('timer-expired');
      }
      
      if (onExpired) {
        onExpired();
      }
    }
  });
}

/**
 * Create order with automatic timer start
 */
export function createOrderWithTimer(
  orderResult: OrderCreationResult,
  timerOptions: {
    onUpdate?: (minutes: number, seconds: number) => void;
    onExpired?: () => void;
    autoStart?: boolean;
  } = {}
): OrderCreationResult {
  const { onUpdate, onExpired, autoStart = true } = timerOptions;
  
  if (orderResult.success && orderResult.reservation && autoStart) {
    const timer = startReservationTimer(orderResult.reservation, {
      onUpdate,
      onExpired
    });
    
    return {
      ...orderResult,
      timer
    };
  }
  
  return orderResult;
}

/**
 * Extend reservation time (if supported by API)
 */
export function extendReservation(
  orderId: number,
  additionalMinutes: number
): boolean {
  const timer = activeTimers.get(orderId);
  
  if (timer) {
    // Extend the end time
    timer.endTime += additionalMinutes * 60 * 1000;
    console.log(`Extended reservation for order ${orderId} by ${additionalMinutes} minutes`);
    return true;
  }
  
  return false;
}

/**
 * Get timer statistics
 */
export function getTimerStats(): {
  active_timers: number;
  total_reservations: number;
  expired_today: number;
} {
  // This would typically come from a more sophisticated tracking system
  return {
    active_timers: activeTimers.size,
    total_reservations: activeTimers.size, // Simplified
    expired_today: 0 // Would need persistent storage to track
  };
}

/**
 * Setup event listeners for page visibility changes
 * Prevents timers from running in background tabs
 */
export function setupVisibilityHandling(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden - could pause intensive updates
      console.log('Page hidden - timers continue running');
    } else {
      // Page is visible - ensure timers are accurate
      console.log('Page visible - refreshing all timers');
      
      // Force update all timers
      activeTimers.forEach(timer => {
        const remaining = getRemainingTime(timer.orderId);
        if (remaining && timer.onUpdate) {
          timer.onUpdate(remaining.minutes, remaining.seconds);
        }
      });
    }
  });
}

/**
 * Cleanup function for component unmount
 */
export function cleanupTimers(): void {
  stopAllTimers();
}
