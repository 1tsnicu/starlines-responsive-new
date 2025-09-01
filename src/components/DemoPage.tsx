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
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Starlight Routes - Sistema API Demo
            </h1>
            <p className="mt-2 text-gray-600">
              Interface pentru testarea și demonstrarea funcționalităților Bussystem API
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS Validation
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Get Order
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Reserve Validation
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setActiveTab('sms')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    SMS Validation
                  </CardTitle>
                  <CardDescription>
                    Sistem complet de validare prin SMS cu rate limiting și error handling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">Two-step workflow</Badge>
                    <Badge variant="secondary">Rate limiting</Badge>
                    <Badge variant="secondary">Real-time validation</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Implementează workflow-ul complet: send_sms=1 → check_sms=1 + validation_code
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('orders')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-green-600" />
                    Get Order
                  </CardTitle>
                  <CardDescription>
                    Sistem pentru căutarea și afișarea informațiilor complete ale comenzilor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">Order details</Badge>
                    <Badge variant="secondary">Status tracking</Badge>
                    <Badge variant="secondary">Payment links</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Afișează pasageri, rute, bilete, bagaje și opțiuni de plată
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('validation')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                    Reserve Validation
                  </CardTitle>
                  <CardDescription>
                    Validarea pre-rezervării cu integrare SMS automată
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">Pre-booking check</Badge>
                    <Badge variant="secondary">SMS integration</Badge>
                    <Badge variant="secondary">Caching</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Verifică dacă rezervarea este permisă și dacă necesită validare SMS
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Starea curentă a tuturor sistemelor implementate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">SMS Validation API</div>
                      <div className="text-sm text-green-600">Operational</div>
                    </div>
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">Get Order API</div>
                      <div className="text-sm text-green-600">Operational</div>
                    </div>
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-green-800">Reserve Validation</div>
                      <div className="text-sm text-green-600">Operational</div>
                    </div>
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Acțiuni rapide pentru testarea sistemelor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button 
                    onClick={() => setActiveTab('sms')}
                    className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Test SMS</div>
                    <div className="text-sm text-muted-foreground">Trimite cod de validare</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Caută Comandă</div>
                    <div className="text-sm text-muted-foreground">Order ID: 1026448</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('validation')}
                    className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">Validare Telefon</div>
                    <div className="text-sm text-muted-foreground">Verifică eligibilitatea</div>
                  </button>
                  <button 
                    onClick={() => window.open('https://test-api.bussystem.eu/server', '_blank')}
                    className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium">API Docs</div>
                    <div className="text-sm text-muted-foreground">Documentație Bussystem</div>
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
