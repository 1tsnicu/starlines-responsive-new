import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocalizationProvider } from "@/contexts/LocalizationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

// Pages
import Index from "@/pages/Index";
import SearchResults from "@/pages/SearchResults";
import TripDetails from "@/pages/TripDetails";
import Checkout from "@/pages/Checkout";
import PaymentStatus from "@/pages/PaymentStatus";
import MyTickets from "@/pages/MyTickets";
import Sitemap from "@/pages/Sitemap";
import Timetable from "@/pages/Timetable";
import Blog from "@/pages/Blog";
import FAQ from "@/pages/FAQ";
import About from "@/pages/About";
import Contacts from "@/pages/Contacts";
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import RefundPolicy from "@/pages/RefundPolicy";
import TransportRoutes from "@/pages/TransportRoutes";
import AdminRoutes from "@/pages/AdminRoutes";
import Login from "@/pages/Login";
import BussystemDemo from "@/pages/BussystemDemo";
import MockVsRealDemo from "@/pages/MockVsRealDemo";
import { SeatSelectionDemo } from "@/components/SeatSelectionDemo";
import DiscountDemo from "@/pages/DiscountDemo";
import BaggageDemo from "@/pages/BaggageDemo";
import BookingDemo from "@/pages/BookingDemo";
import PaymentDemo from "@/pages/PaymentDemo";
import TicketPrintDemo from "@/pages/TicketPrintDemo";
import CancellationDemo from "@/pages/CancellationDemo";
import PointsDemo from "@/pages/PointsDemo";
import RoutesDemo from "@/pages/RoutesDemo";
import { GetAllRoutesDemo } from "@/pages/GetAllRoutesDemo";
import SeatsDemo from "@/pages/SeatsDemo";
import PlanDemo from "@/pages/PlanDemo";
import NewOrderDemo from "@/pages/NewOrderDemo";
import ReserveTicketDemo from "@/pages/ReserveTicketDemo";
import ReserveValidationDemo from "@/pages/ReserveValidationDemo";
import { DemoPage } from "@/components/DemoPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider>
      <Router>
        <AuthProvider>
          <TooltipProvider>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/trip-details" element={<TripDetails />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment/status" element={<PaymentStatus />} />
                  <Route path="/my-tickets" element={<MyTickets />} />
                  <Route path="/sitemap" element={<Sitemap />} />
                  <Route path="/timetable" element={<Timetable />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/legal/terms" element={<TermsOfService />} />
                  <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                  <Route path="/legal/refunds" element={<RefundPolicy />} />
                  <Route path="/transport-routes" element={<TransportRoutes />} />
                  <Route path="/admin/routes" element={<AdminRoutes />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/bussystem-demo" element={<BussystemDemo />} />
                  <Route path="/mock-vs-real-demo" element={<MockVsRealDemo />} />
                  <Route path="/seat-selection-demo" element={<SeatSelectionDemo />} />
                  <Route path="/discount-demo" element={<DiscountDemo />} />
                  <Route path="/baggage-demo" element={<BaggageDemo />} />
                  <Route path="/booking-demo" element={<BookingDemo />} />
                  <Route path="/payment-demo" element={<PaymentDemo />} />
                  <Route path="/ticket-print-demo" element={<TicketPrintDemo />} />
                  <Route path="/cancellation-demo" element={<CancellationDemo />} />
                  <Route path="/points-demo" element={<PointsDemo />} />
                  <Route path="/routes-demo" element={<RoutesDemo />} />
                  <Route path="/seats-demo" element={<SeatsDemo />} />
                  <Route path="/plan-demo" element={<PlanDemo />} />
                  <Route path="/new-order-demo" element={<NewOrderDemo />} />
                  <Route path="/reserve-ticket-demo" element={<ReserveTicketDemo />} />
                  <Route path="/reserve-validation-demo" element={<ReserveValidationDemo />} />
                  <Route path="/api-demo" element={<DemoPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </Router>
    </LocalizationProvider>
  </QueryClientProvider>
);
}

export default App;
