import { useState, useEffect } from "react";
import { Calendar, Filter, MapPin, Clock, Bus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes, infoBusAPI } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useNavigate } from "react-router-dom";

const Timetable = () => {
  const { t, formatPrice } = useLocalization();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [selectedDirection, setSelectedDirection] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Get unique operators and directions
  const operators = ["all", ...Array.from(new Set(routes.map(route => route.operator)))];
  const directions = ["all", ...Array.from(new Set(routes.map(route => `${route.from.name} → ${route.to.name}`)))];

  // Filter routes based on selection
  const filteredRoutes = routes.filter(route => {
    if (selectedOperator !== "all" && route.operator !== selectedOperator) return false;
    if (selectedDirection !== "all" && `${route.from.name} → ${route.to.name}` !== selectedDirection) return false;
    return true;
  });

  // Group routes by time
  const routesByTime = filteredRoutes.reduce((acc, route) => {
    const time = route.departureTime;
    if (!acc[time]) acc[time] = [];
    acc[time].push(route);
    return acc;
  }, {} as Record<string, typeof routes>);

  // Calendar navigation
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayNames = ['days.sunday', 'days.monday', 'days.tuesday', 'days.wednesday', 'days.thursday', 'days.friday', 'days.saturday'];
    const dayName = t(dayNames[dayOfWeek]);
    
    const month = date.getMonth();
    const monthNames = ['months.january', 'months.february', 'months.march', 'months.april', 'months.may', 'months.june', 'months.july', 'months.august', 'months.september', 'months.october', 'months.november', 'months.december'];
    const monthName = t(monthNames[month]);
    
    return `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Get day of week
  const getDayOfWeek = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayNames = ['days.sunday', 'days.monday', 'days.tuesday', 'days.wednesday', 'days.thursday', 'days.friday', 'days.saturday'];
    return t(dayNames[dayOfWeek]);
  };

  // Check if route operates on selected day
  const isRouteOperating = (route: typeof routes[0]) => {
    // Mock logic - in real app this would check actual schedule
    // For now, assume all routes operate daily
    return true;
  };

  // Handle booking a route
  const handleBookRoute = async (route: typeof routes[0]) => {
    try {
      // Find the corresponding route in infoBusAPI
      const allRoutes = await infoBusAPI.getAllRoutes();
      const infoBusRoute = allRoutes.find(r => 
        r.from === route.from.name && 
        r.to === route.to.name
      );
      
      if (!infoBusRoute) {
        console.error('Route not found in infoBusAPI', {
          searchingFor: { from: route.from.name, to: route.to.name },
          availableRoutes: allRoutes.map(r => ({ from: r.from, to: r.to, id: r.id }))
        });
        return;
      }
      
      const routeParams = new URLSearchParams({
        routeId: infoBusRoute.id,
        from: infoBusRoute.from,
        to: infoBusRoute.to,
        date: selectedDate.toISOString().split('T')[0],
        passengers: '1',
        fareType: 'economy',
        price: infoBusRoute.price.economy.toString(),
        departureTime: infoBusRoute.departureTime,
        arrivalTime: infoBusRoute.arrivalTime,
        duration: infoBusRoute.duration,
        operator: infoBusRoute.operator
      });
      navigate(`/trip-details?${routeParams.toString()}`);
    } catch (error) {
      console.error('Error finding route:', error);
    }
  };

  const CalendarView = () => (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">{formatDate(selectedDate)}</h2>
          <p className="text-sm text-muted-foreground">{getDayOfWeek(selectedDate)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          {t('timetable.today')}
        </Button>
      </div>

      {/* Time Slots */}
      <div className="space-y-4">
        {Object.entries(routesByTime)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([time, routesAtTime]) => (
            <Card key={time} className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  {time}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {routesAtTime
                    .filter(route => isRouteOperating(route))
                    .map((route) => (
                      <div key={route.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{route.from.name}</span>
                            </div>
                            <div className="w-8 h-0.5 bg-muted-foreground/30" />
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{route.to.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{t('timetable.duration')}: {route.duration}</span>
                            <span>{t('timetable.stops')}: {route.stops}</span>
                            <span>{t('timetable.operator')}: {route.operator}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {formatPrice(Number(route.price), undefined, 'EUR')}
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleBookRoute(route)}>
                            {t('timetable.book')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  {routesAtTime.filter(route => isRouteOperating(route)).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      {t('timetable.noRoutesOperating')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {filteredRoutes
        .filter(route => isRouteOperating(route))
        .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
        .map((route) => (
          <Card key={route.id} className="border-border hover-lift">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Time */}
                <div className="md:col-span-2">
                  <div className="text-2xl font-bold text-primary">
                    {route.departureTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {route.duration} • {route.stops} {route.stops === 1 ? t('timetable.stop') : t('timetable.stops')}
                  </div>
                </div>

                {/* Route */}
                <div className="md:col-span-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{route.from.name}</span>
                    </div>
                    <div className="w-8 h-0.5 bg-muted-foreground/30" />
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{route.to.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Bus className="h-4 w-4" />
                    <span>{route.operator}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="md:col-span-3">
                  <div className="flex flex-wrap gap-1">
                    {route.amenities.slice(0, 3).map((amenity) => (
                      <Badge key={amenity} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {route.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{route.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price & Action */}
                <div className="md:col-span-3 text-right">
                  <div className="mb-2">
                    <span className="text-xs text-muted-foreground">{t('timetable.from')}</span>
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(Number(route.price), undefined, 'EUR')}
                    </div>
                  </div>
                  <Button size="sm" className="w-full" onClick={() => handleBookRoute(route)}>
                    {t('timetable.bookNow')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('timetable.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('timetable.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Operator Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('timetable.operator')}
                </label>
                <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('timetable.allOperators')} />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((operator) => (
                      <SelectItem key={operator} value={operator}>
                        {operator === "all" ? t('timetable.allOperators') : operator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Direction Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('timetable.direction')}
                </label>
                <Select value={selectedDirection} onValueChange={setSelectedDirection}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('timetable.allDirections')} />
                  </SelectTrigger>
                  <SelectContent>
                    {directions.map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {direction === "all" ? t('timetable.allDirections') : direction}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {t('timetable.viewMode')}
                </label>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "list")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="calendar">{t('timetable.calendar')}</TabsTrigger>
                    <TabsTrigger value="list">{t('timetable.list')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('timetable.routesOperating')
                .replace('{count}', filteredRoutes.filter(route => isRouteOperating(route)).length.toString())
                .replace('{date}', formatDate(selectedDate))}
            </span>
          </div>
        </div>

        {/* Content */}
        {viewMode === "calendar" ? <CalendarView /> : <ListView />}
      </div>
    </div>
  );
};

export default Timetable;

