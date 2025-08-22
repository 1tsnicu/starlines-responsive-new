import { Star, Users, Award, MapPin, Clock, Shield, Heart, Target, TrendingUp, Globe, Zap, Leaf, Rocket, Compass, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";

const About = () => {
  const { t } = useLocalization();
  
  const stats = [
    { label: t('about.yearsOfService'), value: "15+", icon: Clock, description: t('about.buildingTrust') },
    { label: t('about.routesCovered'), value: "300+", icon: MapPin, description: t('about.acrossCountries') },
    { label: t('about.happyCustomers'), value: "2M+", icon: Users, description: t('about.satisfiedTravelers') },
    { label: t('about.safetyRecord'), value: "99.9%", icon: Shield, description: t('about.perfectSafetyScore') }
  ];

  const values = [
    {
      icon: Shield,
      title: t('about.safetyAboveAll'),
      description: t('about.safetyDescription'),
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Heart,
      title: t('about.passengerCentric'),
      description: t('about.passengerDescription'),
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Target,
      title: t('about.reliabilityPromise'),
      description: t('about.reliabilityDescription'),
      color: "from-green-500 to-green-600"
    },
    {
      icon: Rocket,
      title: t('about.innovationDriven'),
      description: t('about.innovationDescription'),
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Leaf,
      title: t('about.sustainabilityFirst'),
      description: t('about.sustainabilityDescription'),
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Compass,
      title: t('about.communityImpact'),
      description: t('about.communityDescription'),
      color: "from-orange-500 to-orange-600"
    }
  ];

  const team = [
    {
      name: "Mihai Popescu",
      position: t('about.ceoFounder'),
      bio: t('about.mihaiBio'),
      expertise: [t('about.strategicVision'), t('about.industryLeadership'), t('about.customerExperience')],
      image: "/api/placeholder/150/150"
    },
    {
      name: "Elena Dumitrescu",
      position: t('about.coo'),
      bio: t('about.elenaBio'),
      expertise: [t('about.operationsExcellence'), t('about.logistics'), t('about.qualityControl')],
      image: "/api/placeholder/150/150"
    },
    {
      name: "Alexandru Ionescu",
      position: t('about.cco'),
      bio: t('about.alexandruBio'),
      expertise: [t('about.customerExperience'), t('about.teamBuilding'), t('about.serviceInnovation')],
      image: "/api/placeholder/150/150"
    },
    {
      name: "Maria Radu",
      position: t('about.cto'),
      bio: t('about.mariaBio'),
      expertise: [t('about.digitalTransformation'), t('about.aiMachineLearning'), t('about.productDevelopment')],
      image: "/api/placeholder/150/150"
    }
  ];

  const achievements = [
    {
      year: "2009",
      title: t('about.dreamBegins'),
      description: t('about.dreamDescription'),
      icon: Star,
      impact: t('about.dreamImpact')
    },
    {
      year: "2012",
      title: t('about.breakingBorders'),
      description: t('about.bordersDescription'),
      icon: Globe,
      impact: t('about.bordersImpact')
    },
    {
      year: "2015",
      title: t('about.digitalRevolution'),
      description: t('about.digitalDescription'),
      icon: Zap,
      impact: t('about.digitalImpact')
    },
    {
      year: "2018",
      title: t('about.europeanExpansion'),
      description: t('about.expansionDescription'),
      icon: MapPin,
      impact: t('about.expansionImpact')
    },
    {
      year: "2021",
      title: t('about.greenRevolution'),
      description: t('about.greenDescription'),
      icon: Leaf,
      impact: t('about.greenImpact')
    },
    {
      year: "2024",
      title: t('about.industryLeadershipTitle'),
      description: t('about.leadershipDescription'),
      icon: Award,
      impact: t('about.leadershipImpact')
    }
  ];

  const companyFacts = [
    {
      fact: t('about.earthTrips'),
      icon: Globe
    },
    {
      fact: t('about.coffeeServed'),
      icon: Star
    },
    {
      fact: t('about.languagesSpoken'),
      icon: Users
    },
    {
      fact: t('about.familiesReunited'),
      icon: Heart
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="container py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">{t('about.ourStory')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('about.connectingDreams')}{" "}
              <span className="text-accent-foreground bg-accent px-4 py-2 rounded-2xl inline-block transform rotate-1">
                {t('about.oneJourneyAtTime')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              {t('about.heroDescription')}
            </p>

            {/* Mission Statement */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-3">{t('about.mission')}</h2>
              <p className="text-lg text-white/90">
                {t('about.missionStatement')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-surface">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="text-center border-border hover-lift bg-white">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold text-foreground mb-2">
                      {stat.label}
                    </div>
                    <div className="text-sm text-foreground/70">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('about.whatDrivesUs')}
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              {t('about.valuesDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="border-border hover-lift group bg-white">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                      {value.title}
                    </h3>
                    <p className="text-foreground/70 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="py-20 bg-surface">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('about.mindsBehindheMagic')}
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              {t('about.teamDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="border-border hover-lift bg-white">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="text-muted-foreground text-sm">Photo</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {member.name}
                      </h3>
                      <p className="text-primary font-medium mb-3">
                        {member.position}
                      </p>
                      <p className="text-foreground/70 text-sm mb-4 leading-relaxed">
                        {member.bio}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('about.journeyThroughTime')}
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              {t('about.timelineDescription')}
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-muted-foreground/20"></div>
            
            <div className="space-y-12">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={achievement.year} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    {/* Timeline dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg"></div>
                    
                    {/* Content */}
                    <div className={`w-5/12 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                      <Card className="border-border hover-lift bg-white">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <Badge variant="secondary" className="text-sm font-medium">
                              {achievement.year}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-foreground/70 mb-3 leading-relaxed">
                            {achievement.description}
                          </p>
                          <div className="text-xs text-primary font-medium">
                            {achievement.impact}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="py-20 bg-surface">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t('about.didYouKnow')}
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              {t('about.factsDescription')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyFacts.map((fact, index) => {
              const Icon = fact.icon;
              return (
                <Card key={index} className="border-border bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-accent" />
                      </div>
                      <p className="text-foreground/80 text-sm leading-relaxed">
                        {fact.fact}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t('about.readyToBePartOfStory')}
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            {t('about.ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
              <Rocket className="h-5 w-5 mr-2" />
              {t('about.startYourJourney')}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200"
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              {t('about.learnMore')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

