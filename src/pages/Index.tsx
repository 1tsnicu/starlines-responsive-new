import { 
  Bus, 
  MapPin, 
  Calendar, 
  Star, 
  Shield, 
  Users, 
  Phone, 
  Clock,
  CheckCircle,
  ArrowRight,
  Percent,
  Package,
  CreditCard,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PopularRoutesSection from "@/components/PopularRoutesSection";
import QuickLinks from "@/components/QuickLinks";
import { useLocalization } from "@/contexts/LocalizationContext";

const Index = () => {
  const { t } = useLocalization();
  // Simple main actions for elderly users
  const mainActions = [
    {
      title: t('index.bookTicket'),
      description: t('index.bookTicketDesc'),
      href: "/search",
      icon: <Calendar className="h-8 w-8" />,
      color: "bg-blue-500",
      buttonText: t('index.readyBookNow')
    },
    {
      title: t('index.viewRoutes'),
      description: t('index.viewRoutesDesc'),
      href: "/transport-routes",
      icon: <MapPin className="h-8 w-8" />,
      color: "bg-green-500",
      buttonText: t('index.viewTimetable')
    },
    {
      title: t('index.timetable'),
      description: t('index.timetableDesc'),
      href: "/timetable",
      icon: <Clock className="h-8 w-8" />,
      color: "bg-purple-500",
      buttonText: t('index.viewTimetable')
    }
  ];

  // Trust indicators
  const trustFeatures = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('index.trustSafe'),
      description: t('index.trustSafeDesc')
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: t('index.trustExperience'),
      description: t('index.trustExperienceDesc')
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t('index.trustSupport'),
      description: t('index.trustSupportDesc')
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: t('index.trustSimple'),
      description: t('index.trustSimpleDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Actions - Simple and Clear */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('index.whatToDo')}
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              {t('index.chooseAction')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {mainActions.map((action, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <div className="text-white">
                      {action.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl text-foreground">
                    {action.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-foreground/70 mb-6">
                    {action.description}
                  </p>
                  <Link to={action.href}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      {action.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              De ce să alegi Starlines?
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Suntem aici să îți oferim cea mai bună experiență de călătorie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustFeatures.map((feature, index) => (
              <Card key={index} className="border-border text-center hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <PopularRoutesSection />

      {/* Quick Help Section */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ai nevoie de ajutor?
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Suntem aici să te ajutăm să faci rezervarea perfectă
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Contact Card */}
            <Card className="border-border bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Phone className="h-5 w-5 text-primary" />
                  {t('index.contactUs')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-4">
                  {t('index.contactDesc')}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="font-medium">{t('index.phone')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{t('index.workingHours')}</span>
                  </div>
                </div>
                <Link to="/contacts" className="inline-block mt-4">
                  <Button variant="outline" className="w-full">
                    {t('index.viewAllContacts')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* FAQ Card */}
            <Card className="border-border bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Star className="h-5 w-5 text-primary" />
                  {t('index.faq')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-4">
                  {t('index.faqDesc')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('index.howToBook')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('index.canCancel')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('index.whatIfLate')}</span>
                  </div>
                </div>
                <Link to="/faq" className="inline-block mt-4">
                  <Button variant="outline" className="w-full">
                    {t('index.viewAllQuestions')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <QuickLinks />

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('index.readyToStart')}
          </h2>
          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            {t('index.readyDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3">
                <Calendar className="h-5 w-5 mr-2" />
                {t('index.readyBookNow')}
              </Button>
            </Link>
            <Link to="/transport-routes">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <MapPin className="h-5 w-5 mr-2" />
                {t('index.readyViewRoutes')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Developer Demo Section */}
      <section className="py-12 bg-slate-50 border-t">
        <div className="container">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Demo Components
            </h3>
            <p className="text-slate-600">
              Testează componentele integrate din Bussystem API
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-7xl mx-auto">
            <Link to="/seat-selection-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Bus className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Selectare Locuri</h4>
                  <p className="text-xs text-muted-foreground">Hărți interactive cu planuri de autocar</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/discount-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Percent className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Sistem Reduceri</h4>
                  <p className="text-xs text-muted-foreground">Atribuire reduceri per pasager</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/baggage-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">Sistem Bagaje</h4>
                  <p className="text-xs text-muted-foreground">Opțiuni bagaje cu limite și prețuri</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/payment-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 bg-purple-50">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-purple-800">Sistem Plată</h4>
                  <p className="text-xs text-purple-600">Demo buy_ticket cu timer și validări</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ticket-print-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-green-800">Printare Bilete</h4>
                  <p className="text-xs text-green-600">Demo sistem printare cu link-uri multi-limbă</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/cancellation-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ArrowRight className="h-5 w-5 text-white rotate-180" />
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-red-800">Anulare & Refund</h4>
                  <p className="text-xs text-red-600">Demo get_ticket și cancel_ticket cu estimări</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/booking-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-blue-800">Rezervare Completă</h4>
                  <p className="text-xs text-blue-600">Demo new_order cu toate sistemele integrate</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/points-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 bg-purple-50">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-purple-800">Get Points</h4>
                  <p className="text-xs text-purple-600">Demo autocomplete, țări, orașe cu caching</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/routes-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Bus className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-green-800">Get Routes</h4>
                  <p className="text-xs text-green-600">Demo căutare rute cu fallback XML→JSON</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/get-all-routes-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-indigo-200 bg-indigo-50">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-indigo-800">Get All Routes</h4>
                  <p className="text-xs text-indigo-600">Demo orar detaliat cu stații, bagaje, politici</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/bussystem-demo">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ArrowRight className="h-5 w-5 text-gray-600" />
                  </div>
                  <h4 className="font-medium text-sm mb-1">API Integration</h4>
                  <p className="text-xs text-muted-foreground">Test complet Bussystem endpoints</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
