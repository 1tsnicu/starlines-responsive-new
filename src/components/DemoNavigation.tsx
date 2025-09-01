// Responsive Mobile Menu Component for better navigation
// Used for mobile-friendly navigation across demo components

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Smartphone, 
  Search, 
  CheckCircle, 
  Settings,
  ArrowRight,
  Zap
} from 'lucide-react';

interface DemoNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function DemoNavigation({ activeTab, onTabChange, className = '' }: DemoNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      id: 'overview',
      title: 'Overview',
      shortTitle: 'Home',
      description: 'Sistemul complet API Demo',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      id: 'sms',
      title: 'SMS Validation',
      shortTitle: 'SMS',
      description: 'Validare prin SMS cu rate limiting',
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'orders',
      title: 'Get Order',
      shortTitle: 'Orders',
      description: 'Căutare și afișare comenzi',
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'validation',
      title: 'Reserve Validation',
      shortTitle: 'Validate',
      description: 'Pre-validare rezervări',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const handleNavigation = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  const activeItem = navigationItems.find(item => item.id === activeTab);

  return (
    <div className={className}>
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden sm:block">
        <div className="grid w-full grid-cols-4 h-auto bg-white rounded-lg border p-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`flex items-center gap-2 h-12 transition-all ${
                  isActive ? 'shadow-sm' : 'hover:bg-gray-50'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.color}`} />
                <span className="text-sm font-medium">
                  {item.title}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {activeItem && (
                      <>
                        <div className={`p-2 rounded-lg ${activeItem.bgColor}`}>
                          <activeItem.icon className={`h-5 w-5 ${activeItem.color}`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-base">{activeItem.title}</h3>
                          <p className="text-sm text-muted-foreground">{activeItem.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {navigationItems.findIndex(item => item.id === activeTab) + 1}/{navigationItems.length}
                    </Badge>
                    <Menu className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SheetTrigger>
          
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader className="text-left pb-6">
              <SheetTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                API Demo Navigation
              </SheetTitle>
              <SheetDescription>
                Selectează sistemul pe care vrei să îl testezi
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-3">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Card 
                    key={item.id}
                    className={`cursor-pointer transition-all ${
                      isActive 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md hover:bg-gray-50'
                    }`}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          isActive ? 'bg-blue-100' : item.bgColor
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            isActive ? 'text-blue-600' : item.color
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${
                              isActive ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {item.title}
                            </h3>
                            {isActive && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                Activ
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        
                        <ArrowRight className={`h-5 w-5 ${
                          isActive ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="pt-6 border-t mt-6">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Închide
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
