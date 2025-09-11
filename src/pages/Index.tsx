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
      icon: <Calendar className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: "bg-blue-500",
      buttonText: t('index.readyBookNow')
    },
    {
      title: t('index.viewRoutes'),
      description: t('index.viewRoutesDesc'),
      href: "/transport-routes",
      icon: <MapPin className="h-6 w-6 sm:h-8 sm:w-8" />,
      color: "bg-green-500",
      buttonText: t('index.viewTimetable')
    },
    {
      title: t('index.timetable'),
      description: t('index.timetableDesc'),
      href: "/timetable",
      icon: <Clock className="h-6 w-6 sm:h-8 sm:w-8" />,
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
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              {t('index.whatToDo')}
            </h2>
            <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto px-2">
              {t('index.chooseAction')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {mainActions.map((action, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                    <div className="text-white">
                      {action.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-foreground">
                    {action.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-foreground/70 mb-4 sm:mb-6 text-sm sm:text-base">
                    {action.description}
                  </p>
                  <Link to={action.href}>
                    <Button className="w-full bg-primary hover:bg-primary/90 h-10 sm:h-11">
                      <span className="text-sm sm:text-base">{action.buttonText}</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-12 sm:py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              De ce să alegi Starlines?
            </h2>
            <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto px-2">
              Suntem aici să îți oferim cea mai bună experiență de călătorie
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trustFeatures.map((feature, index) => (
              <Card key={index} className="border-border text-center hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <div className="text-primary">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
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
      <section className="py-12 sm:py-16 bg-primary/5">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Ai nevoie de ajutor?
            </h2>
            <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto px-2">
              Suntem aici să te ajutăm să faci rezervarea perfectă
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Contact Card */}
            <Card className="border-border bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-lg sm:text-xl">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {t('index.contactUs')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-4 text-sm sm:text-base">
                  {t('index.contactDesc')}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="font-medium text-sm sm:text-base">{t('index.phone')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-sm sm:text-base">{t('index.workingHours')}</span>
                  </div>
                </div>
                <Link to="/contacts" className="inline-block mt-4 w-full">
                  <Button variant="outline" className="w-full h-10 sm:h-11">
                    <span className="text-sm sm:text-base">{t('index.viewAllContacts')}</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* FAQ Card */}
            <Card className="border-border bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground text-lg sm:text-xl">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  {t('index.faq')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-4 text-sm sm:text-base">
                  {t('index.faqDesc')}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="text-sm sm:text-base">{t('index.howToBook')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="text-sm sm:text-base">{t('index.canCancel')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span className="text-sm sm:text-base">{t('index.whatIfLate')}</span>
                  </div>
                </div>
                <Link to="/faq" className="inline-block mt-4 w-full">
                  <Button variant="outline" className="w-full h-10 sm:h-11">
                    <span className="text-sm sm:text-base">{t('index.viewAllQuestions')}</span>
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
      <section className="py-12 sm:py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            {t('index.readyToStart')}
          </h2>
          <p className="text-base sm:text-lg text-foreground/70 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            {t('index.readyDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-6 sm:px-8 py-3 h-12 sm:h-auto w-full sm:w-auto">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">{t('index.readyBookNow')}</span>
              </Button>
            </Link>
            <Link to="/transport-routes">
              <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 h-12 sm:h-auto w-full sm:w-auto">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="text-sm sm:text-base">{t('index.readyViewRoutes')}</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
