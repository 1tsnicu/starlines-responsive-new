/**
 * TEST REAL BAGGAGE ROUTES
 * 
 * Fișier pentru testarea funcției get_baggage cu date reale din API-ul Bussystem
 * Conține rute Kiev → Warsaw și Kiev → Prague cu opțiuni de bagaj
 */

// Date reale pentru testarea funcției get_baggage
export const REAL_BAGGAGE_TEST_ROUTES = {
  // Ruta 1: Kiev → Warsaw (Oles Trans Carrier) - bagaje multiple
  kievWarsawOles: {
    interval_id: "local|100502|NTkwMXwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8NTd8fHww|4|1758096000||2025-09-16T10:54:00||2bcaafbf",
    station_from_id: "777",
    station_to_id: "921",
    currency: "EUR",
    lang: "en",
    route_info: {
      from: "Kiev",
      to: "Warszawa", 
      departure: "17:05",
      arrival: "10:00+1",
      duration: "17:55",
      price: "€28.05",
      operator: "Oles Trans Carrier",
      bus_type: "Bus-2 (49 seats)"
    }
  },

  // Ruta 2: Kiev → Warsaw (Default carrier) - bagaj mediu
  kievWarsawKovalchuk: {
    interval_id: "local|100240|MzA4NnwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8NTd8fHww|25|1758096000||2025-09-16T10:54:00||26b37feb",
    station_from_id: "777", 
    station_to_id: "921",
    currency: "EUR",
    lang: "en",
    route_info: {
      from: "Kiev",
      to: "Warszawa",
      departure: "19:00", 
      arrival: "10:00+1",
      duration: "16:00",
      price: "€37.40",
      operator: "Default carrier",
      bus_type: "Neoplan (49 seats)"
    }
  },

  // Ruta 3: Kiev → Prague (Oles Trans Carrier)
  kievPragueOles: {
    interval_id: "local|100502|NTkwMHwyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8M3x8fDA=|4|1758141000||2025-09-16T10:54:41||4b8fcd22",
    station_from_id: "777",
    station_to_id: "3872", 
    currency: "EUR",
    lang: "en",
    route_info: {
      from: "Kiev",
      to: "Praha",
      departure: "17:05",
      arrival: "22:30+1", 
      duration: "30:25",
      price: "€44.42",
      operator: "Oles Trans Carrier",
      bus_type: "Bus-2 (49 seats)"
    }
  },

  // Ruta 4: Kiev → Prague (Default carrier)
  kievPragueKovalchuk: {
    interval_id: "local|100240|MzA4N3wyMDI1LTA5LTE2fHwyMDI1LTA5LTE2fEVVUnx8|--|MHwyMDI1LTA5LTE2fDZ8M3x8fDA=|25|1758141000||2025-09-16T10:54:41||5afd199e",
    station_from_id: "777",
    station_to_id: "123",
    currency: "EUR", 
    lang: "en",
    route_info: {
      from: "Kiev",
      to: "Praha",
      departure: "19:00",
      arrival: "22:30+1",
      duration: "28:30", 
      price: "€37.40",
      operator: "Default carrier",
      bus_type: "Neoplan (49 seats)"
    }
  }
};

// Funcție pentru testarea get_baggage cu date reale
export async function testRealBaggageRoutes() {
  console.log("🧳 Testing real baggage routes...");
  
  const results = [];
  
  for (const [routeName, routeData] of Object.entries(REAL_BAGGAGE_TEST_ROUTES)) {
    try {
      console.log(`\n📍 Testing ${routeName}: ${routeData.route_info.from} → ${routeData.route_info.to}`);
      
      // Simulează apelul către funcția get_baggage
      const response = await fetch('/api/backend/curl/get_baggage.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          interval_id: routeData.interval_id,
          station_from_id: routeData.station_from_id,
          station_to_id: routeData.station_to_id,
          currency: routeData.currency,
          lang: routeData.lang
        })
      });
      
      const baggageData = await response.json();
      
      results.push({
        route: routeName,
        route_info: routeData.route_info,
        baggage_count: baggageData.length,
        baggage_items: baggageData,
        success: true
      });
      
      console.log(`✅ Found ${baggageData.length} baggage options`);
      
      // Afișează detaliile bagajelor
      baggageData.forEach((baggage, index) => {
        console.log(`  ${index + 1}. ${baggage.baggage_title} - ${baggage.price === 0 ? 'FREE' : '€' + baggage.price}`);
        console.log(`     Size: ${baggage.length}x${baggage.width}x${baggage.height} cm, ${baggage.kg} kg`);
        console.log(`     Max per person: ${baggage.max_per_person}, Max in bus: ${baggage.max_in_bus}`);
      });
      
    } catch (error) {
      console.error(`❌ Error testing ${routeName}:`, error);
      results.push({
        route: routeName,
        route_info: routeData.route_info,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
}

// Funcție pentru testarea în consolă (pentru dezvoltare)
export function testRealBaggageInConsole() {
  console.log("🧳 Real Baggage Test Routes Available:");
  console.log("=====================================");
  
  Object.entries(REAL_BAGGAGE_TEST_ROUTES).forEach(([routeName, routeData]) => {
    console.log(`\n📍 ${routeName}:`);
    console.log(`   Route: ${routeData.route_info.from} → ${routeData.route_info.to}`);
    console.log(`   Time: ${routeData.route_info.departure} → ${routeData.route_info.arrival}`);
    console.log(`   Price: ${routeData.route_info.price}`);
    console.log(`   Operator: ${routeData.route_info.operator}`);
    console.log(`   Interval ID: ${routeData.interval_id.substring(0, 50)}...`);
  });
  
  console.log("\n🚀 To test baggage options, run:");
  console.log("   testRealBaggageRoutes()");
}

// Export pentru utilizare în componente React
export const baggageTestUtils = {
  testRealBaggageRoutes,
  testRealBaggageInConsole,
  REAL_BAGGAGE_TEST_ROUTES
};

// Auto-run în consolă pentru dezvoltare
if (typeof window !== 'undefined') {
  window.testRealBaggage = baggageTestUtils;
  console.log("🧳 Real baggage test utilities loaded!");
  console.log("Available functions: testRealBaggage.testRealBaggageRoutes(), testRealBaggage.testRealBaggageInConsole()");
}
