/**
 * TICKET STORAGE HOOK
 * 
 * Manages saving and retrieving paid tickets from localStorage
 */

import { useState, useEffect } from 'react';

export interface SavedTicket {
  id: string;
  order_id: number;
  security: string;
  status: 'paid' | 'buy_ok' | 'buy' | 'reserve_ok';
  price_total: number;
  currency: string;
  reservation_until: string;
  created_at: string;
  trips: Array<{
    trip_id: number;
    route_name: string;
    date_from: string;
    time_from: string;
    point_from: string;
    station_from: string;
    point_to: string;
    station_to: string;
    passengers: Array<{
      transaction_id: string;
      name: string;
      surname: string;
      seat: string;
      price: number;
    }>;
  }>;
}

export const useTicketStorage = () => {
  const [tickets, setTickets] = useState<SavedTicket[]>([]);

  // Load tickets from localStorage on mount
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    try {
      const savedTickets = localStorage.getItem('paid_tickets');
      if (savedTickets) {
        const parsedTickets = JSON.parse(savedTickets);
        setTickets(parsedTickets);
      }
    } catch (error) {
      console.error('Error loading tickets from storage:', error);
    }
  };

  const saveTicket = (bookingResponse: any) => {
    try {
      // Check if this is a valid ticket (paid or reserved)
      const isValidTicket = bookingResponse.status === 'buy_ok' || 
                           bookingResponse.status === 'buy' ||
                           bookingResponse.status === 'paid' ||
                           bookingResponse.status === 'reserve_ok';

      if (!isValidTicket) {
        console.log('Ticket not valid, not saving to storage');
        return;
      }

      // Create ticket object
      const ticket: SavedTicket = {
        id: `ticket_${bookingResponse.order_id}_${Date.now()}`,
        order_id: bookingResponse.order_id,
        security: bookingResponse.security,
        status: bookingResponse.status,
        price_total: bookingResponse.price_total,
        currency: bookingResponse.currency || 'EUR',
        reservation_until: bookingResponse.reservation_until,
        created_at: new Date().toISOString(),
        trips: []
      };

      // Extract trip information
      if (bookingResponse[0]) {
        const trip = bookingResponse[0];
        ticket.trips.push({
          trip_id: trip.trip_id || 0,
          route_name: trip.route_name || 'Unknown Route',
          date_from: trip.date_from || '',
          time_from: trip.time_from || '',
          point_from: trip.point_from || '',
          station_from: trip.station_from || '',
          point_to: trip.point_to || '',
          station_to: trip.station_to || '',
          passengers: (trip.passengers || []).map((passenger: any) => ({
            transaction_id: passenger.transaction_id || '',
            name: passenger.name || '',
            surname: passenger.surname || '',
            seat: passenger.seat || '',
            price: passenger.price || 0
          }))
        });
      }

      // Save to localStorage
      const existingTickets = JSON.parse(localStorage.getItem('paid_tickets') || '[]');
      
      // Check if ticket already exists (by order_id)
      const ticketExists = existingTickets.some((existingTicket: SavedTicket) => 
        existingTicket.order_id === ticket.order_id
      );
      
      if (ticketExists) {
        console.log('Ticket already exists, not saving duplicate:', ticket.order_id);
        return;
      }
      
      const updatedTickets = [...existingTickets, ticket];
      localStorage.setItem('paid_tickets', JSON.stringify(updatedTickets));
      
      // Update state
      setTickets(updatedTickets);
      
      console.log('Ticket saved to storage:', ticket);
    } catch (error) {
      console.error('Error saving ticket to storage:', error);
    }
  };

  const removeTicket = (ticketId: string) => {
    try {
      const updatedTickets = tickets.filter(ticket => ticket.id !== ticketId);
      localStorage.setItem('paid_tickets', JSON.stringify(updatedTickets));
      setTickets(updatedTickets);
    } catch (error) {
      console.error('Error removing ticket from storage:', error);
    }
  };

  const clearAllTickets = () => {
    try {
      localStorage.removeItem('paid_tickets');
      setTickets([]);
    } catch (error) {
      console.error('Error clearing tickets from storage:', error);
    }
  };

  const removeDuplicateTickets = () => {
    try {
      const existingTickets = JSON.parse(localStorage.getItem('paid_tickets') || '[]');
      
      // Remove duplicates based on order_id, keeping the first occurrence
      const uniqueTickets = existingTickets.filter((ticket: SavedTicket, index: number, self: SavedTicket[]) => 
        index === self.findIndex((t: SavedTicket) => t.order_id === ticket.order_id)
      );
      
      if (uniqueTickets.length !== existingTickets.length) {
        console.log(`Removed ${existingTickets.length - uniqueTickets.length} duplicate tickets`);
        localStorage.setItem('paid_tickets', JSON.stringify(uniqueTickets));
        setTickets(uniqueTickets);
      }
    } catch (error) {
      console.error('Error removing duplicate tickets:', error);
    }
  };

  return {
    tickets,
    saveTicket,
    removeTicket,
    clearAllTickets,
    loadTickets,
    removeDuplicateTickets
  };
};
