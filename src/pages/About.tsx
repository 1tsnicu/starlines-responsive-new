import { Star, Users, Award, MapPin, Clock, Shield, Heart, Target, TrendingUp, Globe, Zap, Leaf, Rocket, Compass, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const About = () => {
  const stats = [
    { label: "Years of Service", value: "15+", icon: Clock, description: "Building trust since 2009" },
    { label: "Routes Covered", value: "300+", icon: MapPin, description: "Across 12 countries" },
    { label: "Happy Customers", value: "2M+", icon: Users, description: "Satisfied travelers" },
    { label: "Safety Record", value: "99.9%", icon: Shield, description: "Perfect safety score" }
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety Above All",
      description: "We believe that safety is not just a priority—it's our foundation. Every journey begins with rigorous safety protocols, state-of-the-art vehicle maintenance, and highly trained drivers who prioritize your well-being above everything else.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Heart,
      title: "Passenger-Centric",
      description: "Every decision we make is guided by one question: 'How does this improve our passengers' experience?' From comfortable seating to seamless booking, we put you at the heart of everything we do.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Target,
      title: "Reliability Promise",
      description: "When you choose Starlines, you're choosing dependability. Our 99.9% on-time performance isn't just a statistic—it's our commitment to getting you where you need to be, when you need to be there.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Rocket,
      title: "Innovation Driven",
      description: "We're not just keeping up with technology—we're leading the way. From AI-powered route optimization to eco-friendly vehicles, we're constantly pushing boundaries to create the future of transportation.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Leaf,
      title: "Sustainability First",
      description: "Our commitment to the environment goes beyond compliance. We're actively reducing our carbon footprint through electric buses, renewable energy, and sustainable practices that protect our planet for future generations.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Compass,
      title: "Community Impact",
      description: "We're more than a transportation company—we're a bridge between communities. By connecting people and places, we're helping to build stronger, more connected societies across Eastern Europe.",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const team = [
    {
      name: "Mihai Popescu",
      position: "CEO & Founder",
      bio: "A visionary entrepreneur with 25+ years in transportation, Mihai started Starlines with a simple dream: to make quality bus travel accessible to everyone in Eastern Europe. His passion for innovation and customer service drives our company forward.",
      expertise: ["Strategic Vision", "Industry Leadership", "Customer Experience"],
      image: "/api/placeholder/150/150"
    },
    {
      name: "Elena Dumitrescu",
      position: "Chief Operations Officer",
      bio: "Elena brings military precision to our operations. With a background in logistics and a passion for efficiency, she ensures that every Starlines journey runs like clockwork, maintaining our reputation for reliability.",
      expertise: ["Operations Excellence", "Logistics", "Quality Control"],
      image: "/api/placeholder/150/150"
    },
    {
      name: "Alexandru Ionescu",
      position: "Chief Customer Officer",
      bio: "Alexandru believes that exceptional customer service is an art form. He's built our customer experience team from the ground up, creating a culture where every passenger feels valued and heard.",
      expertise: ["Customer Experience", "Team Building", "Service Innovation"],
      image: "/api/placeholder/150/150"
    },
    {
      name: "Maria Radu",
      position: "Chief Technology Officer",
      bio: "Maria is our digital architect, transforming how people interact with transportation. From our award-winning app to AI-powered route optimization, she's making travel smarter, faster, and more enjoyable.",
      expertise: ["Digital Transformation", "AI & Machine Learning", "Product Development"],
      image: "/api/placeholder/150/150"
    }
  ];

  const achievements = [
    {
      year: "2009",
      title: "The Dream Begins",
      description: "Starlines was born from a simple observation: quality bus travel in Eastern Europe was either too expensive or too unreliable. We started with 3 buses and a big dream.",
      icon: Star,
      impact: "3 routes, 3 buses, unlimited ambition"
    },
    {
      year: "2012",
      title: "Breaking Borders",
      description: "Our first international expansion proved that quality knows no boundaries. We connected Moldova to Romania and Ukraine, showing that great service transcends borders.",
      icon: Globe,
      impact: "50+ routes across 3 countries"
    },
    {
      year: "2015",
      title: "Digital Revolution",
      description: "We launched our first online platform, making booking as easy as a few clicks. This wasn't just an upgrade—it was a complete reimagining of how people book travel.",
      icon: Zap,
      impact: "First online booking platform in the region"
    },
    {
      year: "2018",
      title: "European Expansion",
      description: "Our network grew to cover the heart of Eastern Europe. From the Baltic to the Black Sea, Starlines became synonymous with reliable cross-border travel.",
      icon: MapPin,
      impact: "200+ routes across 8 countries"
    },
    {
      year: "2021",
      title: "Green Revolution",
      description: "We introduced our first electric buses and launched carbon offset programs. Sustainability isn't just good business—it's our responsibility to future generations.",
      icon: Leaf,
      impact: "First electric bus fleet in the region"
    },
    {
      year: "2024",
      title: "Industry Leadership",
      description: "Today, Starlines stands as the most trusted name in Eastern European bus transportation. But we're not resting on our laurels—we're building tomorrow's transportation network.",
      icon: Award,
      impact: "300+ routes, 2M+ satisfied customers"
    }
  ];

  const companyFacts = [
    {
      fact: "Our buses travel the equivalent of 15 trips around the Earth every day",
      icon: Globe
    },
    {
      fact: "We've served coffee to over 500,000 passengers in our premium lounges",
      icon: Star
    },
    {
      fact: "Our drivers speak 8 different languages collectively",
      icon: Users
    },
    {
      fact: "We've helped reunite 2,000+ families through our affordable travel options",
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
              <span className="text-sm font-medium">Our Story</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Connecting Dreams,{" "}
              <span className="text-accent-foreground bg-accent px-4 py-2 rounded-2xl inline-block transform rotate-1">
                One Journey at a Time
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              For over 15 years, Starlines has been more than just a bus company. 
              We're the bridge between people and possibilities, connecting communities 
              across Eastern Europe with reliability, comfort, and care.
            </p>

            {/* Mission Statement */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
              <p className="text-lg text-white/90">
                "To democratize quality transportation by making safe, comfortable, and 
                reliable bus travel accessible to everyone in Eastern Europe, while 
                building bridges between communities and fostering sustainable growth."
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
              What Drives Us
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Our values aren't just words on a wall—they're the principles that guide 
              every decision we make and every action we take.
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
              The Minds Behind the Magic
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Meet the passionate leaders who turn our vision into reality, 
              driving innovation and excellence in everything we do.
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
              Our Journey Through Time
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Every milestone tells a story of growth, innovation, and unwavering 
              commitment to our passengers and communities.
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
              Did You Know?
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Some fascinating facts about Starlines that make us unique
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
            Ready to Be Part of Our Story?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Join millions of satisfied travelers who've discovered that with Starlines, 
            every journey is an adventure waiting to happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8 py-3">
              <Rocket className="h-5 w-5 mr-2" />
              Start Your Journey
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200"
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

