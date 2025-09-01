// Main Demo Page - Accesează toate sistemele prin UI
// Combină SMS Validation și Get Order într-o interfață unificată

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  FileText, 
  Smartphone, 
  Search, 
  Settings,
  CheckCircle
} from 'lucide-react';

import { SMSValidationDemo } from '@/components/SMSValidationDemo';
import { GetOrderDemo } from '@/components/GetOrderDemo';
import { ReserveValidation } from '@/components/ReserveValidation';
import { DemoNavigation } from '@/components/DemoNavigation';

interface DemoPageProps {
  className?: string;
}

export function DemoPage({ className = '' }: DemoPageProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Starlight Routes - Sistema API Demo
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Interface pentru testarea și demonstrarea funcționalităților Bussystem API
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          {/* Responsive Navigation */}
          <DemoNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            className="mb-6"
          />

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setActiveTab('sms')}>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    SMS Validation
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Sistem complet de validare prin SMS cu rate limiting și error handling
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Two-step workflow</Badge>
                      <Badge variant="secondary" className="text-xs">Rate limiting</Badge>
                      <Badge variant="secondary" className="text-xs">Real-time validation</Badge>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                    Implementează workflow-ul complet: send_sms=1 → check_sms=1 + validation_code
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('orders')}>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    Get Order
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Sistem pentru căutarea și afișarea informațiilor complete ale comenzilor
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Order details</Badge>
                      <Badge variant="secondary" className="text-xs">Status tracking</Badge>
                      <Badge variant="secondary" className="text-xs">Payment links</Badge>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                    Afișează pasageri, rute, bilete, bagaje și opțiuni de plată
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('validation')}>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    Reserve Validation
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Validarea pre-rezervării cu integrare SMS automată
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Pre-booking check</Badge>
                      <Badge variant="secondary" className="text-xs">SMS integration</Badge>
                      <Badge variant="secondary" className="text-xs">Caching</Badge>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                    Verifică dacă rezervarea este permisă și dacă necesită validare SMS
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">System Status</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Starea curentă a tuturor sistemelor implementate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800 text-sm sm:text-base">SMS Validation API</div>
                      <div className="text-xs sm:text-sm text-green-600">Operational</div>
                    </div>
                    <div className="h-2 w-2 sm:h-3 sm:w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800 text-sm sm:text-base">Get Order API</div>
                      <div className="text-xs sm:text-sm text-green-600">Operational</div>
                    </div>
                    <div className="h-2 w-2 sm:h-3 sm:w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg sm:col-span-2 xl:col-span-1">
                    <div>
                      <div className="font-medium text-green-800 text-sm sm:text-base">Reserve Validation</div>
                      <div className="text-xs sm:text-sm text-green-600">Operational</div>
                    </div>
                    <div className="h-2 w-2 sm:h-3 sm:w-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Acțiuni rapide pentru testarea sistemelor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button 
                    onClick={() => setActiveTab('sms')}
                    className="p-3 sm:p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm sm:text-base">Test SMS</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Trimite cod de validare</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="p-3 sm:p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm sm:text-base">Caută Comandă</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Order ID: 1026448</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('validation')}
                    className="p-3 sm:p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm sm:text-base">Validare Telefon</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Verifică eligibilitatea</div>
                  </button>
                  <button 
                    onClick={() => window.open('https://test-api.bussystem.eu/server', '_blank')}
                    className="p-3 sm:p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm sm:text-base">API Docs</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Documentație Bussystem</div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Validation Tab */}
          <TabsContent value="sms">
            <SMSValidationDemo />
          </TabsContent>

          {/* Get Order Tab */}
          <TabsContent value="orders">
            <GetOrderDemo />
          </TabsContent>

          {/* Reserve Validation Tab */}
          <TabsContent value="validation">
            <Card>
              <CardHeader>
                <CardTitle>Reserve Validation System</CardTitle>
                <CardDescription>
                  Testează sistemul de validare pre-rezervare cu integrare SMS automată
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReserveValidation
                  onValidationComplete={(result) => {
                    console.log('✅ Validare completă:', result);
                  }}
                  onCanProceed={(canProceed, phone) => {
                    console.log(`🚀 Poate proceda: ${canProceed} pentru ${phone}`);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
