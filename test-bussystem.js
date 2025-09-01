#!/usr/bin/env node

/**
 * Script de test pentru API-ul Bussystem
 * Usage: node test-bussystem.js
 */

// Pentru Node.js (CommonJS)
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const BASE_URL = "https://test-api.bussystem.eu/server";
const LOGIN = process.env.BUSS_LOGIN || "you_login";
const PASSWORD = process.env.BUSS_PASSWORD || "you_password";

async function testGetPoints(autocomplete, lang = "ru") {
  console.log(`\n🧪 Testez get_points.php cu: "${autocomplete}" (lang: ${lang})`);
  
  try {
    const response = await fetch(`${BASE_URL}/curl/get_points.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        login: LOGIN,
        password: PASSWORD,
        autocomplete,
        lang
      })
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);

    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const data = await response.json();
      
      if (data?.error) {
        console.log(`❌ API Error: ${data.error}`);
      } else if (Array.isArray(data)) {
        console.log(`✅ Găsite ${data.length} puncte:`);
        data.slice(0, 5).forEach((point, index) => {
          console.log(`   ${index + 1}. ${point.point_ru_name || point.point_latin_name || point.point_name} (ID: ${point.point_id})`);
        });
        if (data.length > 5) {
          console.log(`   ... și încă ${data.length - 5} puncte`);
        }
      } else {
        console.log(`🤔 Răspuns neașteptat:`, data);
      }
    } else {
      const text = await response.text();
      console.log(`📄 Răspuns text:`, text.slice(0, 400));
      
      if (text.includes("<error>dealer_no_activ</error>")) {
        console.log(`❌ Dealer inactiv - verificați credențialele și IP whitelist`);
      }
    }
    
  } catch (error) {
    console.log(`💥 Eroare de request:`, error.message);
  }
}

async function main() {
  console.log(`🚀 Test Bussystem API`);
  console.log(`🔗 Base URL: ${BASE_URL}`);
  console.log(`👤 Login: ${LOGIN}`);
  console.log(`🔐 Password: ${PASSWORD ? '[SET]' : '[NOT SET]'}`);
  
  if (!LOGIN || LOGIN === "you_login" || !PASSWORD || PASSWORD === "you_password") {
    console.log(`\n⚠️  Setați variabilele de mediu:`);
    console.log(`   export BUSS_LOGIN=your_actual_login`);
    console.log(`   export BUSS_PASSWORD=your_actual_password`);
    console.log(`\n🧪 Rulând cu credențiale de test (se vor întoarce probabil erori)...\n`);
  }

  // Testări multiple
  await testGetPoints("Прага");
  await testGetPoints("București"); 
  await testGetPoints("Chisinau");
  await testGetPoints("Мос", "ru");
  await testGetPoints("Kie", "ua");
  
  console.log(`\n✨ Test complet!`);
}

main().catch(console.error);
