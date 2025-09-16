/**
 * Ticket Download Utilities
 * Handles downloading tickets from Bussystem API using print_ticket.php endpoint
 */

import { BookingResponse } from '@/types/tripDetail';

export interface TicketDownloadOptions {
  orderId: number;
  security: string;
  lang?: string;
  ticketId?: number; // Optional: for downloading specific ticket
}

export interface TicketDownloadResult {
  success: boolean;
  error?: string;
  url?: string;
}

/**
 * Generate ticket download URL
 */
export function generateTicketUrl(options: TicketDownloadOptions): string {
  const { orderId, security, lang = 'en', ticketId } = options;
  
  const baseUrl = 'https://test-api.bussystem.eu/viev/frame/print_ticket.php';
  const params = new URLSearchParams({
    order_id: orderId.toString(),
    security: security,
    lang: lang
  });
  
  // Add ticket_id if provided (for specific ticket download)
  if (ticketId) {
    params.set('ticket_id', ticketId.toString());
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Download ticket PDF
 */
export async function downloadTicketPDF(options: TicketDownloadOptions): Promise<TicketDownloadResult> {
  try {
    const url = generateTicketUrl(options);
    
    // Open in new tab/window to trigger download
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for this site and try again.'
      };
    }
    
    return {
      success: true,
      url: url
    };
    
  } catch (error) {
    console.error('Error downloading ticket:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Download all tickets for a booking
 */
export async function downloadAllTickets(bookingResponse: BookingResponse): Promise<TicketDownloadResult> {
  if (!bookingResponse.order_id || !bookingResponse.security) {
    return {
      success: false,
      error: 'Missing order ID or security code'
    };
  }
  
  // Use fallback method directly for better error handling
  return downloadTicketWithFallback({
    orderId: bookingResponse.order_id,
    security: bookingResponse.security.toString(),
    lang: bookingResponse.lang || 'en'
  });
}

/**
 * Download specific ticket by ticket ID
 */
export async function downloadSpecificTicket(
  bookingResponse: BookingResponse, 
  ticketId: number
): Promise<TicketDownloadResult> {
  if (!bookingResponse.order_id || !bookingResponse.security) {
    return {
      success: false,
      error: 'Missing order ID or security code'
    };
  }
  
  // Use fallback method directly for better error handling
  return downloadTicketWithFallback({
    orderId: bookingResponse.order_id,
    security: bookingResponse.security.toString(),
    lang: bookingResponse.lang || 'en',
    ticketId: ticketId
  });
}

/**
 * Download tickets with fallback method (server proxy)
 */
export async function downloadTicketWithFallback(options: TicketDownloadOptions): Promise<TicketDownloadResult> {
  try {
    // Use server proxy to avoid CORS issues
    const proxyUrl = new URL('/api/backend/ticket/download', window.location.origin);
    proxyUrl.searchParams.append('order_id', options.orderId.toString());
    proxyUrl.searchParams.append('security', options.security);
    proxyUrl.searchParams.append('lang', options.lang);
    
    if (options.ticketId) {
      proxyUrl.searchParams.append('ticket_id', options.ticketId.toString());
    }
    
    console.log('Downloading ticket via proxy:', proxyUrl.toString());
    
    // Try to fetch the PDF from our server proxy
    const response = await fetch(proxyUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf,application/octet-stream,*/*'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Handle specific error types
      if (errorData.errorType === 'PDF_CREATION_FAILED') {
        throw new Error(`PDF_CREATION_FAILED:${errorData.error}:${errorData.retryAfter || 120}`);
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Check if response is PDF
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      // Create blob and download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `ticket_${options.orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      
      return {
        success: true,
        url: proxyUrl.toString()
      };
    } else {
      // If not PDF, fall back to popup method
      const originalUrl = generateTicketUrl(options);
      const newWindow = window.open(originalUrl, '_blank');
      
      if (!newWindow) {
        return {
          success: false,
          error: 'Popup blocked. Please allow popups for this site and try again.'
        };
      }
      
      return {
        success: true,
        url: originalUrl
      };
    }
    
  } catch (error) {
    console.error('Error downloading ticket with fallback:', error);
    
    // Fallback to popup method if proxy fails
    try {
      const url = generateTicketUrl(options);
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        return {
          success: false,
          error: 'Popup blocked. Please allow popups for this site and try again.'
        };
      }
      
      return {
        success: true,
        url: url
      };
    } catch (popupError) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

/**
 * Get ticket download status
 */
export async function checkTicketAvailability(options: TicketDownloadOptions): Promise<boolean> {
  try {
    const url = generateTicketUrl(options);
    
    // Use GET request with range header to avoid downloading full content
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'Range': 'bytes=0-1023' // Only request first 1KB
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    // Check if response contains error messages
    const text = await response.text();
    if (text.includes('Error creating PDF ticket') || 
        text.includes('Error! Check input parameters') ||
        text.includes('Contact the ticketing agency')) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking ticket availability:', error);
    return false;
  }
}

/**
 * Format ticket filename
 */
export function formatTicketFilename(bookingResponse: BookingResponse, ticketId?: number): string {
  const orderId = bookingResponse.order_id;
  const date = new Date().toISOString().split('T')[0];
  
  if (ticketId) {
    return `ticket_${orderId}_${ticketId}_${date}.pdf`;
  } else {
    return `tickets_${orderId}_${date}.pdf`;
  }
}

/**
 * Diagnose ticket download issues
 */
export async function diagnoseTicketDownload(options: TicketDownloadOptions): Promise<{
  url: string;
  isAvailable: boolean;
  responseStatus: number;
  contentType: string;
  errorMessage?: string;
}> {
  const url = generateTicketUrl(options);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf,application/octet-stream,*/*'
      }
    });
    
    const contentType = response.headers.get('content-type') || 'unknown';
    const responseText = await response.text();
    
    let errorMessage: string | undefined;
    if (responseText.includes('Error creating PDF ticket')) {
      errorMessage = 'PDF creation failed on server';
    } else if (responseText.includes('Error! Check input parameters')) {
      errorMessage = 'Invalid parameters provided';
    } else if (responseText.includes('Contact the ticketing agency')) {
      errorMessage = 'Server-side error - contact support';
    }
    
    return {
      url,
      isAvailable: response.ok && !errorMessage,
      responseStatus: response.status,
      contentType,
      errorMessage
    };
    
  } catch (error) {
    return {
      url,
      isAvailable: false,
      responseStatus: 0,
      contentType: 'error',
      errorMessage: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Check if booking is paid and tickets can be downloaded
 */
export function canDownloadTickets(bookingResponse: BookingResponse): boolean {
  const isPaid = bookingResponse.status === 'buy_ok' || 
                 bookingResponse.status === 'buy' ||
                 bookingResponse.status === 'paid';
  
  return isPaid;
}
