import { authService, User, UserRole } from "./auth";

// Audit event types
export enum AuditEventType {
  // Authentication events
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
  USER_LOGIN_FAILED = "user_login_failed",
  USER_REGISTER = "user_register",
  PASSWORD_CHANGE = "password_change",
  PASSWORD_RESET = "password_reset",
  
  // Route management events
  ROUTE_CREATED = "route_created",
  ROUTE_UPDATED = "route_updated",
  ROUTE_DELETED = "route_deleted",
  ROUTE_VISIBILITY_CHANGED = "route_visibility_changed",
  ROUTE_BULK_OPERATION = "route_bulk_operation",
  
  // User management events
  USER_CREATED = "user_created",
  USER_UPDATED = "user_updated",
  USER_DELETED = "user_deleted",
  USER_ROLE_CHANGED = "user_role_changed",
  USER_ACTIVATED = "user_activated",
  USER_DEACTIVATED = "user_deactivated",
  
  // System events
  SYSTEM_CONFIG_CHANGED = "system_config_changed",
  BACKUP_CREATED = "backup_created",
  BACKUP_RESTORED = "backup_restored",
  MAINTENANCE_MODE = "maintenance_mode",
  
  // Security events
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  INVALID_TOKEN = "invalid_token",
  CSRF_VIOLATION = "csrf_violation",
  XSS_ATTEMPT = "xss_attempt",
  SQL_INJECTION_ATTEMPT = "sql_injection_attempt",
  
  // Data access events
  DATA_EXPORTED = "data_exported",
  DATA_IMPORTED = "data_imported",
  BULK_DATA_ACCESS = "bulk_data_access",
  SENSITIVE_DATA_ACCESS = "sensitive_data_access"
}

// Audit event severity levels
export enum AuditSeverity {
  INFO = "info",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

// Audit event interface
export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  severity: AuditSeverity;
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
  details: Record<string, unknown>;
  metadata: {
    requestId?: string;
    correlationId?: string;
    source: string;
    version: string;
  };
}

// Audit context for tracking request information
export interface AuditContext {
  requestId: string;
  correlationId: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  timestamp: string;
}

// Audit logger class
export class AuditLogger {
  private static instance: AuditLogger;
  private events: AuditEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory
  private listeners: ((event: AuditEvent) => void)[] = [];
  
  private constructor() {
    // Load events from localStorage on initialization
    this.loadFromStorage();
    
    // Set up periodic cleanup
    setInterval(() => this.cleanup(), 24 * 60 * 60 * 1000); // Daily cleanup
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  // Log an audit event
  public log(
    eventType: AuditEventType,
    severity: AuditSeverity,
    details: Record<string, unknown>,
    context?: Partial<AuditContext>,
    resourceType?: string,
    resourceId?: string,
    action?: string
  ): void {
    const currentUser = authService.getCurrentUser();
    const now = new Date().toISOString();
    
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: now,
      eventType,
      severity,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      userRole: currentUser?.role,
      ipAddress: context?.ipAddress || this.getClientIP(),
      userAgent: context?.userAgent || this.getUserAgent(),
      sessionId: context?.sessionId || this.getSessionId(),
      resourceType,
      resourceId,
      action,
      details: this.sanitizeDetails(details),
      metadata: {
        requestId: context?.requestId || this.generateRequestId(),
        correlationId: context?.correlationId || this.generateCorrelationId(),
        source: "starlines-frontend",
        version: "1.0.0"
      }
    };

    // Add to memory
    this.events.push(event);
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    // Save to storage
    this.saveToStorage();
    
    // Notify listeners
    this.notifyListeners(event);
    
    // Log to console in development
    if (import.meta.env?.DEV) {
      console.log(`[AUDIT] ${eventType}:`, event);
    }
    
    // Send to external monitoring service in production
    if (import.meta.env?.PROD) {
      this.sendToMonitoringService(event);
    }
  }

  // Log authentication events
  public logAuthEvent(
    eventType: AuditEventType.USER_LOGIN | AuditEventType.USER_LOGOUT | AuditEventType.USER_LOGIN_FAILED,
    userEmail: string,
    details: Record<string, unknown> = {}
  ): void {
    const severity = eventType === AuditEventType.USER_LOGIN_FAILED ? AuditSeverity.MEDIUM : AuditSeverity.INFO;
    
    this.log(eventType, severity, {
      ...details,
      userEmail,
      authenticationMethod: "email_password"
    });
  }

