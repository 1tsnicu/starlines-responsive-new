import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  User, 
  Send, 
  CheckCircle,
  AlertCircle,
  Building,
  Clock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/PageHeader";
import { useLocalization } from "@/contexts/LocalizationContext";

const Contacts = () => {
  const { t } = useLocalization();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    destination: "",
    date: "",
    adults: 1,
    minors: 0,
    minorAge: "",
    phone: "",
    email: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('contacts.form.validation.firstName.required');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('contacts.form.validation.lastName.required');
    }

    if (!formData.destination.trim()) {
      newErrors.destination = t('contacts.form.validation.destination.required');
    }

    if (!formData.date) {
      newErrors.date = t('contacts.form.validation.date.required');
    }

    if (formData.minors > 0 && !formData.minorAge) {
      newErrors.minorAge = t('contacts.form.validation.minorAge.required');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('contacts.form.validation.phone.required');
    } else if (!/^(\+373|0)[0-9]{8}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = t('contacts.form.validation.phone.invalid');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contacts.form.validation.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('contacts.form.validation.email.invalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after successful submission
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: "",
        lastName: "",
        destination: "",
        date: "",
        adults: 1,
        minors: 0,
        minorAge: "",
        phone: "",
        email: "",
        message: ""
      });
    }, 5000);
  };

  const popularDestinations = [
    t('contacts.popularDestinations.berlin'),
    t('contacts.popularDestinations.munich'),
    t('contacts.popularDestinations.frankfurt'),
    t('contacts.popularDestinations.vienna'),
    t('contacts.popularDestinations.warsaw'),
    t('contacts.popularDestinations.prague'),
    t('contacts.popularDestinations.bucharest'),
    t('contacts.popularDestinations.istanbul')
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={t('contacts.title')}
        description={t('contacts.description')}
        breadcrumbs={[
          { label: t('contacts.breadcrumbHome'), href: "/" },
          { label: t('contacts.breadcrumbContacts'), href: "/contacts" }
        ]}
      />

      {/* Contact Information Section */}
      <div className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('contacts.weAreHereToHelp.title')}
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              {t('contacts.weAreHereToHelp.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('contacts.email.title')}</h3>
                <p className="text-foreground/70 mb-4">{t('contacts.email.description')}</p>
                <a 
                  href="mailto:contact@starlines.md" 
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  contact@starlines.md
                </a>
              </CardContent>
            </Card>

            <Card className="border-border bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('contacts.phone.title')}</h3>
                <p className="text-foreground/70 mb-4">{t('contacts.phone.description')}</p>
                <a 
                  href="tel:+37360123456" 
                  className="text-green-600 hover:text-green-700 font-medium hover:underline"
                >
                  +373 60 12 34 56
                </a>
              </CardContent>
            </Card>

            <Card className="border-border bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('contacts.schedule.title')}</h3>
                <p className="text-foreground/70 mb-4">{t('contacts.schedule.weekdays')}</p>
                <p className="text-foreground/70">{t('contacts.schedule.saturday')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="py-16">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('contacts.form.title')}
            </h2>
            <p className="text-lg text-foreground/70">
              {t('contacts.form.description')}
            </p>
          </div>

          {isSubmitted ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  {t('contacts.success.title')}
                </h3>
                <p className="text-green-700 mb-4">
                  {t('contacts.success.description')}
                </p>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {t('contacts.success.responseTime')}
                </Badge>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <User className="h-5 w-5" />
                  {t('contacts.form.personalInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('contacts.form.personalInfo.section')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-foreground">
                          {t('contacts.form.firstName.label')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={`mt-1 ${errors.firstName ? "border-red-500" : ""}`}
                          placeholder={t('contacts.form.firstName.placeholder')}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.firstName}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName" className="text-foreground">
                          {t('contacts.form.lastName.label')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={`mt-1 ${errors.lastName ? "border-red-500" : ""}`}
                          placeholder={t('contacts.form.lastName.placeholder')}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Travel Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t('contacts.form.travelDetails.section')}
                    </h3>
                    
                    <div>
                      <Label htmlFor="destination" className="text-foreground">
                        {t('contacts.form.destination.label')} <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.destination} 
                        onValueChange={(value) => handleInputChange("destination", value)}
                      >
                        <SelectTrigger className={`mt-1 ${errors.destination ? "border-red-500" : ""}`}>
                          <SelectValue placeholder={t('contacts.form.destination.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {popularDestinations.map((dest) => (
                            <SelectItem key={dest} value={dest}>{dest}</SelectItem>
                          ))}
                          <SelectItem value="other">{t('contacts.form.destination.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.destination === "other" && (
                        <Input
                          className="mt-2"
                          placeholder={t('contacts.form.destination.otherPlaceholder')}
                          onChange={(e) => handleInputChange("destination", e.target.value)}
                        />
                      )}
                      {errors.destination && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.destination}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="date" className="text-foreground">
                        {t('contacts.form.date.label')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className={`mt-1 ${errors.date ? "border-red-500" : ""}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.date && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.date}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Passengers */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t('contacts.form.passengers.section')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="adults" className="text-foreground">
                          {t('contacts.form.adults.label')}
                        </Label>
                        <Select 
                          value={formData.adults.toString()} 
                          onValueChange={(value) => handleInputChange("adults", parseInt(value))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="minors" className="text-foreground">
                          {t('contacts.form.minors.label')}
                        </Label>
                        <Select 
                          value={formData.minors.toString()} 
                          onValueChange={(value) => handleInputChange("minors", parseInt(value))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4].map((num) => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {formData.minors > 0 && (
                        <div>
                          <Label htmlFor="minorAge" className="text-foreground">
                            {t('contacts.form.minorAge.label')} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="minorAge"
                            value={formData.minorAge}
                            onChange={(e) => handleInputChange("minorAge", e.target.value)}
                            className={`mt-1 ${errors.minorAge ? "border-red-500" : ""}`}
                            placeholder={t('contacts.form.minorAge.placeholder')}
                          />
                          {errors.minorAge && (
                            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.minorAge}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t('contacts.form.contactInfo.section')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-foreground">
                          {t('contacts.form.phone.label')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className={`mt-1 ${errors.phone ? "border-red-500" : ""}`}
                          placeholder={t('contacts.form.phone.placeholder')}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.phone}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="email" className="text-foreground">
                          {t('contacts.form.email.label')} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                          placeholder={t('contacts.form.email.placeholder')}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Message */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t('contacts.form.additionalMessage.section')}
                    </h3>
                    
                    <div>
                      <Label htmlFor="message" className="text-foreground">
                        {t('contacts.form.message.label')}
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className="mt-1 min-h-[100px]"
                        placeholder={t('contacts.form.message.placeholder')}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full md:w-auto px-8 py-3 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {t('contacts.form.submit.sending')}
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          {t('contacts.form.submit.send')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Company Information */}
      <div className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {t('contacts.company.about.title')}
              </h2>
              <p className="text-foreground/70 mb-6 text-lg leading-relaxed">
                {t('contacts.company.about.description')}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <span className="text-foreground/70">{t('contacts.company.registered')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <span className="text-foreground/70">{t('contacts.company.routes')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-foreground/70">{t('contacts.company.passengers')}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-lg border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {t('contacts.company.whyChoose.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contacts.company.competitivePrices.title')}</h4>
                    <p className="text-sm text-foreground/70">{t('contacts.company.competitivePrices.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contacts.company.personalizedService.title')}</h4>
                    <p className="text-sm text-foreground/70">{t('contacts.company.personalizedService.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contacts.company.guaranteedSafety.title')}</h4>
                    <p className="text-sm text-foreground/70">{t('contacts.company.guaranteedSafety.description')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contacts.company.support24.title')}</h4>
                    <p className="text-sm text-foreground/70">{t('contacts.company.support24.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;

