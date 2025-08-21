import { useState } from "react";
import { Search, HelpCircle, FileText, CreditCard, Ticket, Bus, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Mock FAQ data
const faqData = [
  {
    category: "Booking & Tickets",
    icon: Ticket,
    questions: [
      {
        question: "How do I book a bus ticket?",
        answer: "You can book tickets through our website, mobile app, or by calling our customer service. Simply enter your departure and destination cities, select your travel date, choose your preferred route, and complete the payment process."
      },
      {
        question: "Can I change or cancel my ticket?",
        answer: "Yes, you can modify or cancel your ticket up to 2 hours before departure. Changes are subject to availability and may incur additional fees. Cancellations made more than 24 hours before departure are usually refundable."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like PayPal. We also support bank transfers for advance bookings."
      },
      {
        question: "Do I need to print my ticket?",
        answer: "No, you don't need to print your ticket. You can show the digital ticket on your mobile device, or we can send you an SMS with your booking reference. However, printing is recommended as a backup."
      }
    ]
  },
  {
    category: "Travel & Routes",
    icon: Bus,
    questions: [
      {
        question: "How early should I arrive at the bus station?",
        answer: "We recommend arriving at least 30 minutes before departure for domestic routes and 45 minutes for international routes. This allows time for check-in, baggage handling, and boarding procedures."
      },
      {
        question: "What happens if I miss my bus?",
        answer: "If you miss your bus, contact our customer service immediately. Depending on availability and your ticket type, we may be able to rebook you on the next available departure, though additional fees may apply."
      },
      {
        question: "Are there luggage restrictions?",
        answer: "Each passenger is allowed one carry-on bag (max 10kg) and one checked bag (max 20kg). Additional luggage can be transported for an extra fee. Oversized items should be arranged in advance."
      },
      {
        question: "Can I bring pets on board?",
        answer: "Small pets in carriers are allowed on most routes, but must be pre-booked. Service animals travel free of charge. Please check specific route policies as some international routes may have restrictions."
      }
    ]
  },
  {
    category: "Schedules & Timetables",
    icon: Clock,
    questions: [
      {
        question: "How often do buses run?",
        answer: "Frequency varies by route. Popular routes like Chișinău-București may have multiple daily departures, while less frequent routes may run once or twice daily. Check our timetable for specific schedules."
      },
      {
        question: "Are schedules different on weekends and holidays?",
        answer: "Yes, some routes have reduced frequency on weekends and holidays. We recommend checking our holiday schedule or contacting customer service for the most up-to-date information."
      },
      {
        question: "How long do journeys typically take?",
        answer: "Journey times vary by distance and route. For example, Chișinău to București takes approximately 8-10 hours, while shorter domestic routes may take 2-4 hours. Check individual route details for exact times."
      }
    ]
  },
  {
    category: "Safety & Security",
    icon: Shield,
    questions: [
      {
        question: "What safety measures are in place?",
        answer: "All our buses are regularly inspected and maintained. Drivers are professionally trained and licensed. We have 24/7 monitoring and emergency response systems. Seat belts are available on all seats."
      },
      {
        question: "Is travel insurance included?",
        answer: "Basic travel insurance is included with all tickets. This covers medical emergencies and trip cancellations. Additional comprehensive insurance can be purchased during booking for enhanced coverage."
      },
      {
        question: "What should I do in case of an emergency?",
        answer: "In case of emergency, contact our 24/7 emergency hotline immediately. All buses are equipped with emergency exits and first aid kits. Drivers are trained in emergency procedures and can contact emergency services."
      }
    ]
  },
  {
    category: "Customer Service",
    icon: HelpCircle,
    questions: [
      {
        question: "How can I contact customer service?",
        answer: "You can reach us through multiple channels: 24/7 phone support, live chat on our website, email support, or through our mobile app. We also have customer service desks at major bus stations."
      },
      {
        question: "What are your customer service hours?",
        answer: "Our customer service is available 24/7 for urgent matters. General inquiries are handled from 6:00 AM to 10:00 PM daily. Emergency support is always available."
      },
      {
        question: "How do I file a complaint?",
        answer: "You can submit complaints through our website's feedback form, email us directly, or speak with a customer service representative. We aim to respond to all complaints within 48 hours."
      }
    ]
  },
  {
    category: "Pricing & Discounts",
    icon: CreditCard,
    questions: [
      {
        question: "Are there discounts for students or seniors?",
        answer: "Yes, we offer discounts for students (with valid ID), seniors (65+), and children under 12. We also have special rates for group bookings of 10 or more passengers."
      },
      {
        question: "Do you offer loyalty programs?",
        answer: "Yes, our Starlines Rewards program offers points for every journey, which can be redeemed for discounts on future bookings. Members also get access to exclusive deals and early booking opportunities."
      },
      {
        question: "Are there seasonal promotions?",
        answer: "Yes, we regularly run seasonal promotions and special offers. These include summer travel deals, holiday packages, and last-minute discounts. Sign up for our newsletter to stay updated."
      }
    ]
  }
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter FAQ data based on search query
  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
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
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to the most common questions about booking, traveling, and using our services. 
              Can't find what you're looking for? Contact our support team.
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
                    placeholder="Search questions and answers..."
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
                  <option value="">All Categories</option>
                  {allCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {displayFAQ.reduce((total, cat) => total + cat.questions.length, 0)} questions found
            </span>
          </div>
        </div>

        {/* FAQ Content */}
        {displayFAQ.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No questions found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all categories
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {displayFAQ.map((category) => (
              <Card key={category.category} className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <category.icon className="h-6 w-6 text-primary" />
                    {category.category}
                    <Badge variant="secondary" className="ml-auto">
                      {category.questions.length} questions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="font-medium">{item.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
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
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our customer support team is here to help you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="default">
                Contact Support
              </Button>
              <Button variant="outline">
                Live Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;