  // Log route management events
  public logRouteEvent(
    eventType: AuditEventType.ROUTE_CREATED | AuditEventType.ROUTE_UPDATED | AuditEventType.ROUTE_DELETED | AuditEventType.ROUTE_VISIBILITY_CHANGED,
    routeId: string,
    routeDetails: Record<string, unknown>,
    action?: string
  ): void {
    const severity = eventType === AuditEventType.ROUTE_DELETED ? AuditSeverity.MEDIUM : AuditSeverity.INFO;
    
    this.log(eventType, severity, {
      routeId,
      routeDetails: this.sanitizeRouteDetails(routeDetails),
      action
    }, undefined, "route", routeId, action);
  }

  // Log security events
  public logSecurityEvent(
    eventType: AuditEventType.SUSPICIOUS_ACTIVITY | AuditEventType.RATE_LIMIT_EXCEEDED | AuditEventType.INVALID_TOKEN | AuditEventType.CSRF_VIOLATION | AuditEventType.XSS_ATTEMPT | AuditEventType.SQL_INJECTION_ATTEMPT,
    details: Record<string, unknown>
  ): void {
    const severity = this.getSecurityEventSeverity(eventType);
    
    this.log(eventType, severity, {
      ...details,
      securityThreat: true,
      timestamp: new Date().toISOString()
    });
  }

  // Log data access events
  public logDataAccessEvent(
    eventType: AuditEventType.DATA_EXPORTED | AuditEventType.DATA_IMPORTED | AuditEventType.BULK_DATA_ACCESS | AuditEventType.SENSITIVE_DATA_ACCESS,
    resourceType: string,
    resourceId: string,
    details: Record<string, unknown>
  ): void {
    const severity = eventType === AuditEventType.SENSITIVE_DATA_ACCESS ? AuditSeverity.HIGH : AuditSeverity.INFO;
    
    this.log(eventType, severity, {
      ...details,
      dataAccessType: eventType,
      dataVolume: details.recordCount || 0
    }, undefined, resourceType, resourceId, "data_access");
  }

  // Get events with filtering
  public getEvents(filters?: {
    eventType?: AuditEventType;
    severity?: AuditSeverity;
    userId?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): AuditEvent[] {
    let filtered = [...this.events];

    if (filters?.eventType) {
      filtered = filtered.filter(event => event.eventType === filters.eventType);
    }

    if (filters?.severity) {
      filtered = filtered.filter(event => event.severity === filters.severity);
    }

    if (filters?.userId) {
      filtered = filtered.filter(event => event.userId === filters.userId);
    }

    if (filters?.resourceType) {
      filtered = filtered.filter(event => event.resourceType === filters.resourceType);
    }

    if (filters?.resourceId) {
      filtered = filtered.filter(event => event.resourceId === filters.resourceId);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(event => event.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter(event => event.timestamp <= filters.endDate!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply limit
    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }

  // Get events summary statistics
  public getEventsSummary(): {
    total: number;
    byType: Record<AuditEventType, number>;
    bySeverity: Record<AuditSeverity, number>;
    byUser: Record<string, number>;
    recentActivity: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const byType: Record<AuditEventType, number> = {} as Record<AuditEventType, number>;
    const bySeverity: Record<AuditSeverity, number> = {} as Record<AuditSeverity, number>;
    const byUser: Record<string, number> = {};
    
    let recentActivity = 0;

    this.events.forEach(event => {
      // Count by type
      byType[event.eventType] = (byType[event.eventType] || 0) + 1;
      
      // Count by severity
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      
      // Count by user
      if (event.userId) {
        byUser[event.userId] = (byUser[event.userId] || 0) + 1;
      }
      
      // Count recent activity
      if (new Date(event.timestamp) > oneHourAgo) {
        recentActivity++;
      }
    });

    return {
      total: this.events.length,
      byType,
      bySeverity,
      byUser,
      recentActivity
    };
  }

  // Export events for analysis
  public exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.eventsToCSV();
    }
    
    return JSON.stringify(this.events, null, 2);
  }

  // Clear all events
  public clearEvents(): void {
    this.events = [];
    this.saveToStorage();
  }

  // Add event listener
  public addListener(listener: (event: AuditEvent) => void): void {
    this.listeners.push(listener);
  }

  // Remove event listener
  public removeListener(listener: (event: AuditEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Private methods
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIP(): string {
    // In a real application, this would come from the request headers
    // For now, return a placeholder
    return "127.0.0.1";
  }

  private getUserAgent(): string {
    return navigator.userAgent || "unknown";
  }

  private getSessionId(): string {
    // Generate a session ID if not exists
    let sessionId = sessionStorage.getItem('starlines_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('starlines_session_id', sessionId);
    }
    return sessionId;
  }

  private sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };
    
    // Remove sensitive information
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.apiKey;
    
    // Sanitize email addresses (keep domain, mask local part)
    if (sanitized.email && typeof sanitized.email === 'string') {
      const [local, domain] = sanitized.email.split('@');
      if (local && domain) {
        sanitized.email = `${local.charAt(0)}***@${domain}`;
      }
    }
    
    // Sanitize phone numbers
    if (sanitized.phone && typeof sanitized.phone === 'string') {
      sanitized.phone = sanitized.phone.replace(/\d(?=\d{4})/g, '*');
    }
    
    return sanitized;
  }

  private sanitizeRouteDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };
    
    // Remove sensitive route information if needed
    // For now, keep all route details as they're not sensitive
    
    return sanitized;
  }

