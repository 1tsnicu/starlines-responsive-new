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
import PaymentDemo from "@/pages/PaymentDemo";

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
                  <Route path="/payment-demo" element={<PaymentDemo />} />
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
