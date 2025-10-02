import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Bus, 
  MapPin, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  Globe,
  CreditCard,
  Shield,
  Star,
  ChevronDown,
  Ticket,
  Clock,
  HelpCircle,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLocalization, SUPPORTED_LANGUAGES, SUPPORTED_CURRENCIES } from "@/contexts/LocalizationContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { 
    currentLanguage, 
    setLanguage, 
    getLanguageFlag, 
    getLanguageName,
    currentCurrency, 
    setCurrency, 
    getCurrencyFlag, 
    getCurrencySymbol,
    t 
  } = useLocalization();
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Complete navigation structure with ALL pages (no admin)
  const mainNavigation = [
    {
      title: t('header.home'),
      href: "/",
      icon: <Star className="h-4 w-4" />,
      description: t('header.homeDesc')
    },
    {
      title: t('header.timetable'),
      href: "/timetable",
      icon: <Clock className="h-4 w-4" />,
      description: t('header.timetableDesc')
    },
    {
      title: t('header.myTickets'),
      href: "/my-tickets",
      icon: <Ticket className="h-4 w-4" />,
      description: t('header.myTicketsDesc')
    }
  ];

  // Additional pages dropdown (no admin)
  const additionalPages = [
    {
      title: t('about.title'),
      href: "/about",
      icon: <Users className="h-4 w-4" />,
      description: t('about.subtitle')
    },
    {
      title: t('blog.title'),
      href: "/blog",
      icon: <FileText className="h-4 w-4" />,
      description: t('blog.subtitle')
    },
    {
      title: t('index.faq'),
      href: "/faq",
      icon: <HelpCircle className="h-4 w-4" />,
      description: t('index.faqDesc')
    },
    {
      title: t('contact.title'),
      href: "/contacts",
      icon: <Phone className="h-4 w-4" />,
      description: t('contact.subtitle')
    }
  ];


  // Legal pages dropdown
  const legalPages = [
    {
      title: t('legal.terms'),
      href: "/legal/terms",
      icon: <FileText className="h-4 w-4" />,
      description: t('legal.termsDesc')
    },
    {
      title: t('legal.privacy'),
      href: "/legal/privacy",
      icon: <Shield className="h-4 w-4" />,
      description: t('legal.privacyDesc')
    },
    {
      title: t('legal.refund'),
      href: "/legal/refunds",
      icon: <CreditCard className="h-4 w-4" />,
      description: t('legal.refundDesc')
    }
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar - Trust Indicators */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="container flex items-center justify-between py-2 text-xs">
          <div className="hidden sm:flex items-center gap-2 lg:gap-4 text-primary/80">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span className="hidden md:inline">{t('header.trust.safe')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span className="hidden md:inline">{t('header.trust.experience')}</span>
            </div>
          </div>
          <div className="sm:hidden flex items-center gap-2 text-primary/80">
            <Shield className="h-3 w-3" />
            <Star className="h-3 w-3" />
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1 lg:gap-2">
              <Globe className="h-3 w-3 text-primary/80" />
              <Select value={currentLanguage} onValueChange={setLanguage}>
                <SelectTrigger className="h-6 w-12 lg:w-16 text-xs border-0 bg-transparent p-0 hover:bg-primary/10 rounded">
                  <SelectValue>
                    <span className="flex items-center gap-1">
                      <span>{getLanguageFlag(currentLanguage)}</span>
                      <span className="hidden lg:inline">{currentLanguage.toUpperCase()}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        <span className="text-xs text-muted-foreground">({lang.code.toUpperCase()})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Currency Selector */}
            <div className="flex items-center gap-1 lg:gap-2">
              <CreditCard className="h-3 w-3 text-primary/80" />
              <Select value={currentCurrency} onValueChange={setCurrency}>
                <SelectTrigger className="h-6 w-12 lg:w-16 text-xs border-0 bg-transparent p-0 hover:bg-primary/10 rounded">
                  <SelectValue>
                    <span className="flex items-center gap-1">
                      <span>{getCurrencyFlag(currentCurrency)}</span>
                      <span className="hidden lg:inline">{currentCurrency}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <span className="flex items-center gap-2">
                        <span>{currency.flag}</span>
                        <span>{currency.name}</span>
                        <span className="text-xs text-muted-foreground">({currency.symbol})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>{/* end right controls */}
        </div>{/* end container */}
      </div>{/* end top bar */}

      {/* Main Header */}
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-foreground">Starlines</h1>
              <p className="text-xs text-foreground/70 hidden lg:block">{t('header.tagline')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`group relative px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  {item.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
                </div>
              </Link>
            ))}

            {/* Additional Pages Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-4 py-2 text-foreground/70 hover:text-foreground hover:bg-muted">
                  <span className="font-medium">{t('header.more')}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuLabel>{t('header.infoPages')}</DropdownMenuLabel>
                {additionalPages.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex items-center gap-3 p-2">
                      {item.icon}
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('header.legal')}</DropdownMenuLabel>
                {legalPages.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex items-center gap-3 p-2">
                      {item.icon}
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 flex items-center gap-1 lg:gap-2">
                    <span className="truncate max-w-[80px] lg:max-w-[120px]">
                      {profile?.first_name || user.email}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('auth.profile')}</DropdownMenuLabel>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/routes">
                        <Shield className="h-4 w-4 mr-2" />
                        {t('admin.title')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut}>
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('auth.loggingOut')}
                      </>
                    ) : (
                      t('auth.logout')
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="ml-2 hidden sm:inline-flex items-center justify-center h-9 px-4 min-w-[108px]"
              >
                <Link to="/login" className="leading-none">{t('auth.login.button')}</Link>
              </Button>
            )}
            {!user && (
              <Button asChild variant="outline" size="sm" className="ml-2 sm:hidden" aria-label={t('a11y.login')}>
                <Link to="/login">
                  <Users className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </nav>
          {/* Mobile controls now outside desktop nav */}
          <div className="flex items-center gap-2 lg:hidden">
            {!user && (
              <Button asChild variant="outline" size="sm" aria-label={t('a11y.login')}>
                <Link to="/login">
                  <Users className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              aria-label={isMobileMenuOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>{/* end flex */}
      </div>{/* end main container */}

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container py-4">
            <nav className="space-y-4">
              {/* Main Navigation */}
              <div className="space-y-2">
              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.icon}
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs opacity-80">{item.description}</div>
                  </div>
                </Link>
              ))}
              </div>

              {/* Additional Pages */}
              <div className="pt-2 border-t border-border space-y-2">
                <h4 className="px-4 py-2 text-sm font-semibold text-foreground/70">{t('header.info')}</h4>
                {additionalPages.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted"
                  >
                    {item.icon}
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Legal Pages */}
              <div className="pt-2 border-t border-border space-y-2">
                <h4 className="px-4 py-2 text-sm font-semibold text-foreground/70">{t('header.legal')}</h4>
                {legalPages.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted"
                  >
                    {item.icon}
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-80">{item.description}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* User / Auth Section */}
              <div className="pt-2 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 text-sm text-foreground/70 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="truncate">{profile?.first_name || user.email}</span>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin/routes"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted"
                      >
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">{t('admin.title')}</span>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mx-4 w-[calc(100%-2rem)]"
                      onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {t('auth.loggingOut')}
                        </>
                      ) : (
                        t('auth.logout')
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button asChild size="sm" className="mx-4 w-[calc(100%-2rem)]" onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/login">{t('auth.login.button')}</Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;