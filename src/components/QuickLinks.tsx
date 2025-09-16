import {
  Search,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  FileText,
  HelpCircle,
  Info,
  Phone,
  Shield,
  Star,
  Route,
  Users,
  Mail,
  Settings
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocalization } from "@/contexts/LocalizationContext";

const QuickLinks = () => {
  const { t } = useLocalization();
  const quickLinks = [
    {
      title: t('header.bookings'),
      description: t('index.searchRoutesDesc'),
      icon: Search,
      href: "/search-results",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: t('header.timetable'),
      description: t('index.timetableDesc'),
      icon: Clock,
      href: "/timetable",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: t('header.myTickets'),
      description: t('index.myTicketsDesc'),
      icon: Ticket,
      href: "/my-tickets",
      color: "from-orange-500 to-orange-600"
    },
    {
      title: t('blog.title'),
      description: t('index.blogDesc'),
      icon: FileText,
      href: "/blog",
      color: "from-pink-500 to-pink-600"
    },
    {
      title: t('about.title'),
      description: t('index.aboutDesc'),
      icon: Users,
      href: "/about",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: t('contact.title'),
      description: t('index.contactDesc'),
      icon: Mail,
      href: "/contacts",
      color: "from-red-500 to-red-600"
    },
    {
      title: t('admin.title'),
      description: t('admin.subtitle'),
      icon: Settings,
      href: "/admin/routes",
      color: "from-gray-500 to-gray-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-surface/50 via-background to-surface/50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-primary/10 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-accent/10 rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-40 h-40 border border-secondary/10 rounded-full" />
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 border border-primary/10 rounded-full" />
        
        {/* Subtle dots */}
        <div className="absolute top-1/2 left-0 w-48 h-48 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:25px_25px]" />
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:25px_25px]" />
      </div>

      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">{t('index.quickAccess')}</span>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {t('index.everythingYouNeed')}
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            {t('index.quickAccessDesc')}
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quickLinks.map((link, index) => (
            <Card 
              key={link.title} 
              className="group hover-lift border-border relative overflow-hidden bg-gradient-to-br from-white to-surface/50"
            >
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-accent/20 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-secondary/20 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-primary/20 rounded-br-lg" />

              <CardContent className="p-6 text-center relative z-10">
                {/* Icon with gradient background */}
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-2xl ${link.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                    <link.icon className="h-8 w-8 relative z-10" />
                    {/* Subtle glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-20 blur-xl`} />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                
                <p className="text-foreground/70 text-sm leading-relaxed mb-4">
                  {link.description}
                </p>
                
                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
                
                {/* Subtle background pattern on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom decorative section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 bg-white/90 backdrop-blur-sm px-8 py-6 rounded-3xl shadow-lg border border-border/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{t('index.cantFindWhatYouNeed')}</h3>
                <p className="text-sm text-foreground/70">{t('index.useSearchOrContact')}</p>
              </div>
            </div>
            
            <div className="w-px h-12 bg-border" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-accent" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{t('features.support')}</h3>
                <p className="text-sm text-foreground/70">{t('features.supportDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
