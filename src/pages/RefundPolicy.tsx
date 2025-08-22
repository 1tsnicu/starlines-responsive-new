import React from "react";
import { RotateCcw, Clock, CreditCard, AlertTriangle, CheckCircle, FileText, Calendar, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";

const RefundPolicy: React.FC = () => {
  const { formatPrice, t } = useLocalization();
  const sections = [
    {
      id: "overview",
      title: t('refunds.section1.title'),
      icon: RotateCcw,
      content: t('refunds.section1.content')
    },
    {
      id: "cancellation-timeframes",
      title: t('refunds.section2.title'),
      icon: Clock,
      content: t('refunds.section2.content')
    },
    {
      id: "refund-processing",
      title: t('refunds.section3.title'),
      icon: CreditCard,
      content: t('refunds.section3.content')
    },
    {
      id: "non-refundable",
      title: t('refunds.section4.title'),
      icon: AlertTriangle,
      content: t('refunds.section4.content')
    },
    {
      id: "exceptions",
      title: t('refunds.section5.title'),
      icon: CheckCircle,
      content: t('refunds.section5.content')
    },
    {
      id: "process",
      title: t('refunds.section6.title'),
      content: t('refunds.section6.content')
    }
  ];

  const refundScenarios = [
    {
      scenario: t('refunds.standardCancellation'),
      timeframe: "> 24 hours before",
      refundAmount: "100% minus processing fee",
      processingFee: `${formatPrice(2)}-${formatPrice(5)}`,
      color: "text-green-600 bg-green-50"
    },
    {
      scenario: t('refunds.lateCancellation'),
      timeframe: "12-24 hours before", 
      refundAmount: "75% of ticket price",
      processingFee: `${formatPrice(2)}-${formatPrice(5)}`,
      color: "text-yellow-600 bg-yellow-50"
    },
    {
      scenario: t('refunds.veryLateCancellation'),
      timeframe: "2-12 hours before",
      refundAmount: "50% of ticket price", 
      processingFee: `${formatPrice(2)}-${formatPrice(5)}`,
      color: "text-orange-600 bg-orange-50"
    },
    {
      scenario: t('refunds.lastMinuteNoShow'),
      timeframe: "< 2 hours before",
      refundAmount: t('refunds.noRefund'),
      processingFee: t('refunds.na'),
      color: "text-red-600 bg-red-50"
    }
  ];

  const documentationRequired = [
    { situation: t('refunds.medicalEmergency'), documents: [t('refunds.medicalCertificate'), t('refunds.doctorsNote'), t('refunds.hospitalDischargePapers')] },
    { situation: t('refunds.deathInFamily'), documents: [t('refunds.deathCertificate'), t('refunds.proofOfRelationship'), t('refunds.officialDocumentation')] },
    { situation: t('refunds.militaryDeployment'), documents: [t('refunds.officialDeploymentOrders'), t('refunds.militaryId'), t('refunds.commandAuthorization')] },
    { situation: t('refunds.naturalDisaster'), documents: [t('refunds.newsReports'), t('refunds.officialEvacuationOrders'), t('refunds.governmentAdvisories')] }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <RotateCcw className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('refunds.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('refunds.subtitle')}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {t('refunds.lastUpdated')}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {t('refunds.version')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Refund Scenarios */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            {t('refunds.refundSchedule')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {refundScenarios.map((scenario) => (
              <Card key={scenario.scenario} className="border-border">
                <CardContent className="p-4">
                  <div className={`p-2 rounded-lg mb-3 ${scenario.color}`}>
                    <h4 className="font-semibold text-sm">{scenario.scenario}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{t('refunds.timeframe')}: </span>
                      <span className="text-muted-foreground">{scenario.timeframe}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{t('refunds.refund')}: </span>
                      <span className="text-muted-foreground">{scenario.refundAmount}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{t('refunds.fee')}: </span>
                      <span className="text-muted-foreground">{scenario.processingFee}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('refunds.quickNavigation')}
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

        {/* Policy Content */}
        <div className="space-y-8 mb-8">
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

        {/* Documentation Requirements */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('refunds.requiredDocumentation')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentationRequired.map((item) => (
                <div key={item.situation}>
                  <h4 className="font-semibold text-foreground mb-3">{item.situation}</h4>
                  <ul className="space-y-2">
                    {item.documents.map((doc) => (
                      <li key={doc} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t('refunds.note')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Refund Process */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('refunds.refundProcessingTimes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{t('refunds.creditCards')}</h4>
                <p className="text-sm text-muted-foreground">3-5 {t('refunds.businessDays')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{t('refunds.bankTransfers')}</h4>
                <p className="text-sm text-muted-foreground">5-7 {t('refunds.businessDays')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{t('refunds.cashPayments')}</h4>
                <p className="text-sm text-muted-foreground">7-10 {t('refunds.businessDays')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Refunds */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('refunds.needHelpWithRefund')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('refunds.customerServiceDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <Button variant="default">
                <Phone className="h-4 w-4 mr-2" />
                {t('refunds.callCustomerService')}
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {t('refunds.submitRefundRequest')}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{t('refunds.phone')}: <span className="font-medium text-primary">{t('refunds.phoneNumber')}</span></p>
              <p>{t('refunds.email')}: <span className="font-medium text-primary">{t('refunds.emailAddress')}</span></p>
              <p>{t('refunds.hours')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RefundPolicy;

