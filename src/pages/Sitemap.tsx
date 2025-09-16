import { Link } from "react-router-dom";
import { 
  Star, 
  Search, 
  Ticket, 
  Calendar, 
  FileText, 
  HelpCircle, 
  Info, 
  Phone, 
  CreditCard, 
  Shield,
  MapPin,
  Clock,
  Users,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Sitemap = () => {
  const sections = [
    {
      title: "Main Pages",
      icon: Star,
      links: [
        { name: "Home", href: "/", description: "Main landing page with search and features" },
        { name: "Search Results", href: "/search", description: "Find and filter bus routes" },
        { name: "My Tickets", href: "/my-tickets", description: "Manage your bookings and tickets" },
      ]
    },
    {
      title: "Booking & Travel",
      icon: Ticket,
      links: [
        { name: "Trip Details", href: "/trip-details", description: "View detailed trip information" },
        { name: "Checkout", href: "/checkout", description: "Complete your booking process" },
        { name: "Payment Status", href: "/payment/status", description: "Check payment confirmation" },
      ]
    },
    {
      title: "Information & Support",
      icon: Info,
      links: [
        { name: "Timetable", href: "/timetable", description: "Complete bus schedule" },
        { name: "FAQ", href: "/faq", description: "Frequently asked questions" },
        { name: "About Us", href: "/about", description: "Company information" },
        { name: "Contact", href: "/contacts", description: "Get in touch with us" },
      ]
    },
    {
      title: "Content & Blog",
      icon: FileText,
      links: [
        { name: "Blog", href: "/blog", description: "Travel articles and news" },
      ]
    },
    {
      title: "Legal & Policies",
      icon: Shield,
      links: [
        { name: "Terms of Service", href: "/legal/terms", description: "Terms and conditions" },
        { name: "Privacy Policy", href: "/legal/privacy", description: "Data protection information" },
        { name: "Refund Policy", href: "/legal/refunds", description: "Cancellation and refund rules" },
      ]
    },
    {
      title: "Admin & Management",
      icon: Settings,
      links: [
        { name: "Admin Routes", href: "/admin/routes", description: "Manage transport routes" },
        { name: "Login", href: "/login", description: "Administrative access" },
      ]
    }
  ];

  const quickActions = [
    {
      name: "Find Bus Ticket",
      href: "/",
      icon: Search,
      color: "bg-primary text-primary-foreground",
      description: "Search for available routes"
    },
    {
      name: "Check Timetable",
      href: "/timetable",
      icon: Calendar,
      color: "bg-secondary text-secondary-foreground",
      description: "View all bus schedules"
    },
    {
      name: "My Tickets",
      href: "/my-tickets",
      icon: Ticket,
      color: "bg-accent text-accent-foreground",
      description: "Access your bookings"
    },
    {
      name: "Contact Support",
      href: "/contacts",
      icon: Phone,
      color: "bg-success text-success-foreground",
      description: "Get help and support"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Site Navigation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find all pages and sections of the Starlines application. Use this page to easily navigate to any part of our website.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.name} to={action.href}>
                  <Card className="hover-lift border-border cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{action.name}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.links.map((link) => (
                    <Link key={link.name} to={link.href}>
                      <Card className="hover-lift border-border cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-foreground">{link.name}</h3>
                            <Badge variant="outline" className="text-xs">Page</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{link.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Help */}
        <div className="mt-16 p-6 bg-muted rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Can't find what you're looking for?</h3>
            <p className="text-muted-foreground mb-4">
              Use our search function or contact our support team for assistance.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/">
                <Badge variant="default" className="px-4 py-2 cursor-pointer">
                  <Search className="h-4 w-4 mr-2" />
                  Search Routes
                </Badge>
              </Link>
              <Link to="/contacts">
                <Badge variant="outline" className="px-4 py-2 cursor-pointer">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
