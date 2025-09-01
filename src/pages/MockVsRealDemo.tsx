import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getPoints, getRoutes, ping } from '@/lib/bussystem';
import { mockBussystemAPI } from '@/lib/mock-data';

export default function MockVsRealDemo() {
  const [useMock, setUseMock] = useState(
    import.meta.env.VITE_USE_MOCK_BUSSYSTEM === "true" || 
    !import.meta.env.VITE_BUSS_LOGIN
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async (endpoint: 'ping' | 'points' | 'routes') => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;
      
      if (useMock) {
        // Use mock API directly
        switch (endpoint) {
          case 'ping':
            data = await mockBussystemAPI.ping();
            break;
          case 'points':
            data = await mockBussystemAPI.getPoints({ autocomplete: 'Chi' });
            break;
          case 'routes':
            data = await mockBussystemAPI.getRoutes({
              date: '2024-12-01',
              id_from: '1',
              id_to: '2'
            });
            break;
        }
      } else {
        // Use real API (will use mock if credentials missing)
        switch (endpoint) {
          case 'ping':
            data = await ping();
            break;
          case 'points':
            data = await getPoints({ autocomplete: 'Chi' });
            break;
          case 'routes':
            data = await getRoutes({
              date: '2024-12-01',
              id_from: '1',
              id_to: '2'
            });
            break;
        }
      }
      
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const currentMode = useMock ? 'Mock API' : 'Real API';
  const envMockEnabled = import.meta.env.VITE_USE_MOCK_BUSSYSTEM === "true";
  const hasCredentials = !!import.meta.env.VITE_BUSS_LOGIN;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mock vs Real API Demo</h1>
        <p className="text-muted-foreground">
          Test your integration with both mock data and the real Bussystem API
        </p>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration</CardTitle>
          <CardDescription>API mode and environment settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Current Mode: <Badge variant={useMock ? 'secondary' : 'default'}>{currentMode}</Badge></Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>ENV Mock Setting: <Badge variant={envMockEnabled ? 'destructive' : 'outline'}>{envMockEnabled ? 'Enabled' : 'Disabled'}</Badge></div>
                <div>Has Credentials: <Badge variant={hasCredentials ? 'default' : 'destructive'}>{hasCredentials ? 'Yes' : 'No'}</Badge></div>
                <div>Auto-Mock in Dev: <Badge variant={!hasCredentials ? 'secondary' : 'outline'}>{!hasCredentials ? 'Active' : 'Inactive'}</Badge></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={useMock} 
                onCheckedChange={setUseMock}
                disabled={envMockEnabled}
              />
              <Label>Force Mock Mode</Label>
            </div>
          </div>

          {envMockEnabled && (
            <Alert>
              <AlertDescription>
                Mock mode is forced via VITE_USE_MOCK_BUSSYSTEM environment variable
              </AlertDescription>
            </Alert>
          )}

          {!hasCredentials && (
            <Alert>
              <AlertDescription>
                No API credentials found. Add VITE_BUSS_LOGIN to your .env file to use real API
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Test API Endpoints</CardTitle>
          <CardDescription>Try different endpoints with current mode: {currentMode}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => testAPI('ping')} 
              disabled={loading}
              variant="outline"
            >
              Test Ping
            </Button>
            <Button 
              onClick={() => testAPI('points')} 
              disabled={loading}
              variant="outline"
            >
              Test Points (Chișinău)
            </Button>
            <Button 
              onClick={() => testAPI('routes')} 
              disabled={loading}
              variant="outline"
            >
              Test Routes (Chi→Buc)
            </Button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Testing {currentMode}...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-2">
              <Label>Response ({currentMode}):</Label>
              <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle>How to Switch Between Mock and Real API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <strong>Option 1: Environment Variable</strong>
              <pre className="bg-muted p-2 rounded mt-1">VITE_USE_MOCK_BUSSYSTEM=true</pre>
            </div>
            
            <div>
              <strong>Option 2: Missing Credentials (Auto-Mock)</strong>
              <p className="text-muted-foreground">When VITE_BUSS_LOGIN is empty, mock API is used automatically in development</p>
            </div>
            
            <div>
              <strong>Option 3: Code-level Switch</strong>
              <pre className="bg-muted p-2 rounded mt-1">{`// In your components
import { mockBussystemAPI } from '@/lib/mock-data';

// Use mock directly
const routes = await mockBussystemAPI.getRoutes(params);`}</pre>
            </div>

            <div>
              <strong>Production Setup</strong>
              <pre className="bg-muted p-2 rounded mt-1">{`VITE_BUSS_LOGIN=your-real-username
VITE_BUSS_PASSWORD=your-real-password
VITE_USE_MOCK_BUSSYSTEM=false`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
