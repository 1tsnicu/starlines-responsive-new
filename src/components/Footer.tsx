import { Link } from "react-router-dom";
import { 
  Bus, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Shield, 
  Star,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";

const Footer = () => {
  const { t } = useLocalization();
  const currentYear = new Date().getFullYear();

  // Simplified footer sections
  const footerSections = [
    {
      title: t('footer.transport'),
      links: [
        { name: t('header.timetable'), href: "/timetable" },
        { name: t('header.bookings'), href: "/search" },
        { name: t('header.myTickets'), href: "/my-tickets" }
      ]
    },
    {
      title: t('footer.info'),
      links: [
        { name: t('about.title'), href: "/about" },
        { name: t('contact.title'), href: "/contacts" },
        { name: t('index.faq'), href: "/faq" },
        { name: t('blog.title'), href: "/blog" }
      ]
    },
    {
      title: t('footer.support'),
      links: [
        { name: t('index.faq'), href: "/faq" },
        { name: 'Contact Urgent', href: "/contacts" },
        { name: t('legal.terms'), href: "/legal/terms" },
        { name: t('legal.privacy'), href: "/legal/privacy" }
      ]
    }
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer Content */}
      <div className="container py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                <Bus className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Starlines</h3>
                <p className="text-sm text-background/70">Transport Internațional</p>
              </div>
            </div>
            
            <p className="text-sm text-background/70 mb-4">
              {t('hero.subtitle')}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3 text-green-400" />
                <span>{t('features.safeTransport')}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 text-yellow-400" />
                <span>{t('header.trust.experience')}</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-background/70 hover:text-background hover:bg-background/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-background/70 hover:text-background hover:bg-background/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-background/70 hover:text-background hover:bg-background/10">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-background">{section.title}</h4>
            <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-background/70 hover:text-background transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          ))}
        </div>
          </div>

      {/* Contact Bar */}
      <div className="border-t border-background/20 bg-foreground/95">
        <div className="container py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-background/70">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+373 60 12 34 56</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@starlines.md</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{t('index.workingHours')}</span>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link to="/search">
                <Button size="sm" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                  {t('index.readyBookNow')}
                </Button>
              </Link>
              <Link to="/contacts">
                <Button size="sm" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-foreground font-medium">
                  {t('contacts.title')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/20 bg-foreground/90">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-background/70">
            <div className="flex items-center gap-4">
              <span>&copy; {currentYear} Starlines. {t('footer.rights')}</span>
              <span>•</span>
              <span>{t('hero.subtitle')}</span>
        </div>
        
            <div className="flex items-center gap-4">
              <Link to="/legal/terms" className="hover:text-background transition-colors">
                {t('legal.terms')}
              </Link>
              <span>•</span>
              <Link to="/legal/privacy" className="hover:text-background transition-colors">
                {t('legal.privacy')}
              </Link>
              <span>•</span>
              <Link to="/legal/refunds" className="hover:text-background transition-colors">
                {t('legal.refund')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;