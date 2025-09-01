// Get Order Demo component
// Demonstrates the complete order retrieval and display functionality

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  FileText, 
  CreditCard, 
  Users, 
  Ticket, 
  RefreshCw,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';

import { OrderDetails } from './OrderDetails';
import type { OrderInfo } from '@/types/getOrder';

interface GetOrderDemoProps {
  className?: string;
}

export function GetOrderDemo({ className = '' }: GetOrderDemoProps) {
  const [orderId, setOrderId] = useState<string>('');
  const [security, setSecurity] = useState<string>('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [lastOrderInfo, setLastOrderInfo] = useState<OrderInfo | null>(null);

  const handleSearchOrder = () => {
    if (orderId.trim()) {
      setShowOrderDetails(true);
    }
  };

  const handleOrderStatusChange = (orderInfo: OrderInfo) => {
    setLastOrderInfo(orderInfo);
    console.log('📄 Order status changed:', orderInfo.status);
  };

  const handlePaymentClick = (paymentUrl: string) => {
    console.log('💳 Opening payment URL:', paymentUrl);
    // In a real app, this would open the payment page
    window.open(paymentUrl, '_blank');
  };

  const handleCancelOrder = (orderId: string) => {
    console.log('❌ Cancel order:', orderId);
    // In a real app, this would call the cancel order API
  };

  const handleModifyOrder = (orderId: string) => {
    console.log('✏️ Modify order:', orderId);
    // In a real app, this would open the modify order interface
  };

  const resetDemo = () => {
    setShowOrderDetails(false);
    setLastOrderInfo(null);
    setOrderId('');
    setSecurity('');
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Get Order Demo
          </CardTitle>
          <CardDescription>
            Retrieve and display complete order information using the Bussystem get_order API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Search className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <div className="text-sm font-medium">Step 1</div>
              <div className="text-xs text-muted-foreground">Enter Order Details</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FileText className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <div className="text-sm font-medium">Step 2</div>
              <div className="text-xs text-muted-foreground">Fetch Order Info</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto text-purple-600 mb-2" />
              <div className="text-sm font-medium">Step 3</div>
              <div className="text-xs text-muted-foreground">Display Details</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h5 className="font-medium">API Features:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">Real-time</Badge>
                Order status tracking
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">Complete</Badge>
                All order information
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">Cached</Badge>
                Performance optimized
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-fit">Secure</Badge>
                Security code validation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Search */}
      {!showOrderDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Order
            </CardTitle>
            <CardDescription>
              Enter the order ID and security code to retrieve order information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderId">Order ID *</Label>
                <Input
                  id="orderId"
                  type="number"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. 5397146"
                />
              </div>
              <div>
                <Label htmlFor="security">Security Code</Label>
                <Input
                  id="security"
                  value={security}
                  onChange={(e) => setSecurity(e.target.value)}
                  placeholder="e.g. 133918"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Optional for dealers, required for agents/clients
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSearchOrder} 
                disabled={!orderId.trim()}
                className="flex-1"
              >
                <Search className="h-4 w-4 mr-2" />
                Get Order Information
              </Button>
              
              {/* Quick Demo Button */}
              <Button 
                onClick={() => {
                  setOrderId('1026448');
                  setSecurity('487857');
                }} 
                variant="outline"
              >
                Demo Order
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Details Display */}
      {showOrderDetails && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Order Information</h3>
            <div className="flex gap-2">
              <Button onClick={resetDemo} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                New Search
              </Button>
            </div>
          </div>

          <OrderDetails
            orderId={parseInt(orderId)}
            security={security || undefined}
            onStatusChange={handleOrderStatusChange}
            onPaymentClick={handlePaymentClick}
            onCancelOrder={handleCancelOrder}
            onModifyOrder={handleModifyOrder}
          />
        </>
      )}

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Implementation Details</CardTitle>
          <CardDescription>
            How the get_order endpoint works and what information it provides
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-3">Request Parameters:</h5>
              <div className="space-y-2 text-sm">
                <div><code className="bg-gray-100 px-2 py-1 rounded">login</code> - Dealer/agent login</div>
                <div><code className="bg-gray-100 px-2 py-1 rounded">password</code> - Dealer/agent password</div>
                <div><code className="bg-gray-100 px-2 py-1 rounded">order_id</code> - Order ID from new_order/buy_ticket</div>
                <div><code className="bg-gray-100 px-2 py-1 rounded">security</code> - Security code (optional for dealers)</div>
                <div><code className="bg-gray-100 px-2 py-1 rounded">lang</code> - Response language</div>
              </div>
            </div>

            <div>
              <h5 className="font-medium mb-3">Response Information:</h5>
              <div className="space-y-2 text-sm">
                <div>• Order status and payment URL</div>
                <div>• Complete passenger and ticket details</div>
                <div>• Route information and schedules</div>
                <div>• Baggage and pricing breakdown</div>
                <div>• Payment methods and transaction data</div>
                <div>• Promocodes and bonus points</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h5 className="font-medium mb-3">Order Status Flow:</h5>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">reserve</Badge>
              <span>→</span>
              <Badge variant="secondary">reserve_ok</Badge>
              <span>→</span>
              <Badge variant="outline">confirmation</Badge>
              <span>→</span>
              <Badge variant="default">buy</Badge>
              <span className="mx-2">or</span>
              <Badge variant="destructive">cancel</Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h5 className="font-medium mb-3">Usage Scenarios:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Order confirmation pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Payment status checking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Customer service lookups</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Ticket management systems</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Mobile app order details</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Email/SMS notifications</span>
                </div>
              </div>
            </div>
          </div>

          {lastOrderInfo && (
            <>
              <Separator />
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Last fetched order:</strong> #{lastOrderInfo.order_id} 
                  - Status: {lastOrderInfo.status} 
                  - Price: {lastOrderInfo.price} {lastOrderInfo.currency}
                  {lastOrderInfo.url && (
                    <Button 
                      onClick={() => handlePaymentClick(lastOrderInfo.url!)}
                      variant="link" 
                      size="sm" 
                      className="ml-2 p-0 h-auto"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Payment Link
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
