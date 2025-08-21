import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronDown, 
  Search, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  HelpCircle,
  BookOpen,
  Clock,
  Star,
  Users,
  FileText,
  Settings,
  Ticket,
  Shield,
  CreditCard,
  Bus,
  Grid3X3,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { useLocalization } from "@/contexts/LocalizationContext";

const QuickNav = () => {
  const { t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);

  // Complete quick actions for all functionality
  const quickActions = [
    {
      title: "Caută Rute",
      description: "Găsește autobuzele disponibile",
      href: "/search",
      icon: <Search className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      title: "Vezi Rutele",
      description: "Toate rutele și prețurile",
      href: "/transport-routes",
      icon: <MapPin className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      title: "Programul",
      description: "Orarul autobuzelor",
      href: "/timetable",
      icon: <Clock className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      title: "Biletele Mele",
      description: "Vezi rezervările tale",
      href: "/my-tickets",
      icon: <Ticket className="h-4 w-4" />,
      color: "text-orange-600"
    }
  ];

  const infoPages = [
    {
      title: "Despre Noi",
      description: "Cunoaște compania",
      href: "/about",
      icon: <Users className="h-4 w-4" />,
      color: "text-yellow-600"
    },
    {
      title: "Blog",
      description: "Articole de călătorie",
      href: "/blog",
      icon: <FileText className="h-4 w-4" />,
      color: "text-indigo-600"
    },
    {
      title: "FAQ",
      description: "Întrebări frecvente",
      href: "/faq",
      icon: <HelpCircle className="h-4 w-4" />,
      color: "text-pink-600"
    },
    {
      title: "Contact",
      description: "Sună-ne pentru ajutor",
      href: "/contacts",
      icon: <Phone className="h-4 w-4" />,
      color: "text-red-600"
    }
  ];

  const usefulTools = [
    {
      title: "Sitemap",
      description: "Vizualizează toate paginile",
      href: "/sitemap",
      icon: <Grid3X3 className="h-4 w-4" />,
      color: "text-teal-600"
    },
    {
      title: "Informații Utile",
      description: "Ghiduri și sfaturi",
      href: "/faq",
      icon: <Info className="h-4 w-4" />,
      color: "text-emerald-600"
    },
    {
      title: "Suport Tehnic",
      description: "Ajutor și asistență",
      href: "/contacts",
      icon: <HelpCircle className="h-4 w-4" />,
      color: "text-blue-600"
    }
  ];

  const legalPages = [
    {
      title: "Termeni & Condiții",
      description: "Termenii de utilizare",
      href: "/legal/terms",
      icon: <FileText className="h-4 w-4" />,
      color: "text-slate-600"
    },
    {
      title: "Confidențialitate",
      description: "Politica de confidențialitate",
      href: "/legal/privacy",
      icon: <Shield className="h-4 w-4" />,
      color: "text-slate-600"
    },
    {
      title: "Rambursări",
      description: "Politica de rambursare",
      href: "/legal/refunds",
      icon: <CreditCard className="h-4 w-4" />,
      color: "text-slate-600"
    }
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">Acces Rapid</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96 p-2">
        <div className="space-y-3">
          {/* Quick Actions Section */}
          <div>
            <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
              <Calendar className="h-4 w-4" />
              Acțiuni Rapide
            </DropdownMenuLabel>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={`${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{action.title}</div>
                    <div className="text-xs text-foreground/70">{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Information Pages */}
          <div>
            <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-4 w-4" />
              Informații & Conținut
            </DropdownMenuLabel>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {infoPages.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={`${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{action.title}</div>
                    <div className="text-xs text-foreground/70">{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Useful Tools */}
          <div>
            <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
              <Info className="h-4 w-4" />
              Instrumente Utile
            </DropdownMenuLabel>
            <div className="grid grid-cols-1 gap-1 mt-2">
              {usefulTools.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={`${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{action.title}</div>
                    <div className="text-xs text-foreground/70">{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Legal Pages */}
          <div>
            <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
              <Shield className="h-4 w-4" />
              Informații Legale
            </DropdownMenuLabel>
            <div className="grid grid-cols-1 gap-1 mt-2">
              {legalPages.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={`${action.color}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground text-sm">{action.title}</div>
                    <div className="text-xs text-foreground/70">{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-2 border-t border-border">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <Phone className="h-4 w-4" />
                <div>
                  <div className="font-medium text-sm">Suport Urgent</div>
                  <div className="text-xs">+373 60 12 34 56</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuickNav;
