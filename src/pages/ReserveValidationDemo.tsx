// Reserve Validation Demo Page
// Interactive demonstration of reserve validation functionality

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Info,
  Users,
  ArrowRight
} from 'lucide-react';

import { ReserveValidation } from '@/components/ReserveValidation';
import { 
  getAllValidations, 
  getAllSMSWorkflows,
  clearValidationCache
} from '@/lib/reserveValidationApi';
import type { 
  ReserveValidationResponse,
  ValidationStatus,
  SMSWorkflow
} from '@/types/reserveValidation';

export default function ReserveValidationDemo() {
  const [lastResult, setLastResult] = useState<ReserveValidationResponse | null>(null);
  const [allValidations, setAllValidations] = useState<ValidationStatus[]>([]);
  const [allSMSWorkflows, setSMSWorkflows] = useState<SMSWorkflow[]>([]);
  const [activeTab, setActiveTab] = useState('demo');

  /**
   * Handle successful validation
   */
  const handleValidationSuccess = (result: ReserveValidationResponse) => {
    setLastResult(result);
    refreshData();
    
    console.log('Validation completed:', result);
  };

  /**
   * Handle proceed status change
   */
  const handleCanProceed = (canProceed: boolean, phone: string) => {
    console.log('Can proceed status:', canProceed, 'for phone:', phone);
    refreshData();
  };

  /**
   * Refresh validation data
   */
  const refreshData = () => {
    const validations = getAllValidations();
    const workflows = getAllSMSWorkflows();
    
    setAllValidations([...validations]);
    setSMSWorkflows([...workflows]);
  };

  /**
   * Clear all validation cache
   */
  const handleClearCache = () => {
    clearValidationCache();
    setAllValidations([]);
    setSMSWorkflows([]);
    setLastResult(null);
  };

  /**
   * Format validation status for display
   */
  const getValidationStatusInfo = (validation: ValidationStatus) => {
    if (validation.error) {
      return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Error' };
    }
    if (!validation.canReserve) {
      return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cannot Reserve' };
    }
    if (validation.requiresSMS) {
      return { color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare, label: 'SMS Required' };
    }
    return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Can Reserve' };
  };

  /**
   * Format SMS workflow status
   */
  const getSMSStatusInfo = (workflow: SMSWorkflow) => {
    switch (workflow.state) {
      case 'not_required':
        return { color: 'bg-gray-100 text-gray-800', icon: Phone, label: 'Not Required' };
      case 'required':
        return { color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare, label: 'Required' };
      case 'code_sent':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Code Sent' };
      case 'code_verified':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Verified' };
      case 'code_failed':
        return { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Failed' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Reserve Validation Demo
        </h1>
        <p className="text-muted-foreground">
          Interactive demonstration of the reserve_validation API endpoint for pre-reservation checks
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="guide">Usage Guide</TabsTrigger>
          <TabsTrigger value="status">Validations</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Reserve Validation
              </CardTitle>
              <CardDescription>
                Check if reservation is allowed and handle SMS validation workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReserveValidation
                onValidationComplete={handleValidationSuccess}
                onCanProceed={handleCanProceed}
                className="max-w-4xl"
              />
            </CardContent>
          </Card>

          {/* Last Result Display */}
          {lastResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lastResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Last Validation Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lastResult.success && lastResult.data ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {lastResult.data.reserve_validation ? 'YES' : 'NO'}
                        </div>
                        <div className="text-sm text-green-700">Can Reserve</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {lastResult.data.need_sms_validation ? 'YES' : 'NO'}
                        </div>
                        <div className="text-sm text-blue-700">SMS Required</div>
                      </div>
                    </div>

                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                      {JSON.stringify(lastResult.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {lastResult.error?.error || 'Unknown error occurred'}
                      {lastResult.error?.code && (
                        <span className="block text-sm mt-1">
                          Error Code: {lastResult.error.code}
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Usage Guide Tab */}
        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation Workflow</CardTitle>
              <CardDescription>
                Step-by-step guide for using the reserve_validation API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">Check Phone Validation</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter phone number and check if reservation is allowed for that number
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">reserve_validation API call</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">Handle SMS if Required</h3>
                    <p className="text-sm text-muted-foreground">
                      If SMS validation is required, request code and verify it
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">SMS workflow handling</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">Proceed to Reservation</h3>
                    <p className="text-sm text-muted-foreground">
                      Once validation is complete, proceed with reserve_ticket API
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Common Response Scenarios</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">reserve_validation: 1, need_sms_validation: 0</Badge>
                    <span className="text-sm">Can proceed directly to reservation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">reserve_validation: 1, need_sms_validation: 1</Badge>
                    <span className="text-sm">Can reserve after SMS verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">reserve_validation: 0</Badge>
                    <span className="text-sm">Cannot make reservation with this phone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">no_phone</Badge>
                    <span className="text-sm">Phone number missing or invalid</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validations Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Validation Status</h2>
            <div className="flex gap-2">
              <Button onClick={refreshData} variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleClearCache} variant="outline">
                Clear Cache
              </Button>
            </div>
          </div>

          {/* Validations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Phone Validations ({allValidations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allValidations.length === 0 ? (
                <div className="text-center py-8">
                  <Phone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No validations found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allValidations.map((validation, index) => {
                    const statusInfo = getValidationStatusInfo(validation);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{validation.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {validation.checkedAt.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS Workflows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS Workflows ({allSMSWorkflows.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allSMSWorkflows.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No SMS workflows found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allSMSWorkflows.map((workflow, index) => {
                    const statusInfo = getSMSStatusInfo(workflow);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{workflow.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {workflow.attemptsRemaining}/{workflow.maxAttempts} attempts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Examples</CardTitle>
              <CardDescription>
                Sample requests and responses for reserve_validation endpoint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Validation Request</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`{
  "login": "your_login",
  "password": "your_password",
  "v": "1.1",
  "phone": "+440776251258",
  "lang": "en"
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Success Response (No SMS)</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "reserve_validation": true,
    "need_sms_validation": false
  }
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Success Response (SMS Required)</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`{
  "success": true,
  "data": {
    "reserve_validation": true,
    "need_sms_validation": true
  }
}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Error Response</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
{`{
  "success": false,
  "error": {
    "error": "Phone number is missing or invalid",
    "code": "no_phone"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Always run reserve_validation before attempting reserve_ticket
                </AlertDescription>
              </Alert>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Cache validation results for 5 minutes to avoid repeated API calls
                </AlertDescription>
              </Alert>

              <Alert>
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  Implement proper SMS workflow handling for numbers requiring validation
                </AlertDescription>
              </Alert>

              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Use the same phone number in new_order, reserve_validation, and reserve_ticket
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
