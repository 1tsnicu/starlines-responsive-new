// Print ticket utilities for Bussystem integration
// Provides helper functions to generate print links for tickets

// Types for buy_ticket response
interface BuyTicketPassengerData {
  passenger_id: number;
  ticket_id: string;
  security: string;
  link: string;
  price: number;
  currency: string;
  baggage?: Array<{
    baggage_title: string;
    price: number;
    currency: string;
  }>;
}

interface BuyTicketResponse {
  order_id: number;
  link: string;
  security?: string;
  price_total: number;
  currency: string;
  [key: string]: unknown; // For numeric keys "0", "1", "2", etc.
}

/** Link pentru toate biletele dintr-o comandă */
export function buildOrderPrintLink(args: {
  order_id: number | string;
  security: string;
  lang?: string; // "ru" | "en" | ...
  base?: string; // pentru test/prod override
}) {
  const { order_id, security, lang = "ru", base = "https://test-api.bussystem.eu" } = args;
  return `${base}/viev/frame/print_ticket.php?order_id=${encodeURIComponent(
    String(order_id)
  )}&security=${encodeURIComponent(security)}&lang=${encodeURIComponent(lang)}`;
}

/** Link pentru un bilet individual */
export function buildTicketPrintLink(args: {
  ticket_id: number | string;
  security: string;
  lang?: string;
  base?: string;
}) {
  const { ticket_id, security, lang = "ru", base = "https://test-api.bussystem.eu" } = args;
  return `${base}/viev/frame/print_ticket.php?ticket_id=${encodeURIComponent(
    String(ticket_id)
  )}&security=${encodeURIComponent(security)}&lang=${encodeURIComponent(lang)}`;
}

/** Extract passenger tickets from buy_ticket response */
export function extractPassengerTickets(buyTicketResponse: BuyTicketResponse): Array<{
  passengerIndex: number;
  passenger_id: number;
  ticket_id: string;
  security: string;
  link: string;
  price: number;
  currency: string;
  baggage?: Array<{
    baggage_title: string;
    price: number;
    currency: string;
  }>;
}> {
  const tickets: Array<{
    passengerIndex: number;
    passenger_id: number;
    ticket_id: string;
    security: string;
    link: string;
    price: number;
    currency: string;
    baggage?: Array<{
      baggage_title: string;
      price: number;
      currency: string;
    }>;
  }> = [];

  // Look for numeric keys "0", "1", "2", etc.
  for (const key of Object.keys(buyTicketResponse)) {
    if (/^\d+$/.test(key)) {
      const passengerData = buyTicketResponse[key] as BuyTicketPassengerData;
      if (passengerData?.ticket_id && passengerData?.link) {
        tickets.push({
          passengerIndex: parseInt(key, 10),
          passenger_id: passengerData.passenger_id,
          ticket_id: passengerData.ticket_id,
          security: passengerData.security,
          link: passengerData.link,
          price: passengerData.price,
          currency: passengerData.currency,
          baggage: passengerData.baggage
        });
      }
    }
  }

  return tickets.sort((a, b) => a.passengerIndex - b.passengerIndex);
}

/** Extract order-level print link from buy_ticket response */
export function extractOrderPrintLink(buyTicketResponse: BuyTicketResponse): {
  order_id: number;
  link: string;
  security?: string;
} | null {
  if (buyTicketResponse.order_id && buyTicketResponse.link) {
    // Extract security from the link if available
    const securityMatch = buyTicketResponse.link.match(/[?&]security=([^&]+)/);
    const security = securityMatch ? securityMatch[1] : undefined;

    return {
      order_id: buyTicketResponse.order_id,
      link: buyTicketResponse.link,
      security
    };
  }
  return null;
}

/** Generate print links for different languages */
export function generateMultiLanguagePrintLinks(
  baseData: { ticket_id?: string; order_id?: number | string; security: string },
  languages: string[] = ['ru', 'en', 'ro']
) {
  const links: Record<string, string> = {};

  languages.forEach(lang => {
    if (baseData.ticket_id) {
      links[lang] = buildTicketPrintLink({
        ticket_id: baseData.ticket_id,
        security: baseData.security,
        lang
      });
    } else if (baseData.order_id) {
      links[lang] = buildOrderPrintLink({
        order_id: baseData.order_id,
        security: baseData.security,
        lang
      });
    }
  });

  return links;
}

/** Open print link in new tab with security considerations */
export function openPrintLink(url: string, title: string = 'Ticket') {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (!newWindow) {
    // Fallback if popup blocked - show alert with manual link
    alert(`Popup blocked. Please open this link manually:\n${url}`);
  }
}

/** Download or view ticket via print link */
export function downloadTicket(url: string, filename?: string) {
  if (filename) {
    // Try to download as file
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // Just open in new tab
    openPrintLink(url);
  }
}