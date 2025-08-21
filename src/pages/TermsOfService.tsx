import { Shield, FileText, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TermsOfService = () => {
  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By accessing and using the Starlines website, mobile application, or services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with these terms, please do not use our services.`
    },
    {
      id: "services",
      title: "2. Description of Services",
      content: `Starlines provides bus transportation services across Eastern Europe. Our services include online ticket booking, route information, customer support, and related travel services. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.`
    },
    {
      id: "booking",
      title: "3. Booking and Payment",
      content: `All bookings are subject to availability and confirmation. Payment must be completed at the time of booking. We accept major credit cards, debit cards, and other payment methods as displayed during checkout. Prices are subject to change without notice until payment is confirmed.`
    },
    {
      id: "tickets",
      title: "4. Tickets and Travel",
      content: `Valid identification is required for travel. Passengers must arrive at the departure point at least 30 minutes before scheduled departure. Tickets are non-transferable unless explicitly stated otherwise. Lost or stolen tickets cannot be replaced without proper documentation.`
    },
    {
      id: "cancellation",
      title: "5. Cancellation and Refunds",
      content: `Cancellations made more than 24 hours before departure are eligible for refund minus processing fees. Cancellations within 24 hours of departure may not be eligible for refund. No-shows are not eligible for refunds. Refunds are processed within 7-10 business days.`
    },
    {
      id: "luggage",
      title: "6. Luggage and Personal Items",
      content: `Each passenger is allowed one carry-on bag (max 10kg) and one checked bag (max 20kg). Additional luggage fees apply for excess weight or additional bags. Starlines is not responsible for lost, damaged, or stolen personal items unless caused by our negligence.`
    },
    {
      id: "conduct",
      title: "7. Passenger Conduct",
      content: `Passengers must comply with all safety regulations and crew instructions. Disruptive, abusive, or dangerous behavior may result in removal from the vehicle without refund. Smoking, consumption of alcohol, and illegal substances are prohibited on all vehicles.`
    },
    {
      id: "liability",
      title: "8. Limitation of Liability",
      content: `Starlines' liability is limited to the extent permitted by law. We are not responsible for delays caused by weather, traffic, mechanical issues, or other circumstances beyond our control. Maximum liability for any claim is limited to the ticket price paid.`
    },
    {
      id: "privacy",
      title: "9. Privacy and Data Protection",
      content: `We collect and process personal data in accordance with our Privacy Policy and applicable data protection laws. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.`
    },
    {
      id: "changes",
      title: "10. Changes to Terms",
      content: `Starlines reserves the right to modify these Terms of Service at any time. Changes will be posted on our website and become effective immediately. Continued use of our services after changes constitutes acceptance of the modified terms.`
    },
    {
      id: "governing",
      title: "11. Governing Law",
      content: `These Terms of Service are governed by the laws of Moldova. Any disputes arising from these terms or our services shall be resolved in the courts of Moldova. If any provision is found unenforceable, the remaining provisions remain in full effect.`
    },
    {
      id: "contact",
      title: "12. Contact Information",
      content: `For questions about these Terms of Service, please contact us at legal@starlines.md or call our customer service at +373 22 123 456. Our legal department is available Monday through Friday, 9:00 AM to 6:00 PM.`
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
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using our services. 
              By using Starlines, you agree to comply with and be bound by these terms.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last updated: January 1, 2024
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Version 2.1
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
              Quick Navigation
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
              Questions About Our Terms?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our legal team is here to help clarify any questions you may have about these terms.
            </p>
            <p className="text-sm text-muted-foreground">
              Contact us at <span className="font-medium text-primary">legal@starlines.md</span> or 
              call <span className="font-medium text-primary">+373 22 123 456</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;

