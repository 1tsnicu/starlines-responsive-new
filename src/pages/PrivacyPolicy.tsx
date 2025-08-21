import { Shield, Eye, Database, Lock, Users, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PrivacyPolicy = () => {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: Eye,
      content: `Starlines ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, process, and protect your information when you use our website, mobile application, and services. We comply with applicable data protection laws including GDPR.`
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      icon: Database,
      content: `We collect information you provide directly (name, email, phone, payment details), information collected automatically (IP address, browser type, device information, usage data), and information from third parties (payment processors, social media platforms if you choose to connect).`
    },
    {
      id: "how-we-use",
      title: "3. How We Use Your Information",
      icon: Users,
      content: `We use your information to process bookings and payments, provide customer support, send booking confirmations and travel updates, improve our services, comply with legal obligations, prevent fraud and ensure security, and send marketing communications (with your consent).`
    },
    {
      id: "information-sharing",
      title: "4. Information Sharing and Disclosure",
      icon: Shield,
      content: `We do not sell your personal information. We may share your information with service providers (payment processors, IT support), business partners (bus operators), legal authorities when required by law, and in case of business transfers (mergers, acquisitions).`
    },
    {
      id: "data-security",
      title: "5. Data Security",
      icon: Lock,
      content: `We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, access controls, and regular security audits.`
    },
    {
      id: "data-retention",
      title: "6. Data Retention",
      content: `We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law. Booking data is typically retained for 7 years for accounting and legal purposes. Marketing data is retained until you withdraw consent.`
    },
    {
      id: "your-rights",
      title: "7. Your Rights",
      content: `Under GDPR and other applicable laws, you have the right to access, rectify, erase, restrict processing, data portability, object to processing, and withdraw consent. You can exercise these rights by contacting us at privacy@starlines.md.`
    },
    {
      id: "cookies",
      title: "8. Cookies and Tracking",
      content: `We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings. See our Cookie Policy for detailed information about the cookies we use.`
    },
    {
      id: "international-transfers",
      title: "9. International Data Transfers",
      content: `Your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place, including adequacy decisions, standard contractual clauses, or other legally approved mechanisms.`
    },
    {
      id: "children",
      title: "10. Children's Privacy",
      content: `Our services are not directed to children under 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected such information, we will delete it promptly.`
    },
    {
      id: "changes",
      title: "11. Changes to Privacy Policy",
      content: `We may update this Privacy Policy periodically. We will notify you of material changes by email or through our website. The updated policy will be effective when posted. Your continued use constitutes acceptance of changes.`
    },
    {
      id: "contact",
      title: "12. Contact Information",
      content: `For privacy-related questions or to exercise your rights, contact our Data Protection Officer at privacy@starlines.md or write to us at: Starlines Data Protection, Str. Ismail 123, Chișinău MD-2001, Moldova.`
    }
  ];

  const dataTypes = [
    { category: "Personal Information", items: ["Name", "Email address", "Phone number", "Date of birth"] },
    { category: "Payment Information", items: ["Credit card details", "Billing address", "Payment history"] },
    { category: "Travel Information", items: ["Booking history", "Travel preferences", "Special requirements"] },
    { category: "Technical Information", items: ["IP address", "Browser type", "Device information", "Usage analytics"] }
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
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We value your privacy and are committed to protecting your personal data. 
              This policy explains how we collect, use, and safeguard your information.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last updated: January 1, 2024
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                GDPR Compliant
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
              Types of Data We Collect
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
                Exercise Your Privacy Rights
              </h3>
              <p className="text-muted-foreground">
                You have control over your personal data. Contact us to exercise any of these rights:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                "Access your data",
                "Rectify inaccuracies", 
                "Erase your data",
                "Restrict processing",
                "Data portability",
                "Object to processing",
                "Withdraw consent",
                "File a complaint"
              ].map((right) => (
                <div key={right} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">{right}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Contact our Data Protection Officer at{" "}
                <span className="font-medium text-primary">privacy@starlines.md</span> or 
                call <span className="font-medium text-primary">+373 22 123 456</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

