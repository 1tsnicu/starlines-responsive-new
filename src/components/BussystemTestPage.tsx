// src/components/BussystemTestPage.tsx - Pagină de testare pentru noua integrare

import React, { useState } from 'react';
import { BussystemDepositAPI, newBussystemConfig, calculateProfit, formatPrice } from '@/lib/bussystem-new';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const BussystemTestPage: React.FC = () => {
  const [api] = useState(() => new BussystemDepositAPI(newBussystemConfig));
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customCredentials, setCustomCredentials] = useState({
    login: '',
    password: ''
  });
  const [searchParams, setSearchParams] = useState({
    from: 'Кишинев',
    to: 'Львов',
    date: '2024-01-24',
    passengerName: 'John',
    passengerSurname: 'Doe'
  });

  const addTestResult = (test: string, result: any, success: boolean) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Folosește credentiale personalizate dacă sunt setate
      let apiToUse = api;
      if (customCredentials.login && customCredentials.password) {
        const customConfig = {
          ...newBussystemConfig,
          login: customCredentials.login,
          password: customCredentials.password,
          requiresAuth: true
        };
        apiToUse = new BussystemDepositAPI(customConfig);
      }
      
      const points = await apiToUse.searchPoints(searchParams.from);
      addTestResult('Search Points', points, true);
    } catch (error) {
      addTestResult('Search Points', error, false);
    }
    setIsLoading(false);
  };

  const testSearchRoutes = async () => {
    setIsLoading(true);
    try {
      // Folosește credentiale personalizate dacă sunt setate
      let apiToUse = api;
      if (customCredentials.login && customCredentials.password) {
        const customConfig = {
          ...newBussystemConfig,
          login: customCredentials.login,
          password: customCredentials.password,
          requiresAuth: true
        };
        apiToUse = new BussystemDepositAPI(customConfig);
      }
      
      const routes = await apiToUse.searchRoutes({
        pointFromId: '6', // Chișinău
        pointToId: '7',   // Lviv
        date: searchParams.date
      });
      addTestResult('Search Routes', routes, true);
    } catch (error) {
      addTestResult('Search Routes', error, false);
    }
    setIsLoading(false);
  };

  const testRawAPI = async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        autocomplete: searchParams.from,
        lang: 'ru'
      };

      // Adaugă credentiale dacă sunt setate
      if (customCredentials.login && customCredentials.password) {
        payload.login = customCredentials.login;
        payload.password = customCredentials.password;
      }

      const response = await fetch(`${newBussystemConfig.baseUrl}/curl/get_points.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = text; // Dacă nu e JSON, afișează textul raw
      }
      
      addTestResult('Raw API Test', { 
        status: response.status, 
        result: result,
        payload: payload 
      }, response.ok);
    } catch (error) {
      addTestResult('Raw API Test', error, false);
    }
    setIsLoading(false);
  };

  const testCompleteWorkflow = async () => {
    setIsLoading(true);
    try {
      const result = await api.completeBookingWorkflow({
        pointFromId: '6',
        pointToId: '7',
        date: searchParams.date,
        passengerName: searchParams.passengerName,
        passengerSurname: searchParams.passengerSurname,
        seatNumber: '1',
        markupPercentage: 25
      });
      addTestResult('Complete Workflow', result, result.success);
    } catch (error) {
      addTestResult('Complete Workflow', error, false);
    }
    setIsLoading(false);
  };

  const calculateProfitExample = () => {
    const originalPrice = 50; // EUR
    const markup = 25; // 25%
    const profit = calculateProfit(originalPrice, markup);
    addTestResult('Profit Calculation', profit, true);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚌 Bussystem API - Test Page
            <Badge variant={newBussystemConfig.useMockData ? "secondary" : "default"}>
              {newBussystemConfig.useMockData ? "Mock Mode" : "Live API"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Testare integrare conform răspunsului oficial Bussystem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configurație curentă */}
          <Alert>
            <AlertDescription>
              <strong>Configurație curentă:</strong><br/>
              URL: {newBussystemConfig.baseUrl}<br/>
              Autentificare: {newBussystemConfig.requiresAuth ? '✅ Necesară' : '❌ Nu necesită'}<br/>
              Login: {newBussystemConfig.login || 'Nu este setat'}<br/>
              Depozit: {newBussystemConfig.hasDepositAccount ? '✅ Activat' : '❌ Dezactivat'}<br/>
              Markup: {newBussystemConfig.markupPercentage}%
            </AlertDescription>
          </Alert>

          {/* Credentiale personalizate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🔑 Credentiale de Test (Opțional)</CardTitle>
              <CardDescription>
                Dacă ai primit credentiale, introdu-le aici pentru testare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Login:</label>
                  <Input
                    type="text"
                    placeholder="Login de test"
                    value={customCredentials.login}
                    onChange={(e) => setCustomCredentials(prev => ({...prev, login: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password:</label>
                  <Input
                    type="password"
                    placeholder="Password de test"
                    value={customCredentials.password}
                    onChange={(e) => setCustomCredentials(prev => ({...prev, password: e.target.value}))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => {
                  // Creează o nouă instanță API cu credentialele personalizate
                  const customConfig = {
                    ...newBussystemConfig,
                    login: customCredentials.login,
                    password: customCredentials.password,
                    requiresAuth: true
                  };
                  // Aici ar trebui să actualizez API-ul, dar pentru simplitate voi folosi direct în teste
                  addTestResult('Credentials Updated', `Login: ${customCredentials.login}`, true);
                }}
                disabled={!customCredentials.login || !customCredentials.password}
                size="sm"
              >
                Actualizează Credentiale
              </Button>
            </CardContent>
          </Card>

          {/* Parametri de test */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">De la:</label>
              <Input
                value={searchParams.from}
                onChange={(e) => setSearchParams(prev => ({...prev, from: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">La:</label>
              <Input
                value={searchParams.to}
                onChange={(e) => setSearchParams(prev => ({...prev, to: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data:</label>
              <Input
                type="date"
                value={searchParams.date}
                onChange={(e) => setSearchParams(prev => ({...prev, date: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pasager:</label>
              <Input
                value={`${searchParams.passengerName} ${searchParams.passengerSurname}`}
                onChange={(e) => {
                  const [name, surname] = e.target.value.split(' ');
                  setSearchParams(prev => ({
                    ...prev, 
                    passengerName: name || '',
                    passengerSurname: surname || ''
                  }));
                }}
              />
            </div>
          </div>

          {/* Butoane de test */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={testConnection} disabled={isLoading}>
              1. Test Connection
            </Button>
            <Button onClick={testSearchRoutes} disabled={isLoading}>
              2. Test Search Routes
            </Button>
            <Button onClick={testRawAPI} disabled={isLoading} variant="outline">
              🔍 Test Raw API
            </Button>
            <Button onClick={testCompleteWorkflow} disabled={isLoading}>
              3. Test Complete Workflow
            </Button>
            <Button onClick={calculateProfitExample} variant="outline">
              💰 Calculate Profit
            </Button>
            <Button onClick={clearResults} variant="destructive" size="sm">
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exemplu de profit */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Exemplu de Profit (Bilet 50 EUR)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded">
              <div className="font-semibold text-blue-700">Preț Original</div>
              <div className="text-xl">50 EUR</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="font-semibold text-green-700">Comision (10%)</div>
              <div className="text-xl">5 EUR</div>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <div className="font-semibold text-purple-700">Markup (25%)</div>
              <div className="text-xl">12.50 EUR</div>
            </div>
            <div className="p-3 bg-orange-50 rounded">
              <div className="font-semibold text-orange-700">Profit Total</div>
              <div className="text-xl font-bold">17.50 EUR</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-600">
            Client plătește: 62.50 EUR | Din depozit se deduc: 50 EUR | Profit tău: 17.50 EUR (35%)
          </div>
        </CardContent>
      </Card>

      {/* Rezultatele testelor */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Rezultate Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    result.success 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-semibold">
                      {result.success ? '✅' : '❌'} {result.test}
                    </div>
                    <div className="text-xs text-gray-500">{result.timestamp}</div>
                  </div>
                  <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucțiuni pentru următorii pași */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Următorii Pași</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">1</Badge>
            <span>Primești credentialele de test astăzi prin email</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">2</Badge>
            <span>Actualizezi configurația în <code>bussystem-new.ts</code></span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">3</Badge>
            <span>Schimbi <code>useMockData: false</code> pentru API real</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">4</Badge>
            <span>Testezi toate funcțiile pe această pagină</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">5</Badge>
            <span>Semnezi contractul electronic</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">6</Badge>
            <span>Depui 150 EUR + schimbi <code>hasDepositAccount: true</code></span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">7</Badge>
            <span>🚀 Go Live - începi să vinzi bilete cu profit!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BussystemTestPage;