  private getSecurityEventSeverity(eventType: AuditEventType): AuditSeverity {
    switch (eventType) {
      case AuditEventType.XSS_ATTEMPT:
      case AuditEventType.SQL_INJECTION_ATTEMPT:
        return AuditSeverity.CRITICAL;
      case AuditEventType.CSRF_VIOLATION:
      case AuditEventType.SUSPICIOUS_ACTIVITY:
        return AuditSeverity.HIGH;
      case AuditEventType.RATE_LIMIT_EXCEEDED:
      case AuditEventType.INVALID_TOKEN:
        return AuditSeverity.MEDIUM;
      default:
        return AuditSeverity.LOW;
    }
  }

  private notifyListeners(event: AuditEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in audit event listener:', error);
      }
    });
  }

  private sendToMonitoringService(event: AuditEvent): void {
    // In production, send to external monitoring service
    // For now, just log to console
    console.log('Sending audit event to monitoring service:', event.eventType);
  }

  private cleanup(): void {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    this.events = this.events.filter(event => 
      new Date(event.timestamp) > oneMonthAgo
    );
    
    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('starlines_audit_events', JSON.stringify(this.events));
      } catch (error) {
        console.error('Failed to save audit events to storage:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const eventsStr = localStorage.getItem('starlines_audit_events');
        if (eventsStr) {
          this.events = JSON.parse(eventsStr);
        }
      } catch (error) {
        console.error('Failed to load audit events from storage:', error);
        this.events = [];
      }
    }
  }

  private eventsToCSV(): string {
    if (this.events.length === 0) return '';
    
    const headers = Object.keys(this.events[0]).join(',');
    const rows = this.events.map(event => 
      Object.values(event).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Utility functions for common audit operations
export const auditUtils = {
  // Log route creation
  logRouteCreated: (routeId: string, routeDetails: Record<string, unknown>) => {
    auditLogger.logRouteEvent(AuditEventType.ROUTE_CREATED, routeId, routeDetails, "create");
  },

  // Log route update
  logRouteUpdated: (routeId: string, routeDetails: Record<string, unknown>, changes: Record<string, unknown>) => {
    auditLogger.logRouteEvent(AuditEventType.ROUTE_UPDATED, routeId, {
      ...routeDetails,
      changes
    }, "update");
  },

  // Log route deletion
  logRouteDeleted: (routeId: string, routeDetails: Record<string, unknown>) => {
    auditLogger.logRouteEvent(AuditEventType.ROUTE_DELETED, routeId, routeDetails, "delete");
  },

  // Log route visibility change
  logRouteVisibilityChanged: (routeId: string, isHidden: boolean, reason?: string) => {
    auditLogger.logRouteEvent(AuditEventType.ROUTE_VISIBILITY_CHANGED, routeId, {
      isHidden,
      reason
    }, "visibility_change");
  },

  // Log security violation
  logSecurityViolation: (eventType: AuditEventType.SUSPICIOUS_ACTIVITY | AuditEventType.RATE_LIMIT_EXCEEDED | AuditEventType.INVALID_TOKEN | AuditEventType.CSRF_VIOLATION | AuditEventType.XSS_ATTEMPT | AuditEventType.SQL_INJECTION_ATTEMPT, details: Record<string, unknown>) => {
    auditLogger.logSecurityEvent(eventType, details);
  },

  // Log data access
  logDataAccess: (eventType: AuditEventType.DATA_EXPORTED | AuditEventType.DATA_IMPORTED | AuditEventType.BULK_DATA_ACCESS | AuditEventType.SENSITIVE_DATA_ACCESS, resourceType: string, resourceId: string, details: Record<string, unknown>) => {
    auditLogger.logDataAccessEvent(eventType, resourceType, resourceId, details);
  }
};
