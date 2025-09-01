// Legacy component - redirects to new BussystemBookingFlow
import BussystemBookingFlow, { type BookingResult } from './BussystemBookingFlow';
import { RouteSummary, TicketInfo } from '@/lib/bussystem';

interface BookingFlowProps {
  route: RouteSummary;
  onBack: () => void;
  onComplete: (ticket: TicketInfo) => void;
}

export function BookingFlow({ route, onBack, onComplete }: BookingFlowProps) {
  const handleComplete = (result: BookingResult) => {
    // Convert BookingResult to TicketInfo for backwards compatibility
    const ticket: TicketInfo = {
      ticket_id: result.order.order_id,
      order_id: result.order.order_id,
      status: 'confirmed',
      ...result.ticket
    };
    onComplete(ticket);
  };

  return (
    <BussystemBookingFlow
      route={route}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}

export default BookingFlow;
