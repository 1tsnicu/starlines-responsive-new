/**
 * GET ROUTES DEMO PAGE
 * 
 * Pagină demonstrativă completă pentru sistemul get_routes
 * Include toate funcționalitățile: căutare, filtrare, revalidare, etc.
 */

import React, { useState } from 'react';
import { 
  Bus, 
  BookOpen, 
  Search, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import RouteSearchPage from '@/components/RouteSearchPage';
import { getCacheStats, clearCache } from '@/lib/routesApi';

const RoutesDemo: React.FC = () => {
  const [cacheStats, setCacheStats] = useState(getCacheStats());
  
  const updateCacheStats = () => {
    setCacheStats(getCacheStats());
  };
  
  const handleClearCache = () => {
    clearCache();
    updateCacheStats();
  };
  
  const features = [
    {
      icon: <Search className="h-5 w-5" />,
      title: "Căutare Inteligentă",
      description: "Căutare BUS cu fallback XML→JSON și rate limiting",
      details: [
        "Progressive WS modes (1→0, evită 2)",
        "Caching multi-nivel (2min search, 30s revalidation)",
        "Rate limiting (10/min, 100/h)",
        "Retry logic pentru erori network"
      ]
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: "Normalizare Completă",
      description: "Transformă răspunsuri XML/JSON în modele TypeScript",
      details: [
        "RouteOption cu segmente TripSegment",
        "Transfer info (change_stations, transfer_time)",
        "Cancel policies și booking constraints",
        "Timezone handling și datetime parsing"
      ]
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Revalidare Automată",
      description: "Confirmă rutele găsite cu 'change' parameter",
      details: [
        "Detectează când e nevoie de revalidare",
        "Re-cheamă get_routes fără 'change'",
        "Cache separat pentru revalidări",
        "Handling graceful pentru erori"
      ]
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Performance Optimized",
      description: "Cache intelligent și request batching",
      details: [
        "Search cache: 2 minute TTL",
        "Revalidation cache: 30 secunde",
        "Cleanup automat la 5 minute",
        "Debouncing pe input utilizator"
      ]
    }
  ];
  
  const implementationSteps = [
    {
      step: 1,
      title: "Validare Input",
      description: "Date format, range validation, required fields",
      status: "complete"
    },
    {
      step: 2, 
      title: "API Call cu Fallback",
      description: "WS mode progression (1→0), XML→JSON parsing",
      status: "complete"
    },
    {
      step: 3,
      title: "Normalizare Răspuns",
      description: "Raw data → RouteOption[] cu validări",
      status: "complete"
    },
    {
      step: 4,
      title: "Caching & Rate Limit", 
      description: "Multi-level cache cu cleanup automat",
      status: "complete"
    },
    {
      step: 5,
      title: "UI Integration",
      description: "Form, rezultate, filtre, sortare",
      status: "complete"
    },
    {
      step: 6,
      title: "Error Handling",
      description: "User-friendly messages cu retry options",
      status: "complete"
    }
  ];
  
  const businessRules = [
    {
      rule: "Rate Limiting",
      description: "~100:1 ratio (calls ≈ paid orders)",
      implementation: "10 calls/min, 100 calls/hour per user",
      status: "enforced"
    },
    {
      rule: "No Route Sweeping", 
      description: "Nu căuta automat pe multiple zile",
      implementation: "Single search per user intent, period param pentru flexibilitate",
      status: "enforced"
    },
    {
      rule: "Pricing Disclaimer",
      description: "Prețurile din get_routes sunt INFORMATIVE",
      implementation: "UI shows 'informative only', real price din new_order",
      status: "enforced"
    },
    {
      rule: "Revalidation Required",
      description: "Routes with 'change' trebuie revalidate",
      implementation: "Auto-detect și re-call fără 'change' parameter",
      status: "automated"
    }
  ];
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🚌 GET ROUTES System Demo</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Sistem complet pentru căutarea rutelor de transport cu BUS API. 
          Include toate funcționalitățile: XML fallback, caching, revalidare, rate limiting.
        </p>
        
        <div className="flex justify-center gap-4">
          <Badge variant="secondary" className="text-sm">
            BUS Transport Focus
          </Badge>
          <Badge variant="secondary" className="text-sm">
            XML→JSON Fallback
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Rate Limited
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Cache Optimized
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo" className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            Live Demo
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="implementation" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Implementation
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Business Rules
          </TabsTrigger>
        </TabsList>
        
        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Interactive Route Search</h2>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Cache: {cacheStats.searches} searches, {cacheStats.revalidations} revalidations
              </div>
              <Button variant="outline" size="sm" onClick={handleClearCache}>
                Clear Cache
              </Button>
            </div>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Instructions:</strong> Selectează două orașe (ex: București → Cluj), 
              alege data și pornește căutarea. Sistemul va demonstra toate funcționalitățile: 
              caching, fallback modes, revalidare, filtrare.
            </AlertDescription>
          </Alert>
          
          <RouteSearchPage />
        </TabsContent>
        
        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <h2 className="text-2xl font-bold">Core Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {feature.icon}
                    </div>
                    {feature.title}
                  </CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Implementation Tab */}
        <TabsContent value="implementation" className="space-y-6">
          <h2 className="text-2xl font-bold">Implementation Steps</h2>
          
          <div className="space-y-4">
            {implementationSteps.map((step, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {step.step}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    
                    <Badge variant={step.status === 'complete' ? 'default' : 'secondary'}>
                      {step.status === 'complete' ? '✓ Complete' : 'In Progress'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>File Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-muted p-4 rounded overflow-auto">
{`src/types/routes.ts              ✅ Complete TypeScript types
src/lib/routesHttp.ts             ✅ HTTP client with XML fallback  
src/lib/normalizeRoutes.ts        ✅ Response normalizers
src/lib/routesApi.ts              ✅ Main API client with caching
src/components/RouteSearchPage.tsx ✅ Full UI component
src/pages/RoutesDemo.tsx          ✅ Demo page`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Business Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <h2 className="text-2xl font-bold">Business Rules & Compliance</h2>
          
          <div className="space-y-4">
            {businessRules.map((rule, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{rule.rule}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                      <p className="text-sm"><strong>Implementation:</strong> {rule.implementation}</p>
                    </div>
                    
                    <Badge variant={rule.status === 'enforced' ? 'default' : 'secondary'}>
                      {rule.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Compliance Status:</strong> Toate regulile business sunt implementate și respectate. 
              Sistemul este optimizat pentru utilizare în producție cu rate limiting, caching și error handling.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Integration with new_order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                După selectarea unei rute, următorii pași pentru integrarea cu new_order:
              </p>
              
              <ol className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  Pentru fiecare segment din RouteOption.segments, rulează API-urile necesare:
                </li>
                <li className="flex gap-2 ml-4">
                  <span>•</span>
                  <code>get_free_seats</code> dacă segment.request_get_free_seats === 1
                </li>
                <li className="flex gap-2 ml-4">
                  <span>•</span>
                  <code>get_plan</code> dacă segment.has_plan === 1 sau 2
                </li>
                <li className="flex gap-2 ml-4">
                  <span>•</span>
                  <code>get_discount</code> dacă segment.request_get_discount === 1
                </li>
                <li className="flex gap-2 ml-4">
                  <span>•</span>
                  <code>get_baggage</code> dacă segment.request_get_baggage === 1
                </li>
                
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  Construiește payload pentru new_order cu toate segmentele
                </li>
                
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  Respectă cerințele per segment: need_birth, need_doc, need_citizenship
                </li>
                
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  Trimite UN SINGUR new_order cu toate segmentele
                </li>
                
                <li className="flex gap-2">
                  <span className="font-bold">5.</span>
                  Preia price_total și lock_min din răspuns (prețul REAL)
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoutesDemo;
