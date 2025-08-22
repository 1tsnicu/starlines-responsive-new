import { Shield, Eye, Database, Lock, Users, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocalization } from "@/contexts/LocalizationContext";

const PrivacyPolicy = () => {
  const { t } = useLocalization();
  const sections = [
    {
      id: "introduction",
      title: t('privacy.section1.title'),
      icon: Eye,
      content: t('privacy.section1.content')
    },
    {
      id: "information-collected",
      title: t('privacy.section2.title'),
      icon: Database,
      content: t('privacy.section2.content')
    },
    {
      id: "how-we-use",
      title: t('privacy.section3.title'),
      icon: Users,
      content: t('privacy.section3.content')
    },
    {
      id: "information-sharing",
      title: t('privacy.section4.title'),
      icon: Shield,
      content: t('privacy.section4.content')
    },
    {
      id: "data-security",
      title: t('privacy.section5.title'),
      icon: Lock,
      content: t('privacy.section5.content')
    },
    {
      id: "data-retention",
      title: t('privacy.section6.title'),
      content: t('privacy.section6.content')
    },
    {
      id: "your-rights",
      title: t('privacy.section7.title'),
      content: t('privacy.section7.content')
    },
    {
      id: "cookies",
      title: t('privacy.section8.title'),
      content: t('privacy.section8.content')
    },
    {
      id: "international-transfers",
      title: t('privacy.section9.title'),
      content: t('privacy.section9.content')
    },
    {
      id: "children",
      title: t('privacy.section10.title'),
      content: t('privacy.section10.content')
    },
    {
      id: "changes",
      title: t('privacy.section11.title'),
      content: t('privacy.section11.content')
    },
    {
      id: "contact",
      title: t('privacy.section12.title'),
      content: t('privacy.section12.content')
    }
  ];

  const dataTypes = [
    { category: t('privacy.personalInformation'), items: [t('privacy.name'), t('privacy.emailAddress'), t('privacy.phoneNumber'), t('privacy.dateOfBirth')] },
    { category: t('privacy.paymentInformation'), items: [t('privacy.creditCardDetails'), t('privacy.billingAddress'), t('privacy.paymentHistory')] },
    { category: t('privacy.travelInformation'), items: [t('privacy.bookingHistory'), t('privacy.travelPreferences'), t('privacy.specialRequirements')] },
    { category: t('privacy.technicalInformation'), items: [t('privacy.ipAddress'), t('privacy.browserType'), t('privacy.deviceInformation'), t('privacy.usageAnalytics')] }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('privacy.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('privacy.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('privacy.lastUpdated')}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {t('privacy.gdprCompliant')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Data Types Overview */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {t('privacy.typesOfData')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dataTypes.map((type) => (
                <div key={type.category}>
                  <h4 className="font-semibold text-foreground mb-2">{type.category}</h4>
                  <ul className="space-y-1">
                    {type.items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('privacy.quickNavigation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-muted"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Content */}
        <div className="space-y-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} id={section.id} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                    {Icon && <Icon className="h-6 w-6 text-primary" />}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Your Rights Section */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('privacy.exerciseYourRights')}
            </h3>
            <p className="text-muted-foreground">
              {t('privacy.rightsDescription')}
            </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                t('privacy.accessData'),
                t('privacy.rectifyInaccuracies'), 
                t('privacy.eraseData'),
                t('privacy.restrictProcessing'),
                t('privacy.dataPortability'),
                t('privacy.objectToProcessing'),
                t('privacy.withdrawConsent'),
                t('privacy.fileComplaint')
              ].map((right) => (
                <div key={right} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">{right}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('privacy.contactDPO')}{" "}
                <span className="font-medium text-primary">privacy@starlines.md</span> {t('privacy.orCall')} 
                <span className="font-medium text-primary">+373 22 123 456</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

