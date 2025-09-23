import { useState } from "react";
import { Search, HelpCircle, FileText, CreditCard, Ticket, Bus, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocalization } from "@/contexts/LocalizationContext";
import PaymentLogos from "@/components/PaymentLogos";

// Mock FAQ data with translation keys
const faqData = [
  {
    category: 'faq.category.bookingTickets',
    icon: Ticket,
    questions: [
      {
        question: 'faq.booking.howToBook.question',
        answer: 'faq.booking.howToBook.answer'
      },
      {
        question: 'faq.booking.changeCancel.question',
        answer: 'faq.booking.changeCancel.answer'
      },
      {
        question: 'faq.booking.paymentMethods.question',
        answer: 'faq.booking.paymentMethods.answer'
      },
      {
        question: 'faq.booking.printTicket.question',
        answer: 'faq.booking.printTicket.answer'
      }
    ]
  },
  {
    category: 'faq.category.travelRoutes',
    icon: Bus,
    questions: [
      {
        question: 'faq.travel.arriveEarly.question',
        answer: 'faq.travel.arriveEarly.answer'
      },
      {
        question: 'faq.travel.missBus.question',
        answer: 'faq.travel.missBus.answer'
      },
      {
        question: 'faq.travel.luggageRestrictions.question',
        answer: 'faq.travel.luggageRestrictions.answer'
      },
      {
        question: 'faq.travel.pets.question',
        answer: 'faq.travel.pets.answer'
      }
    ]
  },
  {
    category: 'faq.category.schedulesTimetables',
    icon: Clock,
    questions: [
      {
        question: 'faq.schedules.frequency.question',
        answer: 'faq.schedules.frequency.answer'
      },
      {
        question: 'faq.schedules.weekendsHolidays.question',
        answer: 'faq.schedules.weekendsHolidays.answer'
      },
      {
        question: 'faq.schedules.journeyTime.question',
        answer: 'faq.schedules.journeyTime.answer'
      }
    ]
  },
  {
    category: 'faq.category.safetySecurity',
    icon: Shield,
    questions: [
      {
        question: 'faq.safety.measures.question',
        answer: 'faq.safety.measures.answer'
      },
      {
        question: 'faq.safety.insurance.question',
        answer: 'faq.safety.insurance.answer'
      },
      {
        question: 'faq.safety.emergency.question',
        answer: 'faq.safety.emergency.answer'
      }
    ]
  },
  {
    category: 'faq.category.customerService',
    icon: HelpCircle,
    questions: [
      {
        question: 'faq.service.contact.question',
        answer: 'faq.service.contact.answer'
      },
      {
        question: 'faq.service.hours.question',
        answer: 'faq.service.hours.answer'
      },
      {
        question: 'faq.service.complaints.question',
        answer: 'faq.service.complaints.answer'
      }
    ]
  },
  {
    category: 'faq.category.pricingDiscounts',
    icon: CreditCard,
    questions: [
      {
        question: 'faq.pricing.studentDiscounts.question',
        answer: 'faq.pricing.studentDiscounts.answer'
      },
      {
        question: 'faq.pricing.loyaltyPrograms.question',
        answer: 'faq.pricing.loyaltyPrograms.answer'
      },
      {
        question: 'faq.pricing.seasonalPromotions.question',
        answer: 'faq.pricing.seasonalPromotions.answer'
      }
    ]
  }
];

const FAQ = () => {
  const { t } = useLocalization();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter FAQ data based on search query
  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      t(q.question).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(q.answer).toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  // Get all unique categories for filtering
  const allCategories = faqData.map(cat => cat.category);

  // Filter by selected category
  const displayFAQ = selectedCategory 
    ? filteredFAQ.filter(cat => cat.category === selectedCategory)
    : filteredFAQ;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('faq.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('faq.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('faq.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">{t('faq.allCategories')}</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {t(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                size="sm"
              >
                {t('faq.clearFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {displayFAQ.reduce((total, cat) => total + cat.questions.length, 0)} {displayFAQ.reduce((total, cat) => total + cat.questions.length, 0) === 1 ? t('faq.questionFound') : t('faq.questionsFound')}
            </span>
          </div>
        </div>

        {/* FAQ Content */}
        {displayFAQ.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('faq.noQuestionsFound')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('faq.tryAdjusting')}
            </p>
            <Button onClick={clearFilters}>
              {t('faq.clearAllFilters')}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {displayFAQ.map((category) => (
              <Card key={category.category} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <category.icon className="h-6 w-6 text-primary" />
                    {t(category.category)}
                    <Badge variant="secondary" className="ml-auto">
                      {category.questions.length} {category.questions.length === 1 ? t('faq.questionFound') : t('faq.questionsFound')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-medium">{t(item.question)}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {t(item.answer)}
                          {item.question === 'faq.booking.paymentMethods.question' && (
                            <div className="mt-4 pt-4 border-t">
                              <PaymentLogos size="sm" showLabels={false} />
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact Support */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('faq.stillHaveQuestions')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('faq.supportDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="default">
                {t('faq.contactSupport')}
              </Button>
              <Button variant="outline">
                {t('faq.liveChat')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;

