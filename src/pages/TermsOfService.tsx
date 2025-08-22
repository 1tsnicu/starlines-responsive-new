import { Shield, FileText, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocalization } from "@/contexts/LocalizationContext";

const TermsOfService = () => {
  const { t } = useLocalization();
  const sections = [
    {
      id: "acceptance",
      title: t('terms.section1.title'),
      content: t('terms.section1.content')
    },
    {
      id: "services",
      title: t('terms.section2.title'),
      content: t('terms.section2.content')
    },
    {
      id: "booking",
      title: t('terms.section3.title'),
      content: t('terms.section3.content')
    },
    {
      id: "tickets",
      title: t('terms.section4.title'),
      content: t('terms.section4.content')
    },
    {
      id: "cancellation",
      title: t('terms.section5.title'),
      content: t('terms.section5.content')
    },
    {
      id: "luggage",
      title: t('terms.section6.title'),
      content: t('terms.section6.content')
    },
    {
      id: "conduct",
      title: t('terms.section7.title'),
      content: t('terms.section7.content')
    },
    {
      id: "liability",
      title: t('terms.section8.title'),
      content: t('terms.section8.content')
    },
    {
      id: "privacy",
      title: t('terms.section9.title'),
      content: t('terms.section9.content')
    },
    {
      id: "changes",
      title: t('terms.section10.title'),
      content: t('terms.section10.content')
    },
    {
      id: "governing",
      title: t('terms.section11.title'),
      content: t('terms.section11.content')
    },
    {
      id: "contact",
      title: t('terms.section12.title'),
      content: t('terms.section12.content')
    }
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
              {t('terms.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('terms.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('terms.lastUpdated')}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {t('terms.version')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Quick Navigation */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('terms.quickNavigation')}
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

        {/* Terms Content */}
        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.id} id={section.id} className="border-border">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Notice */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('terms.questionsAboutTerms')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('terms.legalTeamHelp')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('terms.contactLegal')} <span className="font-medium text-primary">legal@starlines.md</span> {t('terms.orCall')} 
              <span className="font-medium text-primary">+373 22 123 456</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;

