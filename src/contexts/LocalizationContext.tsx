import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'MDL', name: 'Leu Moldovenesc', symbol: 'L', flag: '🇲🇩' },
  { code: 'USD', name: 'Dollar American', symbol: '$', flag: '🇺🇸' },
  { code: 'RON', name: 'Leu Românesc', symbol: 'Lei', flag: '🇷🇴' }
];

// Exchange rates (mock data - in real app this would come from an API)
const EXCHANGE_RATES = {
  EUR: { EUR: 1, MDL: 19.5, USD: 1.08, RON: 4.97 },
  MDL: { EUR: 0.051, MDL: 1, USD: 0.055, RON: 0.255 },
  USD: { EUR: 0.93, MDL: 18.1, USD: 1, RON: 4.6 },
  RON: { EUR: 0.201, MDL: 3.92, USD: 0.217, RON: 1 }
};

interface LocalizationContextType {
  // Language
  currentLanguage: string;
  setLanguage: (code: string) => void;
  getLanguageName: (code: string) => string;
  getLanguageFlag: (code: string) => string;
  
  // Currency
  currentCurrency: string;
  setCurrency: (code: string) => void;
  getCurrencyName: (code: string) => string;
  getCurrencySymbol: (code: string) => string;
  getCurrencyFlag: (code: string) => string;
  
  // Conversion
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number;
  formatPrice: (amount: number, currency?: string, fromCurrency?: string) => string;
  
  // Localization
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Translations
const translations = {
  ro: {
    // Authentication
    'auth.login.title': 'Conectare',
    'auth.login.description': 'Conectează-te la contul tău',
    'auth.login.button': 'Conectare',
    'auth.signUp.title': 'Creare Cont',
    'auth.signUp.description': 'Creează un cont nou',
    'auth.signUp.button': 'Creare Cont',
    'auth.signUp.success.title': 'Cont Creat cu Succes!',
    'auth.signUp.success.description': 'Verifică email-ul pentru confirmarea contului',
    'auth.signUp.success.login': 'Conectare',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'Introdu email-ul tău',
    'auth.password': 'Parolă',
    'auth.passwordPlaceholder': 'Introdu parola ta',
    'auth.confirmPassword': 'Confirmă Parola',
    'auth.confirmPasswordPlaceholder': 'Confirmă parola ta',
    'auth.firstName': 'Prenume',
    'auth.firstNamePlaceholder': 'Introdu prenumele',
    'auth.lastName': 'Nume',
    'auth.lastNamePlaceholder': 'Introdu numele',
    'auth.phone': 'Telefon',
    'auth.phonePlaceholder': 'Introdu numărul de telefon',
    'auth.loggingIn': 'Se conectează...',
    'auth.signingUp': 'Se creează contul...',
    'auth.noAccount': 'Nu ai cont?',
    'auth.haveAccount': 'Ai deja cont?',
    'auth.forgotPassword': 'Ai uitat parola?',
    'auth.logout': 'Deconectare',
    'auth.profile': 'Profil',
    'auth.or': 'Sau',
    'auth.signInWithGoogle': 'Conectare cu Google',
    'auth.signUpWithGoogle': 'Înregistrare cu Google',

    // Header
    'header.home': 'Acasă',
    'header.bookings': 'Rezervări',
    'header.routes': 'Rute & Prețuri',
    'header.timetable': 'Programul',
    'header.myTickets': 'Biletele Mele',
    'header.more': 'Mai Multe',
    'header.legal': 'Informații Legale',
    'header.trust.safe': 'Transport Sigur',
    'header.trust.experience': '10+ ani experiență',
    'header.language': 'Limba',
    'header.currency': 'Moneda',
    
    // Common actions
    'common.viewRoutes': 'Vezi Rutele',
    'common.viewTimetable': 'Vezi Programul',
    'common.viewTickets': 'Vezi Biletele',
    'common.searchRoutes': 'Caută Rute',
    'common.allPrices': 'Toate prețurile',
    'common.book': 'Rezervă',
    'common.search': 'Caută',
    'common.cancel': 'Anulează',
    'common.save': 'Salvează',
    'common.edit': 'Editează',
    'common.delete': 'Șterge',
    'common.add': 'Adaugă',
    'common.back': 'Înapoi',
    'common.next': 'Următorul',
    'common.previous': 'Anterior',
    'common.continue': 'Continuă',
    
    // Hero Section
    'hero.title': 'Călătorește în Siguranță prin Europa',
    'hero.subtitle': 'Transport internațional de încredere cu peste 10 ani de experiență',
    'hero.searchPlaceholder': 'De unde pleci?',
    'hero.searchButton': 'Caută Bilete',
    'hero.popularRoutes': 'Rute Populare',
    'hero.routes': 'Rute',
    'hero.passengers': 'Pasageri',
    'hero.support': 'Suport',
    'hero.secure': 'Securizat',
    
    // Search Form
    'search.from': 'De unde',
    'search.fromPlaceholder': 'Orașul de plecare',
    'search.to': 'Unde',
    'search.toPlaceholder': 'Orașul de destinație',
    'search.departure': 'Data plecării',
    'search.return': 'Data întoarcerii',
    'search.passengers': 'Pasageri',
    'search.passenger': 'Pasager',
    'search.baggage': 'Bagaje',
    'search.bag': 'Bagaj',
    'search.bags': 'Bagaje',
    'search.oneWay': 'Dus',
    'search.roundTrip': 'Dus-întors',
    'search.searchTickets': 'Caută Bilete',
    'search.popularRoutes': 'Rute Populare',
    'search.selectDate': 'Selectează data',
    'search.selectPassengers': 'Selectează numărul de pasageri',
    'search.selectBaggage': 'Selectează bagajele',
    'search.swapCities': 'Schimbă orașele',
    
    // Index Page
    'index.whatToDo': 'Ce vrei să faci?',
    'index.chooseAction': 'Alege acțiunea principală pe care vrei să o faci. Toate sunt simple și clare!',
    'index.bookTicket': 'Rezervă Bilet',
    'index.bookTicketDesc': 'Rezervă-ți locul în autobuz pentru călătoria ta',
    'index.viewRoutes': 'Vezi Rutele',
    'index.viewRoutesDesc': 'Toate rutele disponibile și prețurile',
    'index.timetable': 'Programul',
    'index.timetableDesc': 'Orarul autobuzelor pentru toate rutele',
    'index.viewTimetable': 'Vezi Programul',
    'index.trustSafe': 'Transport Sigur',
    'index.trustSafeDesc': 'Autobuze moderne cu toate standardele de siguranță',
    'index.trustExperience': '10+ Ani Experiență',
    'index.trustExperienceDesc': 'Companie de încredere în transportul internațional',
    'index.trustSupport': 'Suport 24/7',
    'index.trustSupportDesc': 'Suntem aici să te ajutăm oricând ai nevoie',
    'index.trustSimple': 'Rezervări Simple',
    'index.trustSimpleDesc': 'Proces de rezervare simplu și rapid',
    'index.contactUs': 'Contactează-ne',
    'index.contactDesc': 'Sună-ne pentru ajutor personalizat cu rezervarea',
    'index.phone': '+373 60 12 34 56',
    'index.workingHours': 'Luni - Vineri: 9:00 - 18:00',
    'index.viewAllContacts': 'Vezi toate contactele',
    'index.faq': 'Întrebări Frecvente',
    'index.faqDesc': 'Găsește răspunsuri rapide la întrebările tale',
    'index.howToBook': 'Cum fac o rezervare?',
    'index.canCancel': 'Pot anula biletul?',
    'index.whatIfLate': 'Ce să fac dacă am întârziat?',
    'index.viewAllQuestions': 'Vezi toate întrebările',
    'index.readyToStart': 'Gata să începi călătoria?',
    'index.readyDesc': 'Rezervă-ți locul în autobuz în câteva clicuri simple. Procesul este rapid și sigur!',
    'index.readyBookNow': 'Rezervă Acum',
    'index.readyViewRoutes': 'Vezi Rutele',
    'index.viewMyTickets': 'Vezi Biletele Mele',
    
    // Quick Access Section
    'index.quickAccess': 'Acces Rapid',
    'index.everythingYouNeed': 'Tot Ce Ai Nevoie',
    'index.quickAccessDesc': 'Acces rapid la toate instrumentele și informațiile de care ai nevoie pentru o experiență de călătorie perfectă cu Starlines.',
    'index.searchRoutesDesc': 'Găsește și rezervă călătoria perfectă cu autobuzul',
    'index.transportRoutesDesc': 'Vezi toate rutele și destinațiile disponibile',
    'index.myTicketsDesc': 'Accesează și gestionează rezervările tale',
    'index.blogDesc': 'Sfaturi de călătorie, știri și ghiduri de destinații',
    'index.aboutDesc': 'Află despre Starlines și misiunea noastră',
    'index.cantFindWhatYouNeed': 'Nu găsești ce ai nevoie?',
    'index.useSearchOrContact': 'Folosește căutarea noastră sau contactează suportul',
    
    // Search Results
    'search.filters': 'Filtre',
    'search.departureTime': 'Ora de plecare',
    'search.duration': 'Durata (ore)',
    'search.price': 'Prețul (€)',
    'search.amenities': 'Facilități',
    'search.operator': 'Operator',
    'search.stops': 'Opriri',
    'search.allOperators': 'Toți operatorii',
    'search.anyStops': 'Orice număr de opriri',
    'search.directOnly': 'Doar rute directe',
    'search.max1Stop': 'Maxim 1 oprire',
    'search.resetFilters': 'Resetează filtrele',
    'search.recommended': 'Recomandat',
    'search.priceLowToHigh': 'Preț: de la mic la mare',
    'search.priceHighToLow': 'Preț: de la mare la mic',
    'search.rating': 'Rating',
    'search.routesFound': 'rute găsite',
    'search.routeFound': 'rută găsită',
    'search.noRoutesFound': 'Nu s-au găsit rute',
    'search.tryAdjusting': 'Încearcă să ajustezi filtrele sau criteriile de căutare',
    'search.select': 'Selectează',
    
    // Checkout Process
    'checkout.title': 'Checkout',
    'checkout.back': 'Înapoi',
    'checkout.passenger': 'pasager',
    'checkout.passengers': 'pasageri',
    
    // Checkout Steps
    'checkout.step1.title': 'Pasageri',
    'checkout.step1.desc': 'Introdu detaliile pasagerilor.',
    'checkout.step2.title': 'Contact',
    'checkout.step2.desc': 'Informațiile tale de contact.',
    'checkout.step3.title': 'Revizuire',
    'checkout.step3.desc': 'Revizuiește rezervarea.',
    'checkout.step4.title': 'Plată',
    'checkout.step4.desc': 'Finalizează plata.',
    
    // Passenger Details
    'checkout.passengerDetails.title': 'Detaliile Pasagerilor',
    'checkout.passengerDetails.desc': 'Te rugăm să introduci detaliile pentru toți pasagerii',
    'checkout.passengerDetails.passenger': 'Pasager',
    'checkout.passengerDetails.firstName': 'Prenume',
    'checkout.passengerDetails.firstNamePlaceholder': 'Introdu prenumele',
    'checkout.passengerDetails.lastName': 'Nume',
    'checkout.passengerDetails.lastNamePlaceholder': 'Introdu numele',
    'checkout.passengerDetails.dateOfBirth': 'Data nașterii',
    'checkout.passengerDetails.dateOfBirthPlaceholder': 'zz.ll.aaaa',
    'checkout.passengerDetails.nationality': 'Naționalitatea',
    'checkout.passengerDetails.nationalityPlaceholder': 'Selectează naționalitatea',
    'checkout.passengerDetails.documentType': 'Tipul documentului',
    'checkout.passengerDetails.documentType.passport': 'Pașaport',
    'checkout.passengerDetails.documentNumber': 'Numărul documentului',
    'checkout.passengerDetails.documentNumberPlaceholder': 'Introdu numărul documentului',
    
    // Contact Information
    'checkout.contact.title': 'Informațiile de Contact',
    'checkout.contact.desc': 'Vom folosi aceste informații pentru a-ți trimite confirmările și actualizările rezervării',
    'checkout.contact.email': 'Adresa de email',
    'checkout.contact.emailPlaceholder': 'emailul.tau@exemplu.com',
    'checkout.contact.phone': 'Numărul de telefon',
    'checkout.contact.phonePlaceholder': 'Introdu numărul de telefon',
    'checkout.contact.verifyPhone': 'Verifică numărul de telefon',
    
    // Review Booking
    'checkout.review.title': 'Revizuiește Rezervarea',
    'checkout.review.desc': 'Te rugăm să revizuiești toate detaliile înainte de a continua cu plata.',
    'checkout.review.tripSummary.title': 'Rezumatul Călătoriei',
    'checkout.review.tripSummary.route': 'Ruta',
    'checkout.review.tripSummary.date': 'Data',
    'checkout.review.tripSummary.time': 'Ora',
    'checkout.review.tripSummary.duration': 'Durata',
    'checkout.review.tripSummary.fareType': 'Tipul tarifului',
    'checkout.review.tripSummary.passengers': 'Pasageri',
    'checkout.review.priceBreakdown.title': 'Detaliile Prețului',
    'checkout.review.priceBreakdown.farePerPerson': 'Tariful per persoană',
    'checkout.review.priceBreakdown.passengers': 'Pasageri',
    'checkout.review.priceBreakdown.serviceFee': 'Taxa de serviciu',
    'checkout.review.priceBreakdown.total': 'Total',
    'checkout.review.promoCode.title': 'Codul Promoțional',
    'checkout.review.promoCode.placeholder': 'Introdu codul promoțional',
    'checkout.review.promoCode.apply': 'Aplică',
    'checkout.review.promoCode.discount': 'Reducere promoțională',
    'checkout.review.promoCode.success': '✓ Codul promoțional a fost aplicat cu succes!',
    'checkout.review.promoCode.error': '✗ Codul promoțional este invalid',
    
    // Payment
    'checkout.payment.ready.title': 'Gata pentru Plată',
    'checkout.payment.ready.desc': 'Ești aproape gata! Apasă butonul de mai jos pentru a continua cu plata securizată',
    'checkout.payment.secure': 'Plată securizată prin Stripe',
    'checkout.payment.totalAmount': 'Suma totală care va fi taxată',
    'checkout.payment.previous': 'Înapoi',
    'checkout.payment.proceed': 'Continuă cu Plata',
    
    // Validation Messages
    'checkout.validation.firstNameRequired': 'Prenumele este obligatoriu',
    'checkout.validation.lastNameRequired': 'Numele este obligatoriu',
    'checkout.validation.dateOfBirthRequired': 'Data nașterii este obligatorie',
    'checkout.validation.nationalityRequired': 'Naționalitatea este obligatorie',
    'checkout.validation.documentNumberRequired': 'Numărul documentului este obligatoriu',
    'checkout.validation.emailRequired': 'Adresa de email este obligatorie',
    'checkout.validation.phoneRequired': 'Numărul de telefon este obligatoriu',
    'checkout.validation.completeAllFields': 'Te rugăm să completezi toate câmpurile obligatorii înainte de a continua',
    
    // Terms and Conditions
    'checkout.terms.agree': 'Sunt de acord cu termenii și condițiile',
    'checkout.terms.description': 'Bifând această casetă, ești de acord cu',
    'checkout.terms.termsOfService': 'Termenii de Serviciu',
    'checkout.terms.and': 'și',
    'checkout.terms.privacyPolicy': 'Politica de Confidențialitate',
    
    // Months
    'months.january': 'Ianuarie',
    'months.february': 'Februarie',
    'months.march': 'Martie',
    'months.april': 'Aprilie',
    'months.may': 'Mai',
    'months.june': 'Iunie',
    'months.july': 'Iulie',
    'months.august': 'August',
    'months.september': 'Septembrie',
    'months.october': 'Octombrie',
    'months.november': 'Noiembrie',
    'months.december': 'Decembrie',
    
    // Fare Types
    'fareType.economy': 'Economic',
    'fareType.standard': 'Standard',
    'fareType.premium': 'Premium',
    'fareType.business': 'Business',
    
    // Transport Routes
    'transport.title': 'Rute de Transport',
    'transport.description': 'Descoperă și rezervă rute de autobuz prin Europa cu Starlines și partenerii InfoBus',
    'transport.home': 'Acasă',
    'transport.routes': 'Rute de Transport',
    'transport.busRoutes': 'Rute de Autobuz',
    'transport.findJourney': 'Găsește și rezervă călătoria ta perfectă prin Europa',
    'transport.listView': 'Vizualizare Listă',
    'transport.mapView': 'Vizualizare Hartă',
    'transport.searchPlaceholder': 'Caută rute, orașe sau operatori...',
    'transport.fromCity': 'Din Oraș',
    'transport.toCity': 'În Oraș',
    'transport.allCities': 'Toate Orașele',
    'transport.operator': 'Operator',
    'transport.allOperators': 'Toți Operatorii',
    'transport.priceInterval': 'Interval Preț',
    'transport.selectPriceInterval': 'Selectează intervalul de preț',
    'transport.allPrices': 'Toate prețurile',
    'transport.below80': 'Sub €80',
    'transport.80to100': '€80 - €100',
    'transport.100to150': '€100 - €150',
    'transport.above150': 'Peste €150',
    'transport.showingRoutes': 'Se afișează {count} din {total} rute',
    'transport.sortBy': 'Sortează după:',
    'transport.departureTime': 'Ora de Plecare',
    'transport.priceLowToHigh': 'Preț (de la mic la mare)',
    'transport.duration': 'Durata',
    'transport.rating': 'Rating',
    'transport.advancedFilters': 'Filtre Avansate',
    'transport.datePicker': 'Selector Data',
    'transport.reviews': 'recenzii',
    'transport.popular': 'Popular',
    'transport.viewDetails': 'Vezi Detalii',
    'transport.bookNow': 'Rezervă Acum',
    'transport.noRoutesFound': 'Nu s-au găsit rute',
    'transport.tryAdjusting': 'Încearcă să ajustezi criteriile de căutare sau filtrele pentru a găsi rute disponibile.',
    'transport.clearAllFilters': 'Șterge Toate Filtrele',
    'transport.interactiveMapView': 'Vizualizare Hartă Interactivă',
    'transport.mapViewDescription': 'Vizualizarea pe hartă va fi implementată aici, arătând vizualizarea rutelor prin Europa.',
    'transport.switchToListView': 'Comută la Vizualizarea Listă',
    'transport.cantFindRoute': 'Nu găsești ruta pe care o cauți?',
    'transport.contactService': 'Contactează echipa noastră de servicii pentru clienți pentru a solicita rute personalizate sau pentru asistență cu planurile tale de călătorie.',
    'transport.requestCustomRoute': 'Solicită Rută Personalizată',
    'transport.contactSupport': 'Contactează Suportul',
    

    
    // Trip Details Page
    'tripDetails.loading': 'Se încarcă detaliile rutei...',
    'tripDetails.error.routeNotFound': 'Ruta nu a fost găsită',
    'tripDetails.error.failedToLoad': 'Nu s-au putut încărca detaliile rutei',
    'tripDetails.error.noRouteId': 'Nu a fost furnizat ID-ul rutei',
    'tripDetails.backToRoutes': 'Înapoi la Rute',
    'tripDetails.backToSearch': 'Înapoi la Căutare',
    'tripDetails.bookNow': 'Rezervă Acum',
    'tripDetails.continueToCheckout': 'Continuă la Checkout',
    'tripDetails.selectYourFare': 'Selectează Tariful Tău',
    'tripDetails.numberOfPassengers': 'Numărul de pasageri',
    'tripDetails.farePerPerson': 'Tarif per persoană',
    'tripDetails.serviceFee': 'Taxă serviciu',
    'tripDetails.total': 'Total',
    'tripDetails.journeyTimeline': 'Cronologia Călătoriei',
    'tripDetails.interactiveMapComingSoon': 'Hartă interactivă în curând',
    'tripDetails.fareRulesPolicies': 'Reguli și Politici Tarifare',
    'tripDetails.baggageAllowance': 'Bagaje Permise',
    'tripDetails.changesCancellations': 'Modificări și Anulări',
    'tripDetails.refundPolicy': 'Politica de Rambursare',
    'tripDetails.handLuggage': 'Bagaj de mână',
    'tripDetails.checkedBaggage': 'Bagaj înregistrat',
    'tripDetails.oversizedItems': 'Articole supradimensionate',
    'tripDetails.extra': 'extra',
    'tripDetails.freeChanges': 'Modificări gratuite',
    'tripDetails.upTo2HoursBefore': 'Până la 2 ore înainte de plecare',
    'tripDetails.cancellationFee': 'Taxă de anulare',
    'tripDetails.before24h': '24h înainte',
    'tripDetails.sameDay': 'în aceeași zi',
    'tripDetails.noShow': 'Nu s-a prezentat',
    'tripDetails.ofFare': 'din tarif',
    'tripDetails.departure': 'Plecare',
    'tripDetails.arrival': 'Sosire',
    'tripDetails.dailyService': 'Serviciu zilnic',
    'tripDetails.reviews': 'recenzii',
    'tripDetails.standardSeat': 'Loc standard',
    'tripDetails.basicAmenities': 'Facilități de bază',
    'tripDetails.premiumSeat': 'Loc premium',
    'tripDetails.extraLegroom': 'Spațiu extra pentru picioare',
    'tripDetails.priorityBoarding': 'Îmbarcare prioritară',
    'tripDetails.refreshments': 'Răcoritoare',
    'tripDetails.businessSeat': 'Loc business',
    'tripDetails.maximumComfort': 'Confort maxim',
    'tripDetails.premiumAmenities': 'Facilități premium',
    'tripDetails.flexibleChanges': 'Modificări flexibile',
    'tripDetails.flexible': 'Flexibil',
    'tripDetails.changeable': 'Modificabil',
    'tripDetails.securePayment': 'Plată Securizată',
    'tripDetails.multiplePaymentMethods': 'Metode multiple de plată acceptate',
    'transport.to': 'Către',
    
    // Timetable Page
    'timetable.title': 'Orarul Autobuzelor',
    'timetable.description': 'Vizualizează programele complete pentru toate rutele Starlines. Filtrează după dată, operator sau direcție pentru a-ți găsi călătoria perfectă.',
    'timetable.operator': 'Operator',
    'timetable.direction': 'Direcție',
    'timetable.viewMode': 'Modul de Vizualizare',
    'timetable.calendar': 'Calendar',
    'timetable.list': 'Listă',
    'timetable.allOperators': 'Toți operatorii',
    'timetable.allDirections': 'Toate direcțiile',
    'timetable.today': 'Astăzi',
    'timetable.duration': 'Durata',
    'timetable.stops': 'Opriri',
    'timetable.stop': 'oprire',
    'timetable.book': 'Rezervă',
    'timetable.bookNow': 'Rezervă Acum',
    'timetable.from': 'De la',
    'timetable.noRoutesOperating': 'Nu sunt rute în funcțiune la această oră',
    'timetable.routesOperating': '{count} rute în funcțiune pe {date}',
    'timetable.scheduleTitle': 'ORARUL',
    'timetable.busSchedule': 'autobuzelor pe ruta',
    'timetable.routeTitle': 'Chișinău (Republica Moldova) – Kiev (Ucraina)',
    'timetable.arrivalTime': 'ora sosirii',
    'timetable.stopDuration': 'durata opririi',
    'timetable.departureTime': 'ora plecării',
    'timetable.distanceFromStart': 'Distanța km. de la stația inițială',
    'timetable.stopNames': 'NUMELE STAȚIILOR',
    'timetable.distanceBetweenStops': 'Distanța km. între stații',
    'timetable.directDirection': 'în direcția directă',
    'timetable.reverseDirection': 'în direcția inversă',
    'timetable.directRoute': 'Chișinău → Kiev',
    'timetable.reverseRoute': 'Kiev → Chișinău',
    'timetable.arrivalTimeDesc': 'ora sosirii pe stație',
    'timetable.stopDurationDesc': 'durata opririi',
    'timetable.departureTimeDesc': 'ora plecării de la stație',
    'timetable.distanceFromStartDesc': 'distanța de la stația inițială',
    'timetable.distanceBetweenDesc': 'distanța de la stația anterioară',
    'timetable.importantInfo': 'Informații importante',
    'timetable.borderCrossing': 'Punct de trecere a frontierei',
    'timetable.busStation': 'Autogară',
    'timetable.busPark': 'Autoparc',
    'timetable.minutes': 'min',
    'timetable.kilometers': 'km',
    
    // Station names
    'stations.kyivVydubychi': 'Kiev AS «Vydubychi»',
    'stations.kyivCentral': 'Kiev AS «Kiev»',
    'stations.zhytomyr': 'Jîtomîr',
    'stations.berdychiv': 'Berdîciv AS',
    'stations.vinnytsia': 'Vinnița',
    'stations.mohylivPodilskyi': 'Mohîliv-Podilskîi AS',
    'stations.mohylivBorderUkraine': 'APP «Mohîliv-Podilskîi»',
    'stations.atakiBorderMoldova': 'APP «Atacî»',
    'stations.edinet': 'Edineț AS',
    'stations.balti': 'Bălți AS',
    'stations.orhei': 'Orhei AS',
    'stations.chisinauBusPark': 'Chișinău AP',
    'stations.chisinauCentral': 'Chișinău AS',
    
    // Station addresses
    'addresses.kyivVydubychi': 'drumul Naherejno-Pecerska, 10A',
    'addresses.kyivCentral': 'str. S. Petluri, 32',
    'addresses.zhytomyr': 'str. Kievskîi 93',
    'addresses.berdychiv': 'piața Privokzalna 1-A',
    'addresses.vinnytsia': 'str. Kievskîi, 8',
    'addresses.mohylivPodilskyi': 'str. Pușkinska 41',
    'addresses.edinet': 'str. Independenței, 227',
    'addresses.balti': 'str. Ștefan cel Mare, 2',
    'addresses.orhei': 'str. Sadoveanu, 50',
    'addresses.chisinauBusPark': 'Bulevardul Dacia 80/3',
    'addresses.chisinauCentral': 'str. Calea Moșilor, 2/1',
    
    // Days of the week
    'days.sunday': 'Duminică',
    'days.monday': 'Luni',
    'days.tuesday': 'Marți',
    'days.wednesday': 'Miercuri',
    'days.thursday': 'Joi',
    'days.friday': 'Vineri',
    'days.saturday': 'Sâmbătă',
    
    // Features
    'features.title': 'De Ce Să Alegi Starlines?',
    'features.subtitle': 'Experiența noastră de peste 10 ani în transport internațional',
    'features.safeTransport': 'Transport Sigur',
    'features.safeDesc': 'Flota modernă cu șoferi profesioniști',
    'features.experience': 'Experiență Vastă',
    'features.experienceDesc': '10+ ani în transportul internațional',
    'features.support': 'Suport 24/7',
    'features.supportDesc': 'Echipa noastră este mereu disponibilă',
    'features.easyBooking': 'Rezervare Simplă',
    'features.easyDesc': 'Proces simplu de rezervare online',
    'features.securePayments': 'Plăți Securizate',
    'features.securePaymentsDesc': 'Tranzacții criptate SSL cu multiple opțiuni de plată',
    'features.flexibleReturns': 'Returnări Flexibile',
    'features.flexibleReturnsDesc': 'Politici ușoare de anulare și rambursare',
    'features.destinations': 'Destinații Multiple',
    'features.destinationsDesc': 'Acoperire completă în Europa de Est',
    'features.modernAmenities': 'Facilități Moderne',
    'features.modernAmenitiesDesc': 'WiFi, porturi USB și locuri confortabile',
    'features.paymentOptions': 'Opțiuni Multiple de Plată',
    'features.paymentOptionsDesc': 'Carduri de credit, portofele digitale și transferuri bancare',
    'features.mobileApp': 'Aplicație Mobilă',
    'features.mobileAppDesc': 'Rezervă și gestionează călătoriile de pe telefon',
    'features.multilingual': 'Suport Multilingv',
    'features.multilingualDesc': 'Asistență în română, rusă și engleză',
    
    // Popular Routes
    'routes.title': 'Destinații Populare',
    'routes.subtitle': 'Descoperă rutele noastre cele mai iubite',
    'routes.viewAll': 'Vezi Toate Rutele',
    'routes.perPerson': 'per persoană',
    'routes.viewDetails': 'Vezi Detalii',
    'routes.readyToExplore': 'Gata să Explorezi?',
    'routes.findPerfectRoute': 'Găsește ruta perfectă astăzi',
    'routes.browseAll': 'Explorează Toate Rutele',
    
    // Booking
    'booking.passengers': 'Pasageri',
    'booking.departure': 'Plecare',
    'booking.arrival': 'Sosire',
    'booking.duration': 'Durată',
    'booking.operator': 'Operator',
    'booking.price': 'Preț',
    'booking.total': 'Total',
    'booking.serviceFee': 'Taxă serviciu',
    
    // About
    'about.title': 'Despre Noi',
    'about.subtitle': 'Povestea noastră de succes în transportul internațional',
    'about.mission': 'Misiunea Noastră',
    'about.vision': 'Viziunea Noastră',
    'about.values': 'Valorile Noastre',
    
    // About Page Content
    'about.ourStory': 'Povestea Noastră',
    'about.connectingDreams': 'Conectând Vise,',
    'about.oneJourneyAtTime': 'O Călătorie la un Moment',
    'about.heroDescription': 'De peste 15 ani, Starlines a fost mai mult decât o companie de autobuze. Suntem podul între oameni și posibilități, conectând comunitățile din Europa de Est cu fiabilitate, confort și grijă.',
    'about.missionStatement': '"Să democratizăm transportul de calitate prin oferirea de călătorii sigure, confortabile și fiabile cu autobuzul pentru toată lumea din Europa de Est, construind în același timp punți între comunități și promovând creșterea durabilă."',
    
    // Stats Section
    'about.yearsOfService': 'Ani de Serviciu',
    'about.buildingTrust': 'Construind încredere din 2009',
    'about.routesCovered': 'Rute Acoperite',
    'about.acrossCountries': 'În 12 țări',
    'about.happyCustomers': 'Clienți Fericiți',
    'about.satisfiedTravelers': 'Călători mulțumiți',
    'about.safetyRecord': 'Record de Siguranță',
    'about.perfectSafetyScore': 'Scor perfect de siguranță',
    
    // Values Section
    'about.whatDrivesUs': 'Ce Ne Motivează',
    'about.valuesDescription': 'Valorile noastre nu sunt doar cuvinte pe un perete—sunt principiile care ne ghidează fiecare decizie pe care o luăm și fiecare acțiune pe care o facem.',
    'about.safetyAboveAll': 'Siguranța Deasupra Tuturor',
    'about.safetyDescription': 'Credem că siguranța nu este doar o prioritate—este fundația noastră. Fiecare călătorie începe cu protocoale de siguranță riguroase, întreținerea vehiculelor de ultimă generație și șoferi foarte bine pregătiți care prioritizează bunăstarea ta deasupra oricărei alte considerente.',
    'about.passengerCentric': 'Centrat pe Pasager',
    'about.passengerDescription': 'Fiecare decizie pe care o luăm este ghidată de o întrebare: „Cum îmbunătățește aceasta experiența pasagerilor noștri?" De la scaunele confortabile la rezervarea fără probleme, te punem în centrul a tot ceea ce facem.',
    'about.reliabilityPromise': 'Promisiunea Fiabilității',
    'about.reliabilityDescription': 'Când alegi Starlines, alegi fiabilitatea. Performanța noastră de 99,9% la timp nu este doar o statistică—este angajamentul nostru de a te duce unde trebuie să fii, când trebuie să fii acolo.',
    'about.innovationDriven': 'Condus de Inovație',
    'about.innovationDescription': 'Nu doar ținem pasul cu tehnologia—suntem în fruntea progresului. De la optimizarea rutelor cu ajutorul AI la vehiculele ecologice, împingem constant limitele pentru a crea viitorul transportului.',
    'about.sustainabilityFirst': 'Sustenabilitatea Întâi',
    'about.sustainabilityDescription': 'Angajamentul nostru față de mediu depășește conformitatea. Reducem activ amprenta noastră de carbon prin autobuze electrice, energie regenerabilă și practici durabile care protejează planeta noastră pentru generațiile viitoare.',
    'about.communityImpact': 'Impactul asupra Comunității',
    'about.communityDescription': 'Suntem mai mult decât o companie de transport—suntem o punte între comunități. Prin conectarea oamenilor și locurilor, ajutăm la construirea unor societăți mai puternice și mai conectate în toată Europa de Est.',
    
    // Team Section
    'about.mindsBehindheMagic': 'Mințile din Spatele Magiei',
    'about.teamDescription': 'Cunoaște liderii pasionați care transformă viziunea noastră în realitate, conducând inovația și excelența în tot ceea ce facem.',
    'about.ceoFounder': 'CEO și Fondator',
    'about.mihaiBio': 'Un antreprenor vizionar cu peste 25 de ani în transport, Mihai a început Starlines cu un vis simplu: să facă călătoria de calitate cu autobuzul accesibilă pentru toată lumea din Europa de Est. Pasiunea sa pentru inovație și servicii pentru clienți conduce compania noastră înainte.',
    'about.coo': 'Director de Operațiuni',
    'about.elenaBio': 'Elena aduce precizia militară în operațiunile noastre. Cu o experiență în logistică și o pasiune pentru eficiență, ea se asigură că fiecare călătorie Starlines funcționează ca un ceasornic, menținând reputația noastră de fiabilitate.',
    'about.cco': 'Director Servicii Clienți',
    'about.alexandruBio': 'Alexandru crede că serviciul excepțional pentru clienți este o formă de artă. El a construit echipa noastră de experiență pentru clienți de la zero, creând o cultură în care fiecare pasager se simte apreciat și auzit.',
    'about.cto': 'Director de Tehnologie',
    'about.mariaBio': 'Maria este arhitectul nostru digital, transformând modul în care oamenii interacționează cu transportul. De la aplicația noastră premiată la optimizarea rutelor cu AI, ea face călătoria mai inteligentă, mai rapidă și mai plăcută.',
    
    // Expertise labels
    'about.strategicVision': 'Viziune Strategică',
    'about.industryLeadership': 'Lidership în Industrie',
    'about.customerExperience': 'Experiența Clientului',
    'about.operationsExcellence': 'Excelența Operațiunilor',
    'about.logistics': 'Logistică',
    'about.qualityControl': 'Control de Calitate',
    'about.teamBuilding': 'Construirea Echipei',
    'about.serviceInnovation': 'Inovația Serviciilor',
    'about.digitalTransformation': 'Transformare Digitală',
    'about.aiMachineLearning': 'AI și Machine Learning',
    'about.productDevelopment': 'Dezvoltarea Produselor',
    
    // Timeline Section
    'about.journeyThroughTime': 'Călătoria Noastră prin Timp',
    'about.timelineDescription': 'Fiecare etapă importantă spune o poveste de creștere, inovație și angajament neclintit față de pasagerii și comunitățile noastre.',
    'about.dreamBegins': 'Visul Începe',
    'about.dreamDescription': 'Starlines s-a născut dintr-o observație simplă: călătoria de calitate cu autobuzul în Europa de Est era fie prea scumpă, fie prea nesigură. Am început cu 3 autobuze și un vis mare.',
    'about.dreamImpact': '3 rute, 3 autobuze, ambiție nelimitată',
    'about.breakingBorders': 'Spargerea Granițelor',
    'about.bordersDescription': 'Prima noastră expansiune internațională a dovedit că calitatea nu cunoaște granițe. Am conectat Moldova cu România și Ucraina, demonstrând că serviciul excelent transcende frontierele.',
    'about.bordersImpact': 'Peste 50 de rute în 3 țări',
    'about.digitalRevolution': 'Revoluția Digitală',
    'about.digitalDescription': 'Am lansat prima noastră platformă online, făcând rezervarea la fel de ușoară ca câteva clicuri. Aceasta nu a fost doar o îmbunătățire—a fost o reimaginare completă a modului în care oamenii rezervă călătoriile.',
    'about.digitalImpact': 'Prima platformă de rezervare online din regiune',
    'about.europeanExpansion': 'Expansiunea Europeană',
    'about.expansionDescription': 'Rețeaua noastră a crescut pentru a acoperi inima Europei de Est. De la Baltica la Marea Neagră, Starlines a devenit sinonim cu călătoriile transfrontaliere fiabile.',
    'about.expansionImpact': 'Peste 200 de rute în 8 țări',
    'about.greenRevolution': 'Revoluția Verde',
    'about.greenDescription': 'Am introdus primele noastre autobuze electrice și am lansat programe de compensare a carbonului. Sustenabilitatea nu este doar o afacere bună—este responsabilitatea noastră față de generațiile viitoare.',
    'about.greenImpact': 'Prima flotă de autobuze electrice din regiune',
    'about.industryLeadershipTitle': 'Lidership în Industrie',
    'about.leadershipDescription': 'Astăzi, Starlines se află ca cel mai de încredere nume în transportul cu autobuze din Europa de Est. Dar nu ne odihnim pe laurii noștri—construim rețeaua de transport de mâine.',
    'about.leadershipImpact': 'Peste 300 de rute, peste 2 milioane de clienți mulțumiți',
    
    // Fun Facts Section
    'about.didYouKnow': 'Știai Că?',
    'about.factsDescription': 'Câteva fapte fascinante despre Starlines care ne fac unici',
    'about.earthTrips': 'Autobuzele noastre parcurg echivalentul a 15 călătorii în jurul Pământului în fiecare zi',
    'about.coffeeServed': 'Am servit cafea la peste 500.000 de pasageri în sălile noastre premium',
    'about.languagesSpoken': 'Șoferii noștri vorbesc colectiv 8 limbi diferite',
    'about.familiesReunited': 'Am ajutat la reunirea a peste 2.000 de familii prin opțiunile noastre de călătorie accesibile',
    
    // CTA Section
    'about.readyToBePartOfStory': 'Gata să Fii Parte din Povestea Noastră?',
    'about.ctaDescription': 'Alătură-te milioanelor de călători mulțumiți care au descoperit că cu Starlines, fiecare călătorie este o aventură care așteaptă să se întâmple.',
    'about.startYourJourney': 'Începe-ți Călătoria',
    'about.learnMore': 'Află Mai Multe',
    
    // Contact
    'contact.title': 'Contactează-ne',
    'contact.subtitle': 'Suntem aici să te ajutăm',
    'contact.phone': 'Telefon',
    'contact.email': 'Email',
    'contact.address': 'Adresă',
    'contact.hours': 'Program',
    
    // Footer
    'footer.transport': 'Transport',
    'footer.info': 'Informații',
    'footer.support': 'Suport',
    'footer.company': 'Companie',
    'footer.legal': 'Legal',
    'footer.rights': 'Toate drepturile rezervate',
    
    // Legal Pages
    'legal.terms': 'Termeni & Condiții',
    'legal.termsDesc': 'Termenii de utilizare',
    'legal.privacy': 'Politica de Confidențialitate',
    'legal.privacyDesc': 'Protecția datelor personale',
    'legal.refund': 'Politica de Rambursare',
    'legal.refundDesc': 'Condițiile de rambursare',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Articole și ghiduri de călătorie',
    
    // Blog Page Content
    'blog.travelBlog': 'Blog de Călătorie',
    'blog.discoverTravelTips': 'Descoperă sfaturi de călătorie, ghiduri de destinații și insights pentru a-ți face călătoriile de neuitat.',
    'blog.searchArticles': 'Caută articole...',
    'blog.allCategories': 'Toate categoriile',
    'blog.filterByTags': 'Filtrează după Etichete',
    'blog.clearFilters': 'Șterge Filtrele',
    'blog.articlesFound': 'articole găsite',
    'blog.articleFound': 'articol găsit',
    'blog.noArticlesFound': 'Nu s-au găsit articole',
    'blog.tryAdjusting': 'Încearcă să ajustezi criteriile de căutare sau filtrele',
    'blog.clearAllFilters': 'Șterge Toate Filtrele',
    'blog.readMore': 'Citește Mai Multe',
    'blog.blogImage': 'Imagine Blog',
    'blog.featured': 'Recomandat',
    
    // Blog Categories
    'blog.category.all': 'Toate',
    'blog.category.travelGuides': 'Ghiduri de Călătorie',
    'blog.category.travelTips': 'Sfaturi de Călătorie',
    'blog.category.budgetTravel': 'Călătorie Buget',
    'blog.category.travelPlanning': 'Planificarea Călătoriei',
    
    // Blog Tags
    'blog.tag.easternEurope': 'Europa de Est',
    'blog.tag.culture': 'Cultură',
    'blog.tag.history': 'Istorie',
    'blog.tag.travelTips': 'Sfaturi de Călătorie',
    'blog.tag.comfort': 'Confort',
    'blog.tag.longDistance': 'Distanță Lungă',
    'blog.tag.romania': 'România',
    'blog.tag.busNetwork': 'Rețeaua de Autobuze',
    'blog.tag.featured': 'Recomandat',
    
    // Blog Articles
    'blog.article.top10Destinations.title': 'Top 10 Destinații de Vizitat în Europa de Est',
    'blog.article.top10Destinations.excerpt': 'Descoperă bijuteriile ascunse și comorile culturale ale Europei de Est. De la orașe istorice la peisaje de respingătoare, aceste destinații te vor lăsa fără cuvinte.',
    'blog.article.top10Destinations.author': 'Maria Popescu',
    'blog.article.top10Destinations.readTime': '8 min citire',
    
    'blog.article.comfortableTravel.title': 'Cum să Călătorești Confortabil pe Călătorii Lungi cu Autobuzul',
    'blog.article.comfortableTravel.excerpt': 'Sfaturi și trucuri esențiale pentru a-ți face călătoria cu autobuzul pe distanțe lungi confortabilă și plăcută. Află despre scaune, divertisment și esențialele de confort.',
    'blog.article.comfortableTravel.author': 'Alexandru Ionescu',
    'blog.article.comfortableTravel.readTime': '6 min citire',
    
    'blog.article.romaniaGuide.title': 'Ghidul Ultim pentru Călătoria cu Autobuzul în România',
    'blog.article.romaniaGuide.excerpt': 'Tot ce trebuie să știi despre călătoria cu autobuzul în România. De la rezervarea biletelor la înțelegerea rețelei și găsirea celor mai bune oferte.',
    'blog.article.romaniaGuide.author': 'Elena Dumitrescu',
    'blog.article.romaniaGuide.readTime': '10 min citire',
    
    'blog.article.bestTimeToVisit.title': 'Cea Mai Bună Perioadă pentru a Vizita Europa de Est',
    'blog.article.bestTimeToVisit.excerpt': 'Descoperă când este cel mai bine să vizitezi Europa de Est. De la sezoanele turistice la evenimente culturale, ghidul nostru te va ajuta să planifici călătoria perfectă.',
    'blog.article.bestTimeToVisit.author': 'Mihai Popescu',
    'blog.article.bestTimeToVisit.readTime': '7 min citire',
    
    'blog.article.budgetTravel.title': 'Cum să Călătorești în Europa de Est cu un Buget Mic',
    'blog.article.budgetTravel.excerpt': 'Sfaturi practice pentru a-ți face călătoria în Europa de Est accesibilă din punct de vedere financiar. De la cazare la transport și mâncare, economisește bani fără să sacrifici experiența.',
    'blog.article.budgetTravel.author': 'Ana Vasilescu',
    'blog.article.budgetTravel.readTime': '9 min citire',
    
    'blog.article.localCuisine.title': 'Ghidul Gastronomic al Europei de Est',
    'blog.article.localCuisine.excerpt': 'Explorează aromele autentice ale Europei de Est. De la sarmale românești la pierogi polonezi, descoperă tradițiile culinare care definesc această regiune fascinantă.',
    'blog.article.localCuisine.author': 'Diana Munteanu',
    'blog.article.localCuisine.readTime': '11 min citire',
    
    'blog.article.safetyTips.title': 'Sfaturi de Siguranță pentru Călătoria cu Autobuzul',
    'blog.article.safetyTips.excerpt': 'Asigură-ți siguranța în timpul călătoriei cu autobuzul. De la păstrarea bagajelor la interacțiunea cu străinii, aceste sfaturi te vor ajuta să rămâi în siguranță.',
    'blog.article.safetyTips.author': 'Cristian Dumitru',
    'blog.article.safetyTips.readTime': '5 min citire',
    
    'blog.article.winterTravel.title': 'Călătoria în Europa de Est în Sezonul Rece',
    'blog.article.winterTravel.excerpt': 'Descoperă frumusețea Europei de Est în timpul iernii. De la orașe înghețate la stațiuni de schi, ghidul nostru te va ajuta să te bucuri de magia sezonului rece.',
    'blog.article.winterTravel.author': 'Laura Ionescu',
    'blog.article.winterTravel.readTime': '8 min citire',
    
    'blog.article.culturalEtiquette.title': 'Eticheta Culturală în Europa de Est',
    'blog.article.culturalEtiquette.excerpt': 'Învață să navighezi prin nuanțele culturale ale Europei de Est. De la saluturi la obiceiuri la masă, aceste sfaturi te vor ajuta să te integrezi cu localnicii.',
    'blog.article.culturalEtiquette.author': 'Vlad Popa',
    'blog.article.culturalEtiquette.readTime': '6 min citire',
    
    // Blog Modal
    'blog.articleBy': 'Articol de',
    'blog.close': 'Închide',
    
    // FAQ
    'faq.title': 'Întrebări Frecvente',
    'faq.subtitle': 'Găsește răspunsuri la cele mai comune întrebări despre rezervări, călătorii și utilizarea serviciilor noastre. Nu găsești ce cauți? Contactează echipa noastră de suport.',
    'faq.searchPlaceholder': 'Caută întrebări și răspunsuri...',
    'faq.allCategories': 'Toate Categoriile',
    'faq.clearFilters': 'Șterge Filtrele',
    'faq.questionsFound': 'întrebări găsite',
    'faq.questionFound': 'întrebare găsită',
    'faq.noQuestionsFound': 'Nu s-au găsit întrebări',
    'faq.tryAdjusting': 'Încearcă să ajustezi criteriile de căutare sau să navighezi prin toate categoriile',
    'faq.clearAllFilters': 'Șterge Toate Filtrele',
    'faq.stillHaveQuestions': 'Mai ai întrebări?',
    'faq.supportDescription': 'Echipa noastră de suport pentru clienți este aici să te ajute 24/7',
    'faq.contactSupport': 'Contactează Suportul',
    'faq.liveChat': 'Chat Live',
    
    // FAQ Categories
    'faq.category.bookingTickets': 'Rezervări și Bilete',
    'faq.category.travelRoutes': 'Călătorii și Rute',
    'faq.category.schedulesTimetables': 'Programe și Orare',
    'faq.category.safetySecurity': 'Siguranță și Securitate',
    'faq.category.customerService': 'Servicii Clienți',
    'faq.category.pricingDiscounts': 'Prețuri și Reduceri',
    
    // FAQ Questions and Answers
    'faq.booking.howToBook.question': 'Cum pot să rezerv un bilet de autobuz?',
    'faq.booking.howToBook.answer': 'Poți rezerva bilete prin site-ul nostru web, aplicația mobilă sau sunând la serviciul nostru de clienți. Pur și simplu introdu orașele de plecare și destinație, selectează data de călătorie, alege ruta preferată și completează procesul de plată.',
    'faq.booking.changeCancel.question': 'Pot să modific sau să anulez biletul meu?',
    'faq.booking.changeCancel.answer': 'Da, poți modifica sau anula biletul până la 2 ore înainte de plecare. Modificările sunt supuse disponibilității și pot implica taxe suplimentare. Anulările făcute cu mai mult de 24 de ore înainte de plecare sunt de obicei rambursabile.',
    'faq.booking.paymentMethods.question': 'Ce metode de plată acceptați?',
    'faq.booking.paymentMethods.answer': 'Acceptăm toate cardurile de credit majore (Visa, MasterCard, American Express), cardurile de debit și portofelele digitale precum PayPal. De asemenea, acceptăm transferuri bancare pentru rezervările anticipate.',
    'faq.booking.printTicket.question': 'Trebuie să printez biletul meu?',
    'faq.booking.printTicket.answer': 'Nu, nu trebuie să printezi biletul. Poți arăta biletul digital pe dispozitivul tău mobil, sau îți putem trimite un SMS cu referința rezervării. Cu toate acestea, imprimarea este recomandată ca backup.',
    
    'faq.travel.arriveEarly.question': 'Cât de devreme ar trebui să ajung la stația de autobuz?',
    'faq.travel.arriveEarly.answer': 'Recomandăm să ajungi cu cel puțin 30 de minute înainte de plecare pentru rutele domestice și 45 de minute pentru rutele internaționale. Acest lucru permite timp pentru check-in, manipularea bagajelor și procedurile de îmbarcare.',
    'faq.travel.missBus.question': 'Ce se întâmplă dacă ratez autobuzul?',
    'faq.travel.missBus.answer': 'Dacă ratezi autobuzul, contactează serviciul nostru de clienți imediat. În funcție de disponibilitate și tipul biletului tău, s-ar putea să te putem reprograma pe următoarea plecare disponibilă, deși se pot aplica taxe suplimentare.',
    'faq.travel.luggageRestrictions.question': 'Există restricții pentru bagaje?',
    'faq.travel.luggageRestrictions.answer': 'Fiecare pasager are dreptul la un bagaj de mână (max 10kg) și un bagaj înregistrat (max 20kg). Bagajele suplimentare pot fi transportate pentru o taxă suplimentară. Articolele de dimensiuni mari ar trebui aranjate în avans.',
    'faq.travel.pets.question': 'Pot să aduc animale de companie la bord?',
    'faq.travel.pets.answer': 'Animalele mici în transportoare sunt permise pe majoritatea rutelor, dar trebuie rezervate în avans. Animalele de serviciu călătoresc gratuit. Te rog să verifici politicile specifice ale rutelor, deoarece unele rute internaționale pot avea restricții.',
    
    'faq.schedules.frequency.question': 'Cât de des circulă autobuzele?',
    'faq.schedules.frequency.answer': 'Frecvența variază în funcție de rută. Rutele populare precum Chișinău-București pot avea multiple plecări zilnice, în timp ce rutele mai puțin frecvente pot circula o dată sau de două ori zilnic. Verifică orarul nostru pentru programele specifice.',
    'faq.schedules.weekendsHolidays.question': 'Programele sunt diferite în weekend și sărbători?',
    'faq.schedules.weekendsHolidays.answer': 'Da, unele rute au o frecvență redusă în weekend și sărbători. Recomandăm să verifici programul nostru de sărbători sau să contactezi serviciul de clienți pentru cea mai actualizată informație.',
    'faq.schedules.journeyTime.question': 'Cât durează de obicei călătoriile?',
    'faq.schedules.journeyTime.answer': 'Timpul de călătorie variază în funcție de distanță și rută. De exemplu, Chișinău la București durează aproximativ 8-10 ore, în timp ce rutele domestice mai scurte pot dura 2-4 ore. Verifică detaliile rutei individuale pentru timpii exacti.',
    
    'faq.safety.measures.question': 'Ce măsuri de siguranță sunt implementate?',
    'faq.safety.measures.answer': 'Toate autobuzele noastre sunt inspectate și întreținute în mod regulat. Șoferii sunt instruiți profesional și licențiați. Avem sisteme de monitorizare 24/7 și de răspuns la urgențe. Centurile de siguranță sunt disponibile pe toate locurile.',
    'faq.safety.insurance.question': 'Asigurarea de călătorie este inclusă?',
    'faq.safety.insurance.answer': 'Asigurarea de călătorie de bază este inclusă cu toate biletele. Aceasta acoperă urgențele medicale și anulările de călătorie. Asigurarea suplimentară comprehensivă poate fi achiziționată în timpul rezervării pentru o acoperire îmbunătățită.',
    'faq.safety.emergency.question': 'Ce ar trebui să fac în caz de urgență?',
    'faq.safety.emergency.answer': 'În caz de urgență, contactează imediat linia noastră de urgență 24/7. Toate autobuzele sunt echipate cu ieșiri de urgență și truse de prim ajutor. Șoferii sunt instruiți în procedurile de urgență și pot contacta serviciile de urgență.',
    
    'faq.service.contact.question': 'Cum pot contacta serviciul de clienți?',
    'faq.service.contact.answer': 'Ne poți contacta prin multiple canale: suport telefonic 24/7, chat live pe site-ul nostru web, suport prin email sau prin aplicația noastră mobilă. De asemenea, avem birouri de servicii clienți la stațiile de autobuz majore.',
    'faq.service.hours.question': 'Care sunt orele serviciului de clienți?',
    'faq.service.hours.answer': 'Serviciul nostru de clienți este disponibil 24/7 pentru probleme urgente. Întrebările generale sunt gestionate de la 6:00 AM la 10:00 PM zilnic. Suportul de urgență este întotdeauna disponibil.',
    'faq.service.complaints.question': 'Cum pot depune o plângere?',
    'faq.service.complaints.answer': 'Poți depune plângeri prin formularul de feedback al site-ului nostru web, să ne trimiți un email direct sau să vorbești cu un reprezentant al serviciului de clienți. Ne propunem să răspundem la toate plângerile în 48 de ore.',
    
    'faq.pricing.studentDiscounts.question': 'Există reduceri pentru studenți sau pensionari?',
    'faq.pricing.studentDiscounts.answer': 'Da, oferim reduceri pentru studenți (cu ID valid), pensionari (65+) și copii sub 12 ani. De asemenea, avem tarife speciale pentru rezervări de grup de 10 sau mai mulți pasageri.',
    'faq.pricing.loyaltyPrograms.question': 'Oferiți programe de fidelitate?',
    'faq.pricing.loyaltyPrograms.answer': 'Da, programul nostru Starlines Rewards oferă puncte pentru fiecare călătorie, care pot fi răscumpărate pentru reduceri la rezervările viitoare. Membrii au de asemenea acces la oferte exclusive și oportunități de rezervare timpurie.',
    'faq.pricing.seasonalPromotions.question': 'Există promoții sezoniere?',
    'faq.pricing.seasonalPromotions.answer': 'Da, organizăm în mod regulat promoții sezoniere și oferte speciale. Acestea includ oferte de călătorie de vară, pachete de sărbători și reduceri de ultimă oră. Înscrie-te la newsletter-ul nostru pentru a rămâne actualizat.',
    
    // Contacts
    'contacts.title': 'Contacte',
    'contacts.description': 'Suntem aici să vă ajutăm să vă planificați călătoria perfectă',
    'contacts.breadcrumbHome': 'Home',
    'contacts.breadcrumbContacts': 'Contacte',
    
    // Contact Information Section
    'contacts.weAreHereToHelp.title': 'Suntem aici să vă ajutăm',
    'contacts.weAreHereToHelp.description': 'Echipa noastră de specialiști este pregătită să vă ofere asistență personalizată pentru a vă planifica călătoria perfectă în Europa.',
    
    // Contact Cards
    'contacts.email.title': 'Email',
    'contacts.email.description': 'Pentru întrebări generale și asistență',
    'contacts.phone.title': 'Telefon',
    'contacts.phone.description': 'Suport telefonic în timpul programului',
    'contacts.schedule.title': 'Program',
    'contacts.schedule.weekdays': 'Luni - Vineri: 9:00 - 18:00',
    'contacts.schedule.saturday': 'Sâmbătă: 9:00 - 14:00',
    
    // Contact Form Section
    'contacts.form.title': 'Formular de Contact Complex',
    'contacts.form.description': 'Completați formularul de mai jos pentru a primi o ofertă personalizată pentru călătoria dvs. în Europa.',
    
    // Success Message
    'contacts.success.title': 'Mulțumim pentru mesaj!',
    'contacts.success.description': 'Am primit solicitarea dvs. și vă vom contacta în cel mai scurt timp pentru a discuta despre călătoria dvs.',
    'contacts.success.responseTime': 'Răspuns în 24 de ore',
    
    // Form Sections
    'contacts.form.personalInfo.title': 'Informații Personale și Detalii Călătorie',
    'contacts.form.personalInfo.section': 'Informații Personale',
    'contacts.form.travelDetails.section': 'Detalii Călătorie',
    'contacts.form.passengers.section': 'Pasageri',
    'contacts.form.contactInfo.section': 'Informații de Contact',
    'contacts.form.additionalMessage.section': 'Mesaj Suplimentar',
    
    // Form Fields
    'contacts.form.firstName.label': 'Prenume',
    'contacts.form.firstName.placeholder': 'Introduceți prenumele',
    'contacts.form.lastName.label': 'Nume',
    'contacts.form.lastName.placeholder': 'Introduceți numele',
    'contacts.form.destination.label': 'Destinație',
    'contacts.form.destination.placeholder': 'Selectați destinația',
    'contacts.form.destination.other': 'Altă destinație',
    'contacts.form.destination.otherPlaceholder': 'Specificați destinația',
    'contacts.form.date.label': 'Data Călătoriei',
    'contacts.form.adults.label': 'Adulți',
    'contacts.form.minors.label': 'Minori',
    'contacts.form.minorAge.label': 'Vârsta Minorului',
    'contacts.form.minorAge.placeholder': 'Ex: 12 ani',
    'contacts.form.phone.label': 'Număr de Telefon',
    'contacts.form.phone.placeholder': '+373 60 12 34 56',
    'contacts.form.email.label': 'Email',
    'contacts.form.email.placeholder': 'exemplu@email.com',
    'contacts.form.message.label': 'Mesaj (opțional)',
    'contacts.form.message.placeholder': 'Descrieți cerințele speciale, preferințe de cazare, sau alte detalii importante pentru călătoria dvs...',
    
    // Form Validation Messages
    'contacts.form.validation.firstName.required': 'Prenumele este obligatoriu',
    'contacts.form.validation.lastName.required': 'Numele este obligatoriu',
    'contacts.form.validation.destination.required': 'Destinația este obligatorie',
    'contacts.form.validation.date.required': 'Data este obligatorie',
    'contacts.form.validation.minorAge.required': 'Vârsta minorului este obligatorie când călătorește un minor',
    'contacts.form.validation.phone.required': 'Numărul de telefon este obligatoriu',
    'contacts.form.validation.phone.invalid': 'Numărul de telefon nu este valid (format: +373XXXXXXXX sau 0XXXXXXXX)',
    'contacts.form.validation.email.required': 'Email-ul este obligatoriu',
    'contacts.form.validation.email.invalid': 'Email-ul nu este valid',
    
    // Form Actions
    'contacts.form.submit.sending': 'Se trimite...',
    'contacts.form.submit.send': 'Trimite Solicitarea',
    
    // Company Information
    'contacts.company.about.title': 'Despre Starlines',
    'contacts.company.about.description': 'Suntem o companie de transport internațional cu experiență de peste 10 ani în organizarea călătoriilor de autobuz în Europa. Ne mândrim cu serviciul de calitate și atenția la detalii pentru fiecare pasager.',
    'contacts.company.registered': 'Companie înregistrată în Republica Moldova',
    'contacts.company.routes': 'Rute în 15+ țări europene',
    'contacts.company.passengers': 'Peste 50,000 de pasageri mulțumiți',
    
    // Why Choose Us
    'contacts.company.whyChoose.title': 'De ce să alegeți Starlines?',
    'contacts.company.competitivePrices.title': 'Prețuri Competitive',
    'contacts.company.competitivePrices.description': 'Oferte speciale și reduceri pentru grupuri',
    'contacts.company.personalizedService.title': 'Serviciu Personalizat',
    'contacts.company.personalizedService.description': 'Asistență individuală pentru fiecare călătorie',
    'contacts.company.guaranteedSafety.title': 'Siguranță Garantată',
    'contacts.company.guaranteedSafety.description': 'Autobuze moderne cu toate standardele de siguranță',
    'contacts.company.support24.title': 'Suport 24/7',
        'contacts.company.support24.description': 'Asistență telefonică în timpul călătoriei',
    
    // Blog Article Content
    'blog.article.top10Destinations.content': `
      <h2>Descoperă Europa de Est</h2>
      <p>Europa de Est este o regiune fascinantă care oferă o experiență de călătorie unică, combinând istoria bogată cu peisaje spectaculoase și o cultură vibrantă.</p>
      
      <h3>1. Praga, Republica Cehă</h3>
      <p>Orașul cu o mie de turnuri te va captiva cu arhitectura gotică și barocă. Castelul Praga și Podul Carol sunt doar câteva dintre atracțiile care fac din Praga o destinație de ne ratat.</p>
      
      <h3>2. Budapesta, Ungaria</h3>
      <p>Capitala ungară îți oferă o experiență duală: Buda, cu castelul medieval, și Pesta, cu arhitectura secesionistă. Nu rata o croazieră pe Dunăre la apus.</p>
      
      <h3>3. Cracovia, Polonia</h3>
      <p>Orașul regal al Poloniei te va transporta în timp cu piața medievală și castelul Wawel. Cartierul evreiesc Kazimierz adaugă o dimensiune culturală profundă.</p>
      
      <h3>4. București, România</h3>
      <p>Capitala României îți oferă o combinație fascinantă de arhitectură comunistă și clasică. Palatul Parlamentului și centrul istoric sunt doar începutul.</p>
      
      <h3>5. Bratislava, Slovacia</h3>
      <p>Capitala slovacă, mai mică și mai intimă, îți oferă o experiență autentică cu castelul medieval și centrul istoric pitoresc.</p>
      
      <h3>6. Ljubljana, Slovenia</h3>
      <p>Orașul verde al Europei te va surprinde cu arhitectura Art Nouveau și atmosfera relaxată. Castelul Ljubljana oferă vederi panoramice spectaculoase.</p>
      
      <h3>7. Zagreb, Croația</h3>
      <p>Capitala croată îți oferă o experiență urbană sofisticată cu centrul medieval și cartierul Art Nouveau.</p>
      
      <h3>8. Sofia, Bulgaria</h3>
      <p>Orașul cu o istorie de 7000 de ani îți oferă o combinație fascinantă de influențe romane, bizantine și otomane.</p>
      
      <h3>9. Tallinn, Estonia</h3>
      <p>Capitala estonă îți oferă o experiență medievală autentică cu centrul istoric bine păstrat și atmosfera hanseatică.</p>
      
      <h3>10. Riga, Letonia</h3>
      <p>Orașul cu cea mai mare concentrație de arhitectură Art Nouveau din Europa îți oferă o experiență vizuală deosebită.</p>
      
      <h2>Consele pentru Călătorie</h2>
      <p>Pentru a-ți face călătoria în Europa de Est memorabilă, îți recomand să:</p>
      <ul>
        <li>Planifici în avans, dar să lași loc pentru spontaneitate</li>
        <li>Înveți câteva cuvinte în limba locală</li>
        <li>Explorezi atât atracțiile turistice, cât și locurile mai puțin cunoscute</li>
        <li>Te bucuri de bucătăria locală autentică</li>
        <li>Interacționezi cu localnicii pentru o experiență mai profundă</li>
      </ul>
    `,
    
    'blog.article.comfortableTravel.content': `
      <h2>Călătoria Confortabilă pe Distanțe Lungi</h2>
      <p>Călătoria cu autobuzul pe distanțe lungi nu trebuie să fie o experiență neplăcută. Cu puțină planificare și câteva trucuri, poți transforma o călătorie de 8-12 ore într-o experiență confortabilă și chiar plăcută.</p>
      
      <h3>1. Alegerea Scaunului</h3>
      <p>Încearcă să alegi un scaun lângă fereastră pentru priveliști și mai mult spațiu personal. Scaunele din față oferă mai puțină vibrație, iar cele din spate pot fi mai zgomotoase.</p>
      
      <h3>2. Esențialele de Confort</h3>
      <p>Nu uita să îți aduci:</p>
      <ul>
        <li>O pernă de călătorie pentru sprijinul gâtului</li>
        <li>O pătură ușoară pentru căldură</li>
        <li>Ochelari de soare pentru lumina puternică</li>
      </ul>
      
      <h3>3. Divertismentul</h3>
      <p>Îți recomand să îți descarci în avans:</p>
      <ul>
        <li>Podcast-uri interesante</li>
        <li>Muzică relaxantă</li>
        <li>O carte electronică sau fizică</li>
        <li>Jocuri offline pe telefon</li>
      </ul>
      
      <h3>4. Hrana și Hidratarea</h3>
      <p>Îți recomand să îți aduci:</p>
      <ul>
        <li>Snack-uri sănătoase (nuci, fructe uscate)</li>
        <li>O sticlă de apă reînoibilă</li>
        <li>Sandwich-uri ușoare</li>
      </ul>
      
      <h3>5. Pauzele Regulate</h3>
      <p>Profită de pauzele pentru a:</p>
      <ul>
        <li>Te întinde și să faci exerciții ușoare</li>
        <li>Respiri aer proaspăt</li>
        <li>Socializezi cu alți călători</li>
      </ul>
    `,
    
    'blog.article.romaniaGuide.content': `
      <h2>Ghidul Complet pentru Călătoria cu Autobuzul în România</h2>
      <p>România oferă o rețea vastă de transport cu autobuzul care conectează toate orașele importante și multe sate. Iată tot ce trebuie să știi pentru o călătorie fără probleme.</p>
      
      <h3>Rețeaua de Transport</h3>
      <p>România are o rețea bine dezvoltată de transport cu autobuzul, cu companii precum:</p>
      <ul>
        <li>Autogari.ro - platforma principală de rezervări</li>
        <li>Companii regionale și naționale</li>
        <li>Rute internaționale către țările vecine</li>
      </ul>
      
      <h3>Rezervarea Biletelor</h3>
      <p>Pentru a-ți rezerva biletele:</p>
      <ul>
        <li>Folosește platformele online (Autogari.ro, FlixBus)</li>
        <li>Rezervă cu cel puțin 24 de ore în avans</li>
        <li>Verifică programul și durata călătoriei</li>
      </ul>
      
      <h3>Destinații Populare</h3>
      <p>Cele mai populare rute din România:</p>
      <ul>
        <li>București - Brașov (2-3 ore)</li>
        <li>București - Sibiu (4-5 ore)</li>
        <li>București - Cluj-Napoca (6-7 ore)</li>
        <li>București - Timișoara (7-8 ore)</li>
      </ul>
      
      <h3>Consele Practice</h3>
      <p>Pentru o călătorie fără probleme:</p>
      <ul>
        <li>Ajungi la autogară cu 30 de minute în avans</li>
        <li>Verifică platforma de plecare</li>
        <li>Ai grijă la bagaje</li>
        <li>Păstrează biletul la îndemână</li>
      </ul>
    `,
    
    'blog.article.bestTimeToVisit.content': `
      <h2>Cea Mai Bună Perioadă pentru a Vizita Europa de Est</h2>
      <p>Europa de Est oferă experiențe unice în fiecare anotimp, dar anumite perioade sunt mai potrivite pentru anumite tipuri de călătorie.</p>
      
      <h3>Primăvara (Martie - Mai)</h3>
      <p>Primăvara este perfectă pentru:</p>
      <ul>
        <li>Vizitarea parcurilor și grădinilor înflorite</li>
        <li>Prețuri mai mici pentru cazare</li>
        <li>Vremea plăcută pentru explorare</li>
        <li>Festivaluri de primăvară</li>
      </ul>
      
      <h3>Vara (Iunie - August)</h3>
      <p>Vara oferă:</p>
      <ul>
        <li>Vremea cea mai caldă și stabilă</li>
        <li>Festivaluri și evenimente culturale</li>
        <li>Accesul la atracțiile de munte</li>
        <li>Zilele cele mai lungi pentru explorare</li>
      </ul>
      
      <h3>Toamna (Septembrie - Noiembrie)</h3>
      <p>Toamna este ideală pentru:</p>
      <ul>
        <li>Frunzișul colorat spectaculos</li>
        <li>Prețuri mai mici după sezonul turistic</li>
        <li>Vremea plăcută pentru călătorie</li>
        <li>Festivaluri de toamnă</li>
      </ul>
      
      <h3>Iarna (Decembrie - Februarie)</h3>
      <p>Iarna oferă:</p>
      <ul>
        <li>Piețele de Crăciun magice</li>
        <li>Stațiuni de schi accesibile</li>
        <li>Experiențe unice de iarnă</li>
        <li>Prețuri foarte mici pentru cazare</li>
      </ul>
    `,
    
    'blog.article.budgetTravel.content': `
      <h2>Cum să Călătorești în Europa de Est cu un Buget Mic</h2>
      <p>Europa de Est este una dintre cele mai accesibile regiuni din Europa pentru călătoriile cu buget mic. Iată cum să economisești fără să sacrifici experiența.</p>
      
      <h3>Cazarea</h3>
      <p>Pentru cazare ieftină:</p>
      <ul>
        <li>Hostel-uri (5-15 EUR/noapte)</li>
        <li>Apartamente prin Airbnb (20-40 EUR/noapte)</li>
        <li>Hoteluri mici locale (25-50 EUR/noapte)</li>
        <li>Couchsurfing (gratis)</li>
      </ul>
      
      <h3>Transportul</h3>
      <p>Pentru transport ieftin:</p>
      <ul>
        <li>Autobuze locale (0.5-2 EUR)</li>
        <li>Metroul în orașele mari (0.5-1 EUR)</li>
        <li>Biciclete de închiriat (5-10 EUR/zi)</li>
        <li>Mersul pe jos (gratis)</li>
      </ul>
      
      <h3>Mâncarea</h3>
      <p>Pentru mâncare ieftină:</p>
      <ul>
        <li>Restaurante locale (5-10 EUR/masă)</li>
        <li>Piețe locale pentru ingrediente</li>
        <li>Street food (2-5 EUR)</li>
        <li>Supermarket-uri pentru snack-uri</li>
      </ul>
      
      <h3>Activitățile</h3>
      <p>Pentru activități gratuite sau ieftine:</p>
      <ul>
        <li>Muzee gratuite în prima zi a lunii</li>
        <li>Parcuri și grădini publice</li>
        <li>Plimbări cu ghid gratuit</li>
        <li>Festivaluri locale gratuite</li>
      </ul>
    `,
    
    'blog.article.localCuisine.content': `
      <h2>Ghidul Gastronomic al Europei de Est</h2>
      <p>Bucătăria Europei de Est este o fuziune fascinantă de influențe culinare, de la tradițiile slave la influențele otomane și austro-ungare.</p>
      
      <h3>România</h3>
      <p>Bucătăria românească îți oferă:</p>
      <ul>
        <li>Sarmale - frunze de viță învelite cu carne și orez</li>
        <li>Mămăligă cu brânză și smântână</li>
        <li>Ciorbă de burtă - supă tradițională</li>
        <li>Papanăși - gogoașe cu smântână și gem</li>
      </ul>
      
      <h3>Polonia</h3>
      <p>Bucătăria poloneză îți oferă:</p>
      <ul>
        <li>Pierogi - găluște umplute cu diverse ingrediente</li>
        <li>Bigos - tocană tradițională cu varză și carne</li>
        <li>Żurek - supă de secară fermentată</li>
        <li>Paczki - gogoașe poloneze tradiționale</li>
      </ul>
      
      <h3>Ungaria</h3>
      <p>Bucătăria ungară îți oferă:</p>
      <ul>
        <li>Gulyás - tocană tradițională de carne</li>
        <li>Lángos - pâine prăjită cu usturoi</li>
        <li>Chimney cake - cozonac în formă de coș</li>
        <li>Tokaji - vin dulce tradițional</li>
      </ul>
      
      <h3>Republica Cehă</h3>
      <p>Bucătăria cehă îți oferă:</p>
      <ul>
        <li>Svíčková - carne de vită cu sos de smântână</li>
        <li>Guláš - tocană tradițională</li>
        <li>Trdelík - desert tradițional</li>
        <li>Pilsner - berea tradițională</li>
      </ul>
    `,
    
    'blog.article.safetyTips.content': `
      <h2>Sfaturi de Siguranță pentru Călătoria cu Autobuzul</h2>
      <p>Călătoria cu autobuzul este în general sigură, dar este important să urmezi câteva reguli de bază pentru a-ți asigura siguranța.</p>
      
      <h3>Înainte de Călătorie</h3>
      <p>Înainte să pleci:</p>
      <ul>
        <li>Verifică reputația companiei de transport</li>
        <li>Citește recenziile altor călători</li>
        <li>Verifică dacă autobuzul are siguranță</li>
        <li>Înregistrează-ți bagajele dacă este necesar</li>
      </ul>
      
      <h3>În Timpul Călătoriei</h3>
      <p>În timpul călătoriei:</p>
      <ul>
        <li>Păstrează-ți bagajele în apropiere</li>
        <li>Nu lăsa obiecte de valoare nesupravegheate</li>
        <li>Fii atent la opriri pentru pauze</li>
        <li>Nu accepta mâncare sau băuturi de la străini</li>
      </ul>
      
      <h3>La Destinație</h3>
      <p>La destinație:</p>
      <ul>
        <li>Verifică-ți bagajele înainte să pleci</li>
        <li>Fii atent la taxi-uri neautorizate</li>
        <li>Folosește transportul public oficial</li>
        <li>Păstrează-ți obiectele de valoare în siguranță</li>
      </ul>
      
      <h3>În Caz de Urgență</h3>
      <p>În caz de urgență:</p>
      <ul>
        <li>Șoferul este responsabil pentru siguranța pasagerilor</li>
        <li>Urmează instrucțiunile personalului</li>
        <li>Ține la îndemână numerele de urgență</li>
        <li>Rămâi calm și ajută alții dacă poți</li>
      </ul>
    `,
    
    'blog.article.winterTravel.content': `
      <h2>Călătoria în Europa de Est în Sezonul Rece</h2>
      <p>Iarna în Europa de Est oferă o experiență complet diferită, cu orașe înghețate, piețe de Crăciun magice și oportunități unice de explorare.</p>
      
      <h3>Pregătirea pentru Iarnă</h3>
      <p>Pentru o călătorie de iarnă reușită:</p>
      <ul>
        <li>Îmbracă-te în straturi pentru căldură</li>
        <li>Folosește încălțăminte impermeabilă</li>
        <li>Nu uita de mănuși, eșarfe și căciuli</li>
        <li>Verifică prognoza meteo în avans</li>
      </ul>
      
      <h3>Destinații Populare de Iarnă</h3>
      <p>Cele mai populare destinații de iarnă:</p>
      <ul>
        <li>București - piețele de Crăciun magice</li>
        <li>Bratislava - centrul istoric înghețat</li>
        <li>Praga - atmosfera medievală de iarnă</li>
        <li>Budapesta - băile termale în zilele reci</li>
      </ul>
      
      <h3>Activități de Iarnă</h3>
      <p>Activități populare în sezonul rece:</p>
      <ul>
        <li>Schiul în stațiunile din Carpați</li>
        <li>Patinajul pe lacurile înghețate</li>
        <li>Vizitarea piețelor de Crăciun</li>
        <li>Băile termale pentru încălzire</li>
      </ul>
      
      <h3>Consele Practice</h3>
      <p>Pentru o călătorie de iarnă fără probleme:</p>
      <ul>
        <li>Rezervă cazarea în avans</li>
        <li>Verifică programul de transport</li>
        <li>Ai grijă la gheața pe trotuare</li>
        <li>Profitează de prețurile mai mici</li>
      </ul>
    `,
    
    'blog.article.culturalEtiquette.content': `
      <h2>Eticheta Culturală în Europa de Est</h2>
      <p>Înțelegerea etichetei culturale este esențială pentru o experiență de călătorie reușită în Europa de Est. Iată ghidul complet.</p>
      
      <h3>Saluturile</h3>
      <p>Pentru saluturi:</p>
      <ul>
        <li>În România: "Bună ziua" (formal) sau "Salut" (informal)</li>
        <li>În Polonia: "Dzień dobry" (formal) sau "Cześć" (informal)</li>
        <li>În Ungaria: "Jó napot" (formal) sau "Szia" (informal)</li>
        <li>În Republica Cehă: "Dobrý den" (formal) sau "Ahoj" (informal)</li>
      </ul>
      
      <h3>La Masă</h3>
      <p>Pentru comportamentul la masă:</p>
      <ul>
        <li>Așteaptă să fii poftit la masă</li>
        <li>Nu începe să mănânci înainte de gazdă</li>
        <li>Fă un toast înainte de prima înghițitură</li>
        <li>Nu lăsa mâncarea pe farfurie</li>
      </ul>
      
      <h3>În Locuri Publice</h3>
      <p>Pentru comportamentul în locuri publice:</p>
      <ul>
        <li>Fii respectuos cu bătrânii</li>
        <li>Nu fuma în locuri publice închise</li>
        <li>Fii discret cu fotografiile</li>
        <li>Respectă regulile locale</li>
      </ul>
      
      <h3>Interacțiunea Socială</h3>
      <p>Pentru interacțiunea socială:</p>
      <ul>
        <li>Fii sincer și direct</li>
        <li>Nu evita subiectele dificile</li>
        <li>Respectă opiniile politice</li>
        <li>Fii curios despre cultura locală</li>
      </ul>
    `,
    
    // Admin
    'admin.title': 'Panoul Admin',
    'admin.subtitle': 'Gestionarea rutelor și administrarea',
    
    // Forms
    'form.firstName': 'Prenume',
    'form.lastName': 'Nume',
    'form.email': 'Email',
    'form.phone': 'Telefon',
    'form.password': 'Parolă',
    'form.confirmPassword': 'Confirmă Parola',
    'form.required': 'Obligatoriu',
    'form.optional': 'Opțional',
    
    // My Tickets
    'myTickets.title': 'Biletele Mele',
    'myTickets.subtitle': 'Caută biletele tale, descarcă PDF-uri și gestionează rezervările',
    'myTickets.lookupTab': 'Caută Bilet',
    'myTickets.accountTab': 'Contul Meu',
    'myTickets.findTicket': 'Găsește Biletul Tău',
    'myTickets.orderNumber': 'Numărul Comenzii',
    'myTickets.orderNumberPlaceholder': 'ex., STL-2024-001',
    'myTickets.securityCode': 'Codul de Securitate',
    'myTickets.securityCodePlaceholder': 'Introdu codul de securitate',
    'myTickets.findTicketButton': 'Găsește Biletul',
    'myTickets.searching': 'Se caută...',
    'myTickets.helpText1': 'Nu ai detaliile tale?',
    'myTickets.helpText2': 'Verifică emailul de confirmare sau contactează suportul',
    'myTickets.ticketDetails': 'Detaliile Biletului',
    'myTickets.enterOrderDetails': 'Introdu detaliile comenzii pentru a găsi biletul',
    'myTickets.route': 'Ruta',
    'myTickets.date': 'Data',
    'myTickets.time': 'Ora',
    'myTickets.passengers': 'Pasageri',
    'myTickets.totalPaid': 'Total Plătit',
    'myTickets.downloadPDF': 'Descarcă PDF',
    'myTickets.showQR': 'Arată QR',
    'myTickets.email': 'Email',
    'myTickets.pdfDownloaded': 'PDF Descărcat',
    'myTickets.pdfDownloadedDesc': 'Biletul a fost descărcat cu succes',
    'myTickets.emailSent': 'Email Trimis',
    'myTickets.emailSentDesc': 'Biletul a fost trimis pe email',
    'myTickets.qrCodeTitle': 'Codul QR al Biletului Tău',
    'myTickets.qrCodeDescription': 'Arată acest cod QR șoferului la îmbarcare',
    'myTickets.qrCodePlaceholder': 'Cod QR Placeholder',
    'myTickets.order': 'Comanda',
    'myTickets.accountInformation': 'Informațiile Contului',
    'myTickets.signInMessage': 'Conectează-te pentru a accesa biletele tale',
    'myTickets.createAccountMessage': 'Creează un cont sau conectează-te pentru a vedea toate rezervările și biletele tale',
    'myTickets.signIn': 'Conectare',
    'myTickets.createAccount': 'Creează Cont',
    'myTickets.recentBookings': 'Rezervări Recente',
    'myTickets.passenger': 'pasager',
    'myTickets.quickActions': 'Acțiuni Rapide',
    'myTickets.downloadAllTickets': 'Descarcă Toate Biletele',
    'myTickets.emailAllTickets': 'Trimite Toate Biletele pe Email',
    'myTickets.viewCalendar': 'Vezi Calendarul',
    'myTickets.bookNewTrip': 'Rezervă O Călătorie Nouă',
    'myTickets.missingInformation': 'Informații Lipsă',
    'myTickets.enterBothFields': 'Te rog să introduci atât numărul comenzii cât și codul de securitate.',
    'myTickets.ticketFound': 'Bilet Găsit',
    'myTickets.ticketRetrieved': 'Biletul tău a fost recuperat cu succes.',
    'myTickets.ticketNotFound': 'Biletul Nu a Fost Găsit',
    'myTickets.checkDetails': 'Te rog să verifici numărul comenzii și codul de securitate.',
    'myTickets.copied': 'Copiat!',
    'myTickets.copiedToClipboard': 'a fost copiat în clipboard.',
    'myTickets.signInSuccess': 'Conectare Reușită',
    'myTickets.welcomeBack': 'Bine ai revenit!',
    'myTickets.signInError': 'Eroare de Conectare',
    'myTickets.invalidCredentials': 'Email sau parolă incorecte.',
    'myTickets.signUpSuccess': 'Cont Creat cu Succes',
    'myTickets.accountCreated': 'Contul tău a fost creat!',
    'myTickets.signUpError': 'Eroare la Crearea Contului',
    'myTickets.passwordMismatch': 'Parolele nu se potrivesc.',
    'myTickets.fillAllFields': 'Te rog să completezi toate câmpurile.',
    'myTickets.authError': 'Eroare de Autentificare',
    'myTickets.tryAgain': 'Încearcă din nou.',
    'myTickets.signOutSuccess': 'Deconectare Reușită',
    'myTickets.signedOut': 'Ai fost deconectat cu succes.',
    'myTickets.welcomeMessage': 'Bine ai venit în contul tău!',
    'myTickets.accountActive': 'Contul tău este activ și poți accesa toate funcționalitățile.',
    'myTickets.signOut': 'Deconectare',
    'myTickets.signInDescription': 'Conectează-te pentru a accesa biletele tale.',
    'myTickets.signUpDescription': 'Creează un cont nou pentru a începe să folosești serviciile noastre.',
    'myTickets.firstName': 'Prenumele',
    'myTickets.lastName': 'Numele',
    'myTickets.password': 'Parola',
    'myTickets.confirmPassword': 'Confirmă Parola',
    'myTickets.processing': 'Se procesează...',
    'myTickets.cancel': 'Anulează',
    
    // Terms of Service
    'terms.title': 'Termeni și Condiții',
    'terms.subtitle': 'Te rog să citești cu atenție acești termeni înainte de a folosi serviciile noastre. Prin folosirea Starlines, ești de acord să respecți și să fie legat de acești termeni.',
    'terms.lastUpdated': 'Ultima actualizare: 1 ianuarie 2024',
    'terms.version': 'Versiunea 2.1',
    'terms.quickNavigation': 'Navigare Rapidă',
    'terms.questionsAboutTerms': 'Întrebări despre Termenii Noștri?',
    'terms.legalTeamHelp': 'Echipa noastră juridică este aici pentru a ajuta la clarificarea oricăror întrebări pe care le-ai putea avea despre acești termeni.',
    'terms.contactLegal': 'Contactează-ne la',
    'terms.orCall': 'sau sună',
    
    // Terms Sections
    'terms.section1.title': '1. Acceptarea Termenilor',
    'terms.section1.content': 'Prin accesarea și folosirea site-ului web Starlines, aplicația mobilă sau serviciile, confirmi că ai citit, înțeles și ești de acord să fii legat de acești Termeni de Serviciu. Dacă nu ești de acord cu acești termeni, te rog să nu folosești serviciile noastre.',
    
    'terms.section2.title': '2. Descrierea Serviciilor',
    'terms.section2.content': 'Starlines oferă servicii de transport cu autobuzul în Europa de Est. Serviciile noastre includ rezervarea online a biletelor, informații despre rute, suport pentru clienți și servicii de călătorie conexe. Ne rezervăm dreptul de a modifica, suspenda sau întrerupe orice aspect al serviciilor noastre în orice moment.',
    
    'terms.section3.title': '3. Rezervarea și Plata',
    'terms.section3.content': 'Toate rezervările sunt supuse disponibilității și confirmării. Plata trebuie finalizată la momentul rezervării. Acceptăm carduri de credit majore, carduri de debit și alte metode de plată afișate în timpul finalizării comenzii. Prețurile pot fi modificate fără notificare până când plata este confirmată.',
    
    'terms.section4.title': '4. Biletele și Călătoria',
    'terms.section4.content': 'Identificarea validă este obligatorie pentru călătorie. Pasagerii trebuie să ajungă la punctul de plecare cu cel puțin 30 de minute înainte de plecarea programată. Biletele nu sunt transferabile, cu excepția cazului în care se specifică explicit altfel. Biletele pierdute sau furate nu pot fi înlocuite fără documentația corespunzătoare.',
    
    'terms.section5.title': '5. Anularea și Rambursările',
    'terms.section5.content': 'Anulările făcute cu mai mult de 24 de ore înainte de plecare sunt eligibile pentru rambursare minus taxele de procesare. Anulările în termen de 24 de ore de la plecare nu pot fi eligibile pentru rambursare. Absențele nu sunt eligibile pentru rambursări. Rambursările sunt procesate în termen de 7-10 zile lucrătoare.',
    
    'terms.section6.title': '6. Bagajul și Obiectele Personale',
    'terms.section6.content': 'Fiecare pasager are dreptul la o geantă de mână (max 10kg) și o geantă înregistrată (max 20kg). Se aplică taxe suplimentare pentru bagaj pentru excesul de greutate sau geți suplimentare. Starlines nu este responsabil pentru obiectele personale pierdute, deteriorate sau furate, cu excepția cazului în care sunt cauzate de neglijența noastră.',
    
    'terms.section7.title': '7. Conduita Pasagerilor',
    'terms.section7.content': 'Pasagerii trebuie să respecte toate reglementările de siguranță și instrucțiunile echipajului. Comportamentul disruptiv, abuziv sau periculos poate duce la eliminarea din vehicul fără rambursare. Fumatul, consumul de alcool și substanțele ilegale sunt interzise pe toate vehiculele.',
    
    'terms.section8.title': '8. Limitarea Răspunderii',
    'terms.section8.content': 'Răspunderea Starlines este limitată în măsura permisă de lege. Nu suntem responsabili pentru întârzierile cauzate de vreme, trafic, probleme mecanice sau alte circumstanțe dincolo de controlul nostru. Răspunderea maximă pentru orice cerere este limitată la prețul biletului plătit.',
    
    'terms.section9.title': '9. Confidențialitatea și Protecția Datelor',
    'terms.section9.content': 'Colectăm și procesăm datele personale în conformitate cu Politica noastră de Confidențialitate și legile aplicabile de protecție a datelor. Prin folosirea serviciilor noastre, consenți la colectarea și utilizarea informațiilor tale așa cum sunt descrise în Politica noastră de Confidențialitate.',
    
    'terms.section10.title': '10. Modificările Termenilor',
    'terms.section10.content': 'Starlines se rezervă dreptul de a modifica acești Termeni de Serviciu în orice moment. Modificările vor fi postate pe site-ul nostru web și vor deveni efective imediat. Utilizarea continuă a serviciilor noastre după modificări constituie acceptarea termenilor modificați.',
    
    'terms.section11.title': '11. Legea Guvernatoare',
    'terms.section11.content': 'Acești Termeni de Serviciu sunt guvernați de legile Moldovei. Orice dispute care decurg din acești termeni sau serviciile noastre vor fi rezolvate în instanțele Moldovei. Dacă orice dispoziție se dovedește a fi neexecutabilă, dispozițiile rămase rămân în efect deplin.',
    
    'terms.section12.title': '12. Informații de Contact',
    'terms.section12.content': 'Pentru întrebări despre acești Termeni de Serviciu, te rog să ne contactezi la legal@starlines.md sau să ne suni la serviciul clienți la +373 22 123 456. Departamentul nostru juridic este disponibil de luni până vineri, de la 9:00 AM până la 6:00 PM.',
    
    // Privacy Policy
    'privacy.title': 'Politica de Confidențialitate',
    'privacy.subtitle': 'Ne prețuim confidențialitatea și suntem dedicați protejării datelor tale personale. Această politică explică cum colectăm, folosim și protejăm informațiile tale.',
    'privacy.lastUpdated': 'Ultima actualizare: 1 ianuarie 2024',
    'privacy.gdprCompliant': 'Conform GDPR',
    'privacy.typesOfData': 'Tipuri de Date pe Care Le Colectăm',
    'privacy.quickNavigation': 'Navigare Rapidă',
    'privacy.exerciseYourRights': 'Exercită-ți Drepturile de Confidențialitate',
    'privacy.rightsDescription': 'Ai control asupra datelor tale personale. Contactează-ne pentru a exercita oricare dintre aceste drepturi:',
    'privacy.contactDPO': 'Contactează Oficerul nostru de Protecție a Datelor la',
    'privacy.orCall': 'sau sună',
    
    // Data Types
    'privacy.personalInformation': 'Informații Personale',
    'privacy.paymentInformation': 'Informații de Plată',
    'privacy.travelInformation': 'Informații de Călătorie',
    'privacy.technicalInformation': 'Informații Tehnice',
    'privacy.name': 'Nume',
    'privacy.emailAddress': 'Adresă de email',
    'privacy.phoneNumber': 'Număr de telefon',
    'privacy.dateOfBirth': 'Data nașterii',
    'privacy.creditCardDetails': 'Detalii card de credit',
    'privacy.billingAddress': 'Adresa de facturare',
    'privacy.paymentHistory': 'Istoricul plăților',
    'privacy.bookingHistory': 'Istoricul rezervărilor',
    'privacy.travelPreferences': 'Preferințele de călătorie',
    'privacy.specialRequirements': 'Cerințe speciale',
    'privacy.ipAddress': 'Adresa IP',
    'privacy.browserType': 'Tipul browserului',
    'privacy.deviceInformation': 'Informații despre dispozitiv',
    'privacy.usageAnalytics': 'Analiza utilizării',
    
    // Privacy Rights
    'privacy.accessData': 'Accesează-ți datele',
    'privacy.rectifyInaccuracies': 'Corectează inexactitățile',
    'privacy.eraseData': 'Șterge-ți datele',
    'privacy.restrictProcessing': 'Restricționează procesarea',
    'privacy.dataPortability': 'Portabilitatea datelor',
    'privacy.objectToProcessing': 'Obiectează procesarea',
    'privacy.withdrawConsent': 'Retrage consimțământul',
    'privacy.fileComplaint': 'Depune o plângere',
    
    // Privacy Sections
    'privacy.section1.title': '1. Introducere',
    'privacy.section1.content': 'Starlines ("noi," "al nostru," sau "noi") este dedicat protejării confidențialității și datelor tale personale. Această Politică de Confidențialitate explică cum colectăm, folosim, procesăm și protejăm informațiile tale când folosești site-ul nostru web, aplicația mobilă și serviciile. Respectăm legile aplicabile de protecție a datelor, inclusiv GDPR.',
    
    'privacy.section2.title': '2. Informațiile pe Care Le Colectăm',
    'privacy.section2.content': 'Colectăm informațiile pe care le furnizezi direct (nume, email, telefon, detalii de plată), informațiile colectate automat (adresa IP, tipul browserului, informații despre dispozitiv, date de utilizare) și informațiile de la terți (procesatori de plată, platforme de social media dacă alegi să te conectezi).',
    
    'privacy.section3.title': '3. Cum Folosim Informațiile Tale',
    'privacy.section3.content': 'Folosim informațiile tale pentru a procesa rezervările și plățile, a furniza suport pentru clienți, a trimite confirmări de rezervare și actualizări de călătorie, a îmbunătăți serviciile noastre, a respecta obligațiile legale, a preveni frauda și a asigura securitatea, și a trimite comunicări de marketing (cu consimțământul tău).',
    
    'privacy.section4.title': '4. Partajarea și Divulgarea Informațiilor',
    'privacy.section4.content': 'Nu vindem informațiile tale personale. Putem partaja informațiile tale cu furnizori de servicii (procesatori de plată, suport IT), parteneri de afaceri (operatori de autobuz), autorități legale când este necesar prin lege, și în cazul transferurilor de afaceri (fuziuni, achiziții).',
    
    'privacy.section5.title': '5. Securitatea Datelor',
    'privacy.section5.content': 'Implementăm măsuri tehnice și organizatorice adecvate pentru a-ți proteja datele personale împotriva accesului neautorizat, alterării, divulgării sau distrugerii. Aceasta include criptarea, servere securizate, controale de acces și audituri de securitate regulate.',
    
    'privacy.section6.title': '6. Păstrarea Datelor',
    'privacy.section6.content': 'Păstrăm datele tale personale doar cât timp este necesar pentru scopurile descrise în această politică sau cât timp este necesar prin lege. Datele de rezervare sunt de obicei păstrate timp de 7 ani pentru scopuri contabile și legale. Datele de marketing sunt păstrate până când retragi consimțământul.',
    
    'privacy.section7.title': '7. Drepturile Tale',
    'privacy.section7.content': 'Conform GDPR și altor legi aplicabile, ai dreptul de a accesa, rectifica, șterge, restricționa procesarea, portabilitatea datelor, obiecta procesării și retrage consimțământul. Poți exercita aceste drepturi contactându-ne la privacy@starlines.md.',
    
    'privacy.section8.title': '8. Cookie-urile și Urmărirea',
    'privacy.section8.content': 'Folosim cookie-uri și tehnologii similare pentru a-ți îmbunătăți experiența, analiza utilizarea și furniza conținut personalizat. Poți controla preferințele cookie-urilor prin setările browserului tău. Vezi Politica noastră de Cookie-uri pentru informații detaliate despre cookie-urile pe care le folosim.',
    
    'privacy.section9.title': '9. Transferuri Internaționale de Date',
    'privacy.section9.content': 'Datele tale pot fi transferate și procesate în țări în afara locuinței tale. Ne asigurăm că sunt implementate garanții adecvate, inclusiv decizii de adecvare, clauze contractuale standard sau alte mecanisme aprobate legal.',
    
    'privacy.section10.title': '10. Confidențialitatea Copiilor',
    'privacy.section10.content': 'Serviciile noastre nu sunt direcționate către copii sub 16 ani. Nu colectăm în mod conștient informații personale de la copii sub 16 ani. Dacă devenim conștienți că am colectat astfel de informații, le vom șterge prompt.',
    
    'privacy.section11.title': '11. Modificări ale Politicii de Confidențialitate',
    'privacy.section11.content': 'Putem actualiza această Politică de Confidențialitate periodic. Te vom notifica despre modificările materiale prin email sau prin site-ul nostru web. Politica actualizată va fi efectivă când va fi postată. Utilizarea continuă constituie acceptarea modificărilor.',
    
    'privacy.section12.title': '12. Informații de Contact',
    'privacy.section12.content': 'Pentru întrebări legate de confidențialitate sau pentru a-ți exercita drepturile, contactează Oficerul nostru de Protecție a Datelor la privacy@starlines.md sau scrie-ne la: Starlines Data Protection, Str. Ismail 123, Chișinău MD-2001, Moldova.',
    
    // Refund Policy
    'refunds.title': 'Politica de Rambursare și Anulare',
    'refunds.subtitle': 'Înțelege termenii noștri de rambursare și procedurile de anulare. Ne străduim să oferim politici de rambursare corecte și transparente pentru toți pasagerii noștri.',
    'refunds.lastUpdated': 'Ultima actualizare: 1 ianuarie 2024',
    'refunds.version': 'Versiunea 1.2',
    'refunds.refundSchedule': 'Programul de Rambursare',
    'refunds.quickNavigation': 'Navigare Rapidă',
    'refunds.requiredDocumentation': 'Documentația Necesară pentru Situații Speciale',
    'refunds.refundProcessingTimes': 'Timpurile de Procesare a Rambursărilor',
    'refunds.needHelpWithRefund': 'Ai Nevoie de Ajutor cu Rambursarea?',
    'refunds.customerServiceDescription': 'Echipa noastră de servicii clienți este gata să te ajute cu anulările și cererile de rambursare.',
    'refunds.callCustomerService': 'Sună la Serviciul Clienți',
    'refunds.submitRefundRequest': 'Trimite Cererea de Rambursare',
    'refunds.hours': 'Program: Luni-Vineri 8:00 AM - 8:00 PM',
    'refunds.note': 'Notă: Toată documentația trebuie să fie oficială și verificabilă. Fotocopiile sau copiile digitale sunt acceptabile pentru revizuirea inițială, dar documentele originale pot fi necesare.',
    
    // Refund Scenarios
    'refunds.standardCancellation': 'Anulare Standard',
    'refunds.lateCancellation': 'Anulare Târzie',
    'refunds.veryLateCancellation': 'Anulare Foarte Târzie',
    'refunds.lastMinuteNoShow': 'Ultimul Moment / Absență',
    'refunds.timeframe': 'Interval de timp',
    'refunds.refund': 'Rambursare',
    'refunds.fee': 'Taxă',
    'refunds.processingFee': 'Taxă de procesare',
    'refunds.noRefund': 'Fără rambursare',
    'refunds.na': 'N/A',
    
    // Refund Sections
    'refunds.section1.title': '1. Prezentarea Politicii de Rambursare',
    'refunds.section1.content': 'Această Politică de Rambursare prezintă termenii și condițiile pentru anulările și rambursările biletelor de autobuz achiziționate prin Starlines. Ne propunem să oferim termeni de rambursare corecte și transparenți, menținând în același timp eficiența operațională. Eligibilitatea pentru rambursare depinde de momentul anulării și tipul biletului.',
    
    'refunds.section2.title': '2. Intervalele de Anulare',
    'refunds.section2.content': 'Eligibilitatea pentru rambursare se bazează pe momentul în care anulezi rezervarea: Mai mult de 24 de ore înainte de plecare (Rambursare completă minus taxa de procesare), 12-24 de ore înainte de plecare (75% rambursare), 2-12 ore înainte de plecare (50% rambursare), Mai puțin de 2 ore înainte de plecare (Fără rambursare), Absență (Fără rambursare).',
    
    'refunds.section3.title': '3. Procesarea Rambursării',
    'refunds.section3.content': 'Rambursările aprobate sunt procesate în termen de 7-10 zile lucrătoare către metoda originală de plată. Se pot aplica taxe de procesare de 2-5 EUR în funcție de metoda de plată și momentul anulării. Rambursările pentru plățile în numerar sunt procesate ca transferuri bancare sau vouchere.',
    
    'refunds.section4.title': '4. Situații Neeligibile pentru Rambursare',
    'refunds.section4.content': 'Anumite situații nu sunt eligibile pentru rambursare: Absențe fără notificare prealabilă, anulări din cauza comportamentului necorespunzător al pasagerului, bilete promoționale sau reduse (cu excepția cazului în care se specifică), bilete achiziționate cu vouchere sau credite, evenimente de forță majoră dincolo de controlul nostru.',
    
    'refunds.section5.title': '5. Circumstanțe Speciale',
    'refunds.section5.content': 'Putem oferi excepții pentru: Urgențe medicale (cu documentație validă), Deces în familie (cu certificatul de deces), Implementare militară (cu ordine oficiale), Dezastre naturale care afectează călătoria, Anulări de servicii de către Starlines (rambursare completă inclusiv taxele).',
    
    'refunds.section6.title': '6. Cum să Soliciți o Rambursare',
    'refunds.section6.content': 'Pentru a solicita o rambursare: Conectează-te la contul tău și găsește rezervarea, fă clic pe "Anulează Rezervarea" sau "Solicită Rambursare", furnizează motivul anulării, trimite documentația necesară (dacă este aplicabil), așteaptă emailul de confirmare cu detaliile rambursării.',
    
    // Documentation Required
    'refunds.medicalEmergency': 'Urgență Medicală',
    'refunds.deathInFamily': 'Deces în Familie',
    'refunds.militaryDeployment': 'Implementare Militară',
    'refunds.naturalDisaster': 'Dezastru Natural',
    'refunds.medicalCertificate': 'Certificat medical',
    'refunds.doctorsNote': 'Nota doctorului',
    'refunds.hospitalDischargePapers': 'Actele de externare din spital',
    'refunds.deathCertificate': 'Certificatul de deces',
    'refunds.proofOfRelationship': 'Dovada relației',
    'refunds.officialDocumentation': 'Documentația oficială',
    'refunds.officialDeploymentOrders': 'Ordinele oficiale de implementare',
    'refunds.militaryId': 'Carnetul de identitate militar',
    'refunds.commandAuthorization': 'Autorizarea comenzii',
    'refunds.newsReports': 'Rapoartele de știri',
    'refunds.officialEvacuationOrders': 'Ordinele oficiale de evacuare',
    'refunds.governmentAdvisories': 'Avertismentele guvernamentale',
    
    // Processing Times
    'refunds.creditCards': 'Carduri de Credit',
    'refunds.bankTransfers': 'Transferuri Bancare',
    'refunds.cashPayments': 'Plăți în Numerar',
    'refunds.businessDays': 'zile lucrătoare',
    
    // Contact Info
    'refunds.phone': 'Telefon',
    'refunds.email': 'Email',
    'refunds.phoneNumber': '+373 22 123 456',
    'refunds.emailAddress': 'refunds@starlines.md'
  },
  ru: {
    // Authentication
    'auth.login.title': 'Вход',
    'auth.login.description': 'Войдите в свой аккаунт',
    'auth.login.button': 'Войти',
    'auth.signUp.title': 'Создание Аккаунта',
    'auth.signUp.description': 'Создайте новый аккаунт',
    'auth.signUp.button': 'Создать Аккаунт',
    'auth.signUp.success.title': 'Аккаунт Успешно Создан!',
    'auth.signUp.success.description': 'Проверьте email для подтверждения аккаунта',
    'auth.signUp.success.login': 'Войти',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'Введите ваш email',
    'auth.password': 'Пароль',
    'auth.passwordPlaceholder': 'Введите ваш пароль',
    'auth.confirmPassword': 'Подтвердите Пароль',
    'auth.confirmPasswordPlaceholder': 'Подтвердите ваш пароль',
    'auth.firstName': 'Имя',
    'auth.firstNamePlaceholder': 'Введите имя',
    'auth.lastName': 'Фамилия',
    'auth.lastNamePlaceholder': 'Введите фамилию',
    'auth.phone': 'Телефон',
    'auth.phonePlaceholder': 'Введите номер телефона',
    'auth.loggingIn': 'Вход...',
    'auth.signingUp': 'Создание аккаунта...',
    'auth.noAccount': 'Нет аккаунта?',
    'auth.haveAccount': 'Уже есть аккаунт?',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.logout': 'Выйти',
    'auth.profile': 'Профиль',
    'auth.or': 'Или',
    'auth.signInWithGoogle': 'Войти через Google',
    'auth.signUpWithGoogle': 'Регистрация через Google',

    // Header
    'header.home': 'Главная',
    'header.bookings': 'Бронирования',
    'header.routes': 'Маршруты и цены',
    'header.timetable': 'Расписание',
    'header.myTickets': 'Мои билеты',
    'header.more': 'Больше',
    'header.legal': 'Правовая информация',
    'header.trust.safe': 'Безопасный транспорт',
    'header.trust.experience': '10+ лет опыта',
    'header.language': 'Язык',
    'header.currency': 'Валюта',
    
    // Common actions
    'common.viewRoutes': 'Посмотреть маршруты',
    'common.viewTimetable': 'Посмотреть расписание',
    'common.viewTickets': 'Посмотреть билеты',
    'common.searchRoutes': 'Поиск маршрутов',
    'common.allPrices': 'Все цены',
    'common.book': 'Забронировать',
    'common.search': 'Поиск',
    'common.cancel': 'Отменить',
    'common.save': 'Сохранить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.add': 'Добавить',
    'common.back': 'Назад',
    'common.next': 'Следующий',
    'common.previous': 'Предыдущий',
    'common.continue': 'Продолжить',
    
    // Hero Section
    'hero.title': 'Безопасные Путешествия по Европе',
    'hero.subtitle': 'Надежный международный транспорт с более чем 10-летним опытом',
    'hero.searchPlaceholder': 'Откуда вы едете?',
    'hero.searchButton': 'Найти Билеты',
    'hero.popularRoutes': 'Популярные Маршруты',
    'hero.routes': 'Маршруты',
    'hero.passengers': 'Пассажиры',
    'hero.support': 'Поддержка',
    'hero.secure': 'Безопасно',
    
    // Search Form
    'search.from': 'Откуда',
    'search.fromPlaceholder': 'Город отправления',
    'search.to': 'Куда',
    'search.toPlaceholder': 'Город назначения',
    'search.departure': 'Дата отправления',
    'search.return': 'Дата возвращения',
    'search.passengers': 'Пассажиры',
    'search.passenger': 'Пассажир',
    'search.baggage': 'Багаж',
    'search.bag': 'Мешок',
    'search.bags': 'Мешки',
    'search.oneWay': 'В одну сторону',
    'search.roundTrip': 'Туда-обратно',
    'search.searchTickets': 'Найти Билеты',
    'search.popularRoutes': 'Популярные Маршруты',
    'search.selectDate': 'Выберите дату',
    'search.selectPassengers': 'Выберите количество пассажиров',
    'search.selectBaggage': 'Выберите багаж',
    'search.swapCities': 'Поменять города',
    
    // Index Page
    'index.whatToDo': 'Что вы хотите сделать?',
    'index.chooseAction': 'Выберите основное действие, которое хотите выполнить. Все просто и понятно!',
    'index.bookTicket': 'Забронировать Билет',
    'index.bookTicketDesc': 'Забронируйте место в автобусе для вашей поездки',
    'index.readyBookNow': 'Забронировать Сейчас',
    'index.readyViewRoutes': 'Посмотреть Маршруты',
    'index.viewMyTickets': 'Мои Билеты',
    
    // Transport Routes
    'transport.title': 'Маршруты Транспорта',
    'transport.description': 'Откройте для себя и забронируйте автобусные маршруты по Европе с Starlines и партнерами InfoBus',
    'transport.home': 'Главная',
    'transport.routes': 'Маршруты Транспорта',
    'transport.busRoutes': 'Автобусные Маршруты',
    'transport.findJourney': 'Найдите и забронируйте идеальное путешествие по Европе',
    'transport.listView': 'Вид Списка',
    'transport.mapView': 'Вид Карты',
    'transport.searchPlaceholder': 'Поиск маршрутов, городов или операторов...',
    'transport.fromCity': 'Из Города',
    'transport.toCity': 'В Город',
    'transport.allCities': 'Все Города',
    'transport.operator': 'Оператор',
    'transport.allOperators': 'Все Операторы',
    'transport.priceInterval': 'Интервал Цен',
    'transport.selectPriceInterval': 'Выберите интервал цен',
    'transport.allPrices': 'Все цены',
    'transport.below80': 'До €80',
    'transport.80to100': '€80 - €100',
    'transport.100to150': '€100 - €150',
    'transport.above150': 'Свыше €150',
    'transport.showingRoutes': 'Показано {count} из {total} маршрутов',
    'transport.sortBy': 'Сортировать по:',
    'transport.departureTime': 'Время Отправления',
    'transport.priceLowToHigh': 'Цена (от низкой к высокой)',
    'transport.duration': 'Продолжительность',
    'transport.rating': 'Рейтинг',
    'transport.advancedFilters': 'Расширенные Фильтры',
    'transport.datePicker': 'Выбор Даты',
    'transport.reviews': 'отзывов',
    'transport.popular': 'Популярный',
    'transport.viewDetails': 'Посмотреть Детали',
    'transport.bookNow': 'Забронировать Сейчас',
    'transport.noRoutesFound': 'Маршруты не найдены',
    'transport.tryAdjusting': 'Попробуйте изменить критерии поиска или фильтры, чтобы найти доступные маршруты.',
    'transport.clearAllFilters': 'Очистить Все Фильтры',
    'transport.interactiveMapView': 'Интерактивный Вид Карты',
    'transport.mapViewDescription': 'Вид карты будет реализован здесь, показывая визуализацию маршрутов по Европе.',
    'transport.switchToListView': 'Переключиться на Вид Списка',
    'transport.cantFindRoute': 'Не можете найти нужный маршрут?',
    'transport.contactService': 'Свяжитесь с нашей службой поддержки, чтобы запросить индивидуальные маршруты или получить помощь с планами путешествий.',
    'transport.requestCustomRoute': 'Запросить Индивидуальный Маршрут',
    'transport.contactSupport': 'Связаться с Поддержкой',
    

    
    // Trip Details Page
    'tripDetails.loading': 'Загрузка деталей маршрута...',
    'tripDetails.error.routeNotFound': 'Маршрут не найден',
    'tripDetails.error.failedToLoad': 'Не удалось загрузить детали маршрута',
    'tripDetails.error.noRouteId': 'ID маршрута не предоставлен',
    'tripDetails.backToRoutes': 'Назад к Маршрутам',
    'tripDetails.backToSearch': 'Назад к Поиску',
    'tripDetails.bookNow': 'Забронировать Сейчас',
    'tripDetails.continueToCheckout': 'Продолжить к Оформлению',
    'tripDetails.selectYourFare': 'Выберите Ваш Тариф',
    'tripDetails.numberOfPassengers': 'Количество пассажиров',
    'tripDetails.farePerPerson': 'Тариф за человека',
    'tripDetails.serviceFee': 'Плата за обслуживание',
    'tripDetails.total': 'Итого',
    'tripDetails.journeyTimeline': 'Временная Линия Путешествия',
    'tripDetails.interactiveMapComingSoon': 'Интерактивная карта скоро',
    'tripDetails.fareRulesPolicies': 'Правила и Политика Тарифов',
    'tripDetails.baggageAllowance': 'Разрешенный Багаж',
    'tripDetails.changesCancellations': 'Изменения и Отмены',
    'tripDetails.refundPolicy': 'Политика Возврата',
    'tripDetails.handLuggage': 'Ручная кладь',
    'tripDetails.checkedBaggage': 'Зарегистрированный багаж',
    'tripDetails.oversizedItems': 'Крупногабаритные предметы',
    'tripDetails.extra': 'дополнительно',
    'tripDetails.freeChanges': 'Бесплатные изменения',
    'tripDetails.upTo2HoursBefore': 'До 2 часов до отправления',
    'tripDetails.cancellationFee': 'Плата за отмену',
    'tripDetails.before24h': 'За 24 часа',
    'tripDetails.sameDay': 'в тот же день',
    'tripDetails.noShow': 'Не явился',
    'tripDetails.ofFare': 'от тарифа',
    'tripDetails.departure': 'Отправление',
    'tripDetails.arrival': 'Прибытие',
    'tripDetails.dailyService': 'Ежедневный сервис',
    'tripDetails.reviews': 'отзывов',
    'tripDetails.standardSeat': 'Стандартное место',
    'tripDetails.basicAmenities': 'Базовые удобства',
    'tripDetails.premiumSeat': 'Премиум место',
    'tripDetails.extraLegroom': 'Дополнительное место для ног',
    'tripDetails.priorityBoarding': 'Приоритетная посадка',
    'tripDetails.refreshments': 'Освежающие напитки',
    'tripDetails.businessSeat': 'Бизнес место',
    'tripDetails.maximumComfort': 'Максимальный комфорт',
    'tripDetails.premiumAmenities': 'Премиум удобства',
    'tripDetails.flexibleChanges': 'Гибкие изменения',
    'tripDetails.flexible': 'Гибкий',
    'tripDetails.changeable': 'Изменяемый',
    'tripDetails.securePayment': 'Безопасная Оплата',
    'tripDetails.multiplePaymentMethods': 'Принимаются различные методы оплаты',
    
    // Timetable Page
    'timetable.title': 'Расписание Автобусов',
    'timetable.description': 'Просмотрите полное расписание для всех маршрутов Starlines. Фильтруйте по дате, оператору или направлению, чтобы найти идеальное путешествие.',
    'timetable.operator': 'Оператор',
    'timetable.direction': 'Направление',
    'timetable.viewMode': 'Режим Просмотра',
    'timetable.calendar': 'Календарь',
    'timetable.list': 'Список',
    'timetable.allOperators': 'Все операторы',
    'timetable.allDirections': 'Все направления',
    'timetable.today': 'Сегодня',
    'timetable.duration': 'Продолжительность',
    'timetable.stops': 'Остановки',
    'timetable.stop': 'остановка',
    'timetable.book': 'Забронировать',
    'timetable.bookNow': 'Забронировать Сейчас',
    'timetable.from': 'От',
    'timetable.noRoutesOperating': 'В это время маршруты не работают',
    'timetable.routesOperating': '{count} маршрутов работают {date}',
    'timetable.scheduleTitle': 'РАСПИСАНИЕ',
    'timetable.busSchedule': 'автобусов по маршруту',
    'timetable.routeTitle': 'Кишинёв (Республика Молдова) – Киев (Украина)',
    'timetable.arrivalTime': 'время прибытия',
    'timetable.stopDuration': 'время остановки',
    'timetable.departureTime': 'время отправления',
    'timetable.distanceFromStart': 'Расстояние км. от начальной остановки',
    'timetable.stopNames': 'НАЗВАНИЯ ОСТАНОВОК',
    'timetable.distanceBetweenStops': 'Расстояние км. между остановками',
    'timetable.directDirection': 'в прямом направлении',
    'timetable.reverseDirection': 'в обратном направлении',
    'timetable.directRoute': 'Кишинёв → Киев',
    'timetable.reverseRoute': 'Киев → Кишинёв',
    'timetable.arrivalTimeDesc': 'время прибытия на остановку',
    'timetable.stopDurationDesc': 'время остановки',
    'timetable.departureTimeDesc': 'время отправления с остановки',
    'timetable.distanceFromStartDesc': 'расстояние от начальной остановки',
    'timetable.distanceBetweenDesc': 'расстояние от предыдущей остановки',
    'timetable.importantInfo': 'Важная информация',
    'timetable.borderCrossing': 'Пункт пропуска',
    'timetable.busStation': 'Автовокзал',
    'timetable.busPark': 'Автопарк',
    'timetable.minutes': 'мин',
    'timetable.kilometers': 'км',
    
    // Station names
    'stations.kyivVydubychi': 'Киев АС «Выдубичи»',
    'stations.kyivCentral': 'Киев АС «Киев»',
    'stations.zhytomyr': 'Житомир',
    'stations.berdychiv': 'Бердичев АС',
    'stations.vinnytsia': 'Винница',
    'stations.mohylivPodilskyi': 'Могилёв-Подольский АС',
    'stations.mohylivBorderUkraine': 'АПП «Могилёв-Подольский»',
    'stations.atakiBorderMoldova': 'АПП «Атаки»',
    'stations.edinet': 'Единцы АС',
    'stations.balti': 'Бельцы АС',
    'stations.orhei': 'Оргеев АС',
    'stations.chisinauBusPark': 'Кишинёв АП',
    'stations.chisinauCentral': 'Кишинёв АС',
    
    // Station addresses
    'addresses.kyivVydubychi': 'дорога Набережно-Печерська, 10А',
    'addresses.kyivCentral': 'вул. С. Петлюри, 32',
    'addresses.zhytomyr': 'вул. Київська 93',
    'addresses.berdychiv': 'пл. Привокзальна 1-А',
    'addresses.vinnytsia': 'вул. Київська, 8',
    'addresses.mohylivPodilskyi': 'вул. Пушкінська 41',
    'addresses.edinet': 'вул. Индепенденцей, 227',
    'addresses.balti': 'вул. Штефана Великого, 2',
    'addresses.orhei': 'ул. Садовяну, 50',
    'addresses.chisinauBusPark': 'Bulevardul Dacia 80/3',
    'addresses.chisinauCentral': 'вул. Каля Мошилор, 2/1',
    
    // Days of the week
    'days.sunday': 'Воскресенье',
    'days.monday': 'Понедельник',
    'days.tuesday': 'Вторник',
    'days.wednesday': 'Среда',
    'days.thursday': 'Четверг',
    'days.friday': 'Пятница',
    'days.saturday': 'Суббота',
    
    'transport.from': 'Откуда',
    'transport.to': 'Куда',

    'index.viewRoutesDesc': 'Все доступные маршруты и цены',
    'index.timetable': 'Расписание',
    'index.timetableDesc': 'Расписание автобусов для всех маршрутов',
    'index.viewTimetable': 'Посмотреть Расписание',
    'index.trustSafe': 'Безопасный Транспорт',
    'index.trustSafeDesc': 'Современные автобусы со всеми стандартами безопасности',
    'index.trustExperience': '10+ Лет Опыта',
    'index.trustExperienceDesc': 'Надежная компания в международном транспорте',
    'index.trustSupport': 'Поддержка 24/7',
    'index.trustSupportDesc': 'Мы здесь, чтобы помочь вам в любое время',
    'index.trustSimple': 'Простое Бронирование',
    'index.trustSimpleDesc': 'Простой и быстрый процесс бронирования',
    'index.contactUs': 'Свяжитесь с Нами',
    'index.contactDesc': 'Позвоните нам для персональной помощи с бронированием',
    'index.phone': '+373 60 12 34 56',
    'index.workingHours': 'Понедельник - Пятница: 9:00 - 18:00',
    'index.viewAllContacts': 'Посмотреть все контакты',
    'index.faq': 'Часто Задаваемые Вопросы',
    'index.faqDesc': 'Найдите быстрые ответы на ваши вопросы',
    'index.howToBook': 'Как забронировать?',
    'index.canCancel': 'Могу ли я отменить билет?',
    'index.whatIfLate': 'Что делать, если я опоздал?',
    'index.viewAllQuestions': 'Посмотреть все вопросы',
    'index.readyToStart': 'Готовы Начать Путешествие?',
    'index.readyDesc': 'Забронируйте место в автобусе в несколько простых кликов. Процесс быстрый и безопасный!',
    
    // Quick Access Section
    'index.quickAccess': 'Быстрый доступ',
    'index.everythingYouNeed': 'Все что вам нужно',
    'index.quickAccessDesc': 'Быстрый доступ ко всем инструментам и информации, необходимой для безупречного путешествия со Starlines.',
    'index.searchRoutesDesc': 'Найдите и забронируйте идеальное путешествие на автобусе',
    'index.transportRoutesDesc': 'Посмотрите все доступные маршруты и направления',
    'index.myTicketsDesc': 'Доступ к вашим бронированиям и управление ими',
    'index.blogDesc': 'Советы по путешествиям, новости и путеводители по направлениям',
    'index.aboutDesc': 'Узнайте о Starlines и нашей миссии',
    'index.cantFindWhatYouNeed': 'Не можете найти то, что ищете?',
    'index.useSearchOrContact': 'Используйте наш поиск или свяжитесь с поддержкой',
    
    // Search Results
    'search.filters': 'Фильтры',
    'search.departureTime': 'Время отправления',
    'search.duration': 'Продолжительность (часы)',
    'search.price': 'Цена (€)',
    'search.amenities': 'Удобства',
    'search.operator': 'Оператор',
    'search.stops': 'Остановки',
    'search.allOperators': 'Все операторы',
    'search.anyStops': 'Любое количество остановок',
    'search.directOnly': 'Только прямые маршруты',
    'search.max1Stop': 'Максимум 1 остановка',
    'search.resetFilters': 'Сбросить фильтры',
    'search.recommended': 'Рекомендуемые',
    'search.priceLowToHigh': 'Цена: от низкой к высокой',
    'search.priceHighToLow': 'Цена: от высокой к низкой',
    'search.rating': 'Рейтинг',
    'search.routesFound': 'маршрутов найдено',
    'search.routeFound': 'маршрут найден',
    'search.noRoutesFound': 'Маршруты не найдены',
    'search.tryAdjusting': 'Попробуйте скорректировать фильтры или критерии поиска',
    'search.select': 'Выбрать',
    
    // Checkout Process
    'checkout.title': 'Оформление заказа',
    'checkout.back': 'Назад',
    'checkout.passenger': 'пассажир',
    'checkout.passengers': 'пассажиры',
    
    // Checkout Steps
    'checkout.step1.title': 'Пассажиры',
    'checkout.step1.desc': 'Введите данные пассажиров.',
    'checkout.step2.title': 'Контакт',
    'checkout.step2.desc': 'Ваша контактная информация.',
    'checkout.step3.title': 'Проверка',
    'checkout.step3.desc': 'Проверьте ваше бронирование.',
    'checkout.step4.title': 'Оплата',
    'checkout.step4.desc': 'Завершите оплату.',
    
    // Passenger Details
    'checkout.passengerDetails.title': 'Данные Пассажиров',
    'checkout.passengerDetails.desc': 'Пожалуйста, предоставьте данные для всех пассажиров',
    'checkout.passengerDetails.passenger': 'Пассажир',
    'checkout.passengerDetails.firstName': 'Имя',
    'checkout.passengerDetails.firstNamePlaceholder': 'Введите имя',
    'checkout.passengerDetails.lastName': 'Фамилия',
    'checkout.passengerDetails.lastNamePlaceholder': 'Введите фамилию',
    'checkout.passengerDetails.dateOfBirth': 'Дата рождения',
    'checkout.passengerDetails.dateOfBirthPlaceholder': 'дд.мм.гггг',
    'checkout.passengerDetails.nationality': 'Национальность',
    'checkout.passengerDetails.nationalityPlaceholder': 'Выберите национальность',
    'checkout.passengerDetails.documentType': 'Тип документа',
    'checkout.passengerDetails.documentType.passport': 'Паспорт',
    'checkout.passengerDetails.documentNumber': 'Номер документа',
    'checkout.passengerDetails.documentNumberPlaceholder': 'Введите номер документа',
    
    // Contact Information
    'checkout.contact.title': 'Контактная Информация',
    'checkout.contact.desc': 'Мы будем использовать эту информацию для отправки подтверждений бронирования и обновлений',
    'checkout.contact.email': 'Адрес электронной почты',
    'checkout.contact.emailPlaceholder': 'ваш.email@пример.com',
    'checkout.contact.phone': 'Номер телефона',
    'checkout.contact.phonePlaceholder': 'Введите номер телефона',
    'checkout.contact.verifyPhone': 'Проверить номер телефона',
    
    // Review Booking
    'checkout.review.title': 'Проверьте Ваше Бронирование',
    'checkout.review.desc': 'Пожалуйста, проверьте все детали перед продолжением к оплате.',
    'checkout.review.tripSummary.title': 'Сводка Поездки',
    'checkout.review.tripSummary.route': 'Маршрут',
    'checkout.review.tripSummary.date': 'Дата',
    'checkout.review.tripSummary.time': 'Время',
    'checkout.review.tripSummary.duration': 'Продолжительность',
    'checkout.review.tripSummary.fareType': 'Тип тарифа',
    'checkout.review.tripSummary.passengers': 'Пассажиры',
    'checkout.review.priceBreakdown.title': 'Детали Цены',
    'checkout.review.priceBreakdown.farePerPerson': 'Тариф за человека',
    'checkout.review.priceBreakdown.passengers': 'Пассажиры',
    'checkout.review.priceBreakdown.serviceFee': 'Плата за обслуживание',
    'checkout.review.priceBreakdown.total': 'Итого',
    'checkout.review.promoCode.title': 'Промо-код',
    'checkout.review.promoCode.placeholder': 'Введите промо-код',
    'checkout.review.promoCode.apply': 'Применить',
    'checkout.review.promoCode.discount': 'Промо-скидка',
    'checkout.review.promoCode.success': '✓ Промо-код успешно применен!',
    'checkout.review.promoCode.error': '✗ Неверный промо-код',
    
    // Payment
    'checkout.payment.ready.title': 'Готов к Оплате',
    'checkout.payment.ready.desc': 'Вы почти готовы! Нажмите кнопку ниже, чтобы перейти к безопасной оплате',
    'checkout.payment.secure': 'Безопасная оплата через Stripe',
    'checkout.payment.totalAmount': 'Общая сумма к оплате',
    'checkout.payment.previous': 'Назад',
    'checkout.payment.proceed': 'Перейти к Оплате',
    
    // Validation Messages
    'checkout.validation.firstNameRequired': 'Имя обязательно',
    'checkout.validation.lastNameRequired': 'Фамилия обязательна',
    'checkout.validation.dateOfBirthRequired': 'Дата рождения обязательна',
    'checkout.validation.nationalityRequired': 'Национальность обязательна',
    'checkout.validation.documentNumberRequired': 'Номер документа обязателен',
    'checkout.validation.emailRequired': 'Email обязателен',
    'checkout.validation.phoneRequired': 'Номер телефона обязателен',
    'checkout.validation.completeAllFields': 'Пожалуйста, заполните все обязательные поля перед продолжением',
    
    // Terms and Conditions
    'checkout.terms.agree': 'Я согласен с условиями и положениями',
    'checkout.terms.description': 'Отмечая этот флажок, вы соглашаетесь с',
    'checkout.terms.termsOfService': 'Условиями обслуживания',
    'checkout.terms.and': 'и',
    'checkout.terms.privacyPolicy': 'Политикой конфиденциальности',
    
    // Months
    'months.january': 'Январь',
    'months.february': 'Февраль',
    'months.march': 'Март',
    'months.april': 'Апрель',
    'months.may': 'Май',
    'months.june': 'Июнь',
    'months.july': 'Июль',
    'months.august': 'Август',
    'months.september': 'Сентябрь',
    'months.october': 'Октябрь',
    'months.november': 'Ноябрь',
    'months.december': 'Декабрь',
    
    // Fare Types
    'fareType.economy': 'Экономный',
    'fareType.standard': 'Стандартный',
    'fareType.premium': 'Премиум',
    'fareType.business': 'Бизнес',
    
    // Features
    'features.title': 'Почему Выбрать Starlines?',
    'features.subtitle': 'Наш более чем 10-летний опыт в международном транспорте',
    'features.safeTransport': 'Безопасный Транспорт',
    'features.safeDesc': 'Современный флот с профессиональными водителями',
    'features.experience': 'Большой Опыт',
    'features.experienceDesc': '10+ лет в международном транспорте',
    'features.support': 'Поддержка 24/7',
    'features.supportDesc': 'Наша команда всегда доступна',
    'features.easyBooking': 'Простое Бронирование',
    'features.easyDesc': 'Простой процесс онлайн-бронирования',
    'features.securePayments': 'Безопасные Платежи',
    'features.securePaymentsDesc': 'SSL-зашифрованные транзакции с множественными вариантами оплаты',
    'features.flexibleReturns': 'Гибкие Возвраты',
    'features.flexibleReturnsDesc': 'Простые политики отмены и возврата',
    'features.destinations': 'Множественные Направления',
    'features.destinationsDesc': 'Полное покрытие Восточной Европы',
    'features.modernAmenities': 'Современные Удобства',
    'features.modernAmenitiesDesc': 'WiFi, USB-порты и удобные сиденья',
    'features.paymentOptions': 'Множественные Варианты Оплаты',
    'features.paymentOptionsDesc': 'Кредитные карты, цифровые кошельки и банковские переводы',
    'features.mobileApp': 'Мобильное Приложение',
    'features.mobileAppDesc': 'Бронируйте и управляйте поездками с телефона',
    'features.multilingual': 'Многоязычная Поддержка',
    'features.multilingualDesc': 'Помощь на румынском, русском и английском языках',
    
    // Popular Routes
    'routes.title': 'Популярные Направления',
    'routes.subtitle': 'Откройте для себя наши самые любимые маршруты',
    'routes.viewAll': 'Посмотреть Все Маршруты',
    'routes.perPerson': 'с человека',
    'routes.viewDetails': 'Посмотреть Детали',
    'routes.readyToExplore': 'Готовы Исследовать?',
    'routes.findPerfectRoute': 'Найдите свой идеальный маршрут сегодня',
    'routes.browseAll': 'Просмотреть Все Маршруты',
    
    // Booking
    'booking.passengers': 'Пассажиры',
    'booking.departure': 'Отправление',
    'booking.arrival': 'Прибытие',
    'booking.duration': 'Продолжительность',
    'booking.operator': 'Оператор',
    'booking.price': 'Цена',
    'booking.total': 'Итого',
    'booking.serviceFee': 'Плата за обслуживание',
    
    // About
    'about.title': 'О Нас',
    'about.subtitle': 'Наша история успеха в международном транспорте',
    'about.mission': 'Наша Миссия',
    'about.vision': 'Наше Видение',
    'about.values': 'Наши Ценности',
    
    // About Page Content
    'about.ourStory': 'Наша История',
    'about.connectingDreams': 'Соединяя Мечты,',
    'about.oneJourneyAtTime': 'По Одному Путешествию за Раз',
    'about.heroDescription': 'Уже более 15 лет Starlines был больше, чем просто автобусная компания. Мы мост между людьми и возможностями, соединяющий сообщества по всей Восточной Европе с надежностью, комфортом и заботой.',
    'about.missionStatement': '"Демократизировать качественный транспорт, предоставляя безопасные, комфортные и надежные автобусные поездки для всех в Восточной Европе, одновременно строя мосты между сообществами и способствуя устойчивому росту."',
    
    // Stats Section
    'about.yearsOfService': 'Лет Обслуживания',
    'about.buildingTrust': 'Строим доверие с 2009 года',
    'about.routesCovered': 'Охваченные Маршруты',
    'about.acrossCountries': 'В 12 странах',
    'about.happyCustomers': 'Довольные Клиенты',
    'about.satisfiedTravelers': 'Удовлетворенные путешественники',
    'about.safetyRecord': 'Рекорд Безопасности',
    'about.perfectSafetyScore': 'Идеальный показатель безопасности',
    
    // Values Section
    'about.whatDrivesUs': 'Что Нас Движет',
    'about.valuesDescription': 'Наши ценности — это не просто слова на стене — это принципы, которые направляют каждое наше решение и каждое действие.',
    'about.safetyAboveAll': 'Безопасность Превыше Всего',
    'about.safetyDescription': 'Мы верим, что безопасность — это не просто приоритет, а наша основа. Каждое путешествие начинается с строгих протоколов безопасности, обслуживания транспортных средств последнего поколения и высококвалифицированных водителей, которые ставят ваше благополучие превыше всего остального.',
    'about.passengerCentric': 'Ориентированные на Пассажира',
    'about.passengerDescription': 'Каждое решение, которое мы принимаем, руководствуется одним вопросом: «Как это улучшает опыт наших пассажиров?» От удобных сидений до беспроблемного бронирования, мы ставим вас в центр всего, что мы делаем.',
    'about.reliabilityPromise': 'Обещание Надежности',
    'about.reliabilityDescription': 'Когда вы выбираете Starlines, вы выбираете надежность. Наша 99,9% пунктуальность — это не просто статистика — это наше обязательство доставить вас туда, где вам нужно быть, когда вам нужно быть там.',
    'about.innovationDriven': 'Движимые Инновациями',
    'about.innovationDescription': 'Мы не просто идем в ногу с технологиями — мы прокладываем путь. От оптимизации маршрутов с помощью ИИ до экологически чистых транспортных средств, мы постоянно раздвигаем границы, чтобы создать будущее транспорта.',
    'about.sustainabilityFirst': 'Устойчивость Прежде Всего',
    'about.sustainabilityDescription': 'Наша приверженность окружающей среде выходит за рамки соблюдения требований. Мы активно сокращаем наш углеродный след через электрические автобусы, возобновляемую энергию и устойчивые практики, которые защищают нашу планету для будущих поколений.',
    'about.communityImpact': 'Влияние на Сообщество',
    'about.communityDescription': 'Мы больше, чем транспортная компания — мы мост между сообществами. Соединяя людей и места, мы помогаем строить более сильные, более связанные общества по всей Восточной Европе.',
    
    // Team Section
    'about.mindsBehindheMagic': 'Умы За Магией',
    'about.teamDescription': 'Познакомьтесь с страстными лидерами, которые превращают наше видение в реальность, внедряя инновации и совершенство во всем, что мы делаем.',
    'about.ceoFounder': 'Генеральный директор и основатель',
    'about.mihaiBio': 'Визионер-предприниматель с более чем 25-летним опытом в транспорте, Михай начал Starlines с простой мечтой: сделать качественные автобусные поездки доступными для всех в Восточной Европе. Его страсть к инновациям и обслуживанию клиентов движет нашу компанию вперед.',
    'about.coo': 'Операционный директор',
    'about.elenaBio': 'Елена привносит военную точность в наши операции. С опытом в логистике и страстью к эффективности, она обеспечивает, что каждое путешествие Starlines работает как часы, поддерживая нашу репутацию надежности.',
    'about.cco': 'Директор по работе с клиентами',
    'about.alexandruBio': 'Александру верит, что исключительное обслуживание клиентов — это форма искусства. Он построил нашу команду клиентского опыта с нуля, создав культуру, где каждый пассажир чувствует себя ценным и услышанным.',
    'about.cto': 'Технический директор',
    'about.mariaBio': 'Мария — наш цифровой архитектор, трансформирующий способ взаимодействия людей с транспортом. От нашего отмеченного наградами приложения до оптимизации маршрутов с помощью ИИ, она делает путешествия умнее, быстрее и приятнее.',
    
    // Expertise labels
    'about.strategicVision': 'Стратегическое Видение',
    'about.industryLeadership': 'Лидерство в Отрасли',
    'about.customerExperience': 'Клиентский Опыт',
    'about.operationsExcellence': 'Операционное Совершенство',
    'about.logistics': 'Логистика',
    'about.qualityControl': 'Контроль Качества',
    'about.teamBuilding': 'Построение Команды',
    'about.serviceInnovation': 'Инновации в Сервисе',
    'about.digitalTransformation': 'Цифровая Трансформация',
    'about.aiMachineLearning': 'ИИ и Машинное Обучение',
    'about.productDevelopment': 'Разработка Продуктов',
    
    // Timeline Section
    'about.journeyThroughTime': 'Наше Путешествие во Времени',
    'about.timelineDescription': 'Каждая веха рассказывает историю роста, инноваций и непоколебимой приверженности нашим пассажирам и сообществам.',
    'about.dreamBegins': 'Мечта Начинается',
    'about.dreamDescription': 'Starlines родился из простого наблюдения: качественные автобусные поездки в Восточной Европе были либо слишком дорогими, либо слишком ненадежными. Мы начали с 3 автобусов и большой мечтой.',
    'about.dreamImpact': '3 маршрута, 3 автобуса, безграничные амбиции',
    'about.breakingBorders': 'Преодоление Границ',
    'about.bordersDescription': 'Наша первая международная экспансия доказала, что качество не знает границ. Мы соединили Молдову с Румынией и Украиной, показав, что отличный сервис превосходит границы.',
    'about.bordersImpact': 'Более 50 маршрутов в 3 странах',
    'about.digitalRevolution': 'Цифровая Революция',
    'about.digitalDescription': 'Мы запустили нашу первую онлайн-платформу, сделав бронирование простым как несколько кликов. Это было не просто обновление — это было полное переосмысление того, как люди бронируют поездки.',
    'about.digitalImpact': 'Первая онлайн-платформа бронирования в регионе',
    'about.europeanExpansion': 'Европейская Экспансия',
    'about.expansionDescription': 'Наша сеть выросла, чтобы охватить сердце Восточной Европы. От Балтики до Черного моря, Starlines стал синонимом надежных трансграничных поездок.',
    'about.expansionImpact': 'Более 200 маршрутов в 8 странах',
    'about.greenRevolution': 'Зеленая Революция',
    'about.greenDescription': 'Мы представили наши первые электрические автобусы и запустили программы компенсации углерода. Устойчивость — это не просто хороший бизнес — это наша ответственность перед будущими поколениями.',
    'about.greenImpact': 'Первый парк электрических автобусов в регионе',
    'about.industryLeadershipTitle': 'Лидерство в Отрасли',
    'about.leadershipDescription': 'Сегодня Starlines стоит как самое надежное имя в автобусном транспорте Восточной Европы. Но мы не почиваем на лаврах — мы строим транспортную сеть завтрашнего дня.',
    'about.leadershipImpact': 'Более 300 маршрутов, более 2 миллионов довольных клиентов',
    
    // Fun Facts Section
    'about.didYouKnow': 'Знали ли Вы?',
    'about.factsDescription': 'Несколько увлекательных фактов о Starlines, которые делают нас уникальными',
    'about.earthTrips': 'Наши автобусы проезжают эквивалент 15 поездок вокруг Земли каждый день',
    'about.coffeeServed': 'Мы подали кофе более чем 500 000 пассажиров в наших премиальных залах',
    'about.languagesSpoken': 'Наши водители коллективно говорят на 8 разных языках',
    'about.familiesReunited': 'Мы помогли воссоединить более 2 000 семей через наши доступные варианты путешествий',
    
    // CTA Section
    'about.readyToBePartOfStory': 'Готовы Стать Частью Нашей Истории?',
    'about.ctaDescription': 'Присоединяйтесь к миллионам довольных путешественников, которые обнаружили, что с Starlines каждое путешествие — это приключение, ожидающее своего часа.',
    'about.startYourJourney': 'Начните Свое Путешествие',
    'about.learnMore': 'Узнать Больше',
    
    // Contact
    'contact.title': 'Свяжитесь с Нами',
    'contact.subtitle': 'Мы здесь, чтобы помочь вам',
    'contact.phone': 'Телефон',
    'contact.email': 'Электронная почта',
    'contact.address': 'Адрес',
    'contact.hours': 'Часы работы',
    
    // Footer
    'footer.transport': 'Транспорт',
    'footer.info': 'Информация',
    'footer.support': 'Поддержка',
    'footer.company': 'Компания',
    'footer.legal': 'Правовая информация',
    'footer.rights': 'Все права защищены',
    
    // Legal Pages
    'legal.terms': 'Условия и Положения',
    'legal.termsDesc': 'Условия использования',
    'legal.privacy': 'Политика Конфиденциальности',
    'legal.privacyDesc': 'Защита персональных данных',
    'legal.refund': 'Политика Возврата',
    'legal.refundDesc': 'Условия возврата',
    
    // Blog
    'blog.title': 'Блог',
    'blog.subtitle': 'Статьи и путеводители',
    
    // Blog Page Content
    'blog.travelBlog': 'Блог о Путешествиях',
    'blog.discoverTravelTips': 'Откройте для себя советы по путешествиям, путеводители по направлениям и идеи, которые сделают ваши путешествия незабываемыми.',
    'blog.searchArticles': 'Поиск статей...',
    'blog.allCategories': 'Все категории',
    'blog.filterByTags': 'Фильтр по Тегам',
    'blog.clearFilters': 'Очистить Фильтры',
    'blog.articlesFound': 'статей найдено',
    'blog.articleFound': 'статья найдена',
    'blog.noArticlesFound': 'Статьи не найдены',
    'blog.tryAdjusting': 'Попробуйте изменить критерии поиска или фильтры',
    'blog.clearAllFilters': 'Очистить Все Фильтры',
    'blog.readMore': 'Читать Далее',
    'blog.blogImage': 'Изображение Блога',
    'blog.featured': 'Рекомендуемые',
    
    // Blog Categories
    'blog.category.all': 'Все',
    'blog.category.travelGuides': 'Путеводители',
    'blog.category.travelTips': 'Советы по Путешествиям',
    'blog.category.budgetTravel': 'Бюджетные Путешествия',
    'blog.category.travelPlanning': 'Планирование Путешествий',
    
    // Blog Tags
    'blog.tag.easternEurope': 'Восточная Европа',
    'blog.tag.culture': 'Культура',
    'blog.tag.history': 'История',
    'blog.tag.travelTips': 'Советы по Путешествиям',
    'blog.tag.comfort': 'Комфорт',
    'blog.tag.longDistance': 'Дальние Расстояния',
    'blog.tag.romania': 'Румыния',
    'blog.tag.busNetwork': 'Автобусная Сеть',
    'blog.tag.featured': 'Рекомендуемые',
    
    // Blog Articles
    'blog.article.top10Destinations.title': 'Топ-10 Обязательных для Посещения Мест в Восточной Европе',
    'blog.article.top10Destinations.excerpt': 'Откройте для себя скрытые жемчужины и культурные сокровища Восточной Европы. От исторических городов до захватывающих дух пейзажей, эти места оставят вас без слов.',
    'blog.article.top10Destinations.author': 'Мария Попеску',
    'blog.article.top10Destinations.readTime': '8 мин чтения',
    
    'blog.article.comfortableTravel.title': 'Как Комфортно Путешествовать на Дальние Расстояния на Автобусе',
    'blog.article.comfortableTravel.excerpt': 'Основные советы и хитрости для комфортного и приятного путешествия на автобусе на дальние расстояния. Узнайте о сиденьях, развлечениях и комфорте.',
    'blog.article.comfortableTravel.author': 'Александру Ионеску',
    'blog.article.comfortableTravel.readTime': '6 мин чтения',
    
    'blog.article.romaniaGuide.title': 'Полное Руководство по Путешествию на Автобусе в Румынии',
    'blog.article.romaniaGuide.excerpt': 'Все, что нужно знать о путешествии на автобусе в Румынии. От бронирования билетов до понимания сети и поиска лучших предложений.',
    'blog.article.romaniaGuide.author': 'Елена Димитреску',
    'blog.article.romaniaGuide.readTime': '10 мин чтения',
    
    'blog.article.bestTimeToVisit.title': 'Лучшее Время для Посещения Восточной Европы',
    'blog.article.bestTimeToVisit.excerpt': 'Откройте для себя, когда лучше всего посетить Восточную Европу. От туристических сезонов до культурных событий, наш гид поможет вам спланировать идеальное путешествие.',
    'blog.article.bestTimeToVisit.author': 'Михай Попеску',
    'blog.article.bestTimeToVisit.readTime': '7 мин чтения',
    
    'blog.article.budgetTravel.title': 'Как Путешествовать по Восточной Европе с Небольшим Бюджетом',
    'blog.article.budgetTravel.excerpt': 'Практические советы по доступному путешествию по Восточной Европе. От размещения до транспорта и еды, экономьте деньги, не жертвуя опытом.',
    'blog.article.budgetTravel.author': 'Ана Василеску',
    'blog.article.budgetTravel.readTime': '9 мин чтения',
    
    'blog.article.localCuisine.title': 'Гастрономический Гид по Восточной Европе',
    'blog.article.localCuisine.excerpt': 'Исследуйте аутентичные вкусы Восточной Европы. От румынских сармале до польских пирожков, откройте кулинарные традиции, которые определяют этот увлекательный регион.',
    'blog.article.localCuisine.author': 'Диана Мунтяну',
    'blog.article.localCuisine.readTime': '11 мин чтения',
    
    'blog.article.safetyTips.title': 'Советы по Безопасности для Путешествия на Автобусе',
    'blog.article.safetyTips.excerpt': 'Обеспечьте свою безопасность во время путешествия на автобусе. От хранения багажа до взаимодействия с незнакомцами, эти советы помогут вам оставаться в безопасности.',
    'blog.article.safetyTips.author': 'Кристиан Думитру',
    'blog.article.safetyTips.readTime': '5 мин чтения',
    
    'blog.article.winterTravel.title': 'Путешествие по Восточной Европе в Холодный Сезон',
    'blog.article.winterTravel.excerpt': 'Откройте для себя красоту Восточной Европы зимой. От замерзших городов до горнолыжных курортов, наш гид поможет вам насладиться магией холодного сезона.',
    'blog.article.winterTravel.author': 'Лаура Ионеску',
    'blog.article.winterTravel.readTime': '8 мин чтения',
    
    'blog.article.culturalEtiquette.title': 'Культурный Этикет в Восточной Европе',
    'blog.article.culturalEtiquette.excerpt': 'Научитесь ориентироваться в культурных нюансах Восточной Европы. От приветствий до поведения за столом, эти советы помогут вам интегрироваться с местными жителями.',
    'blog.article.culturalEtiquette.author': 'Влад Попа',
    'blog.article.culturalEtiquette.readTime': '6 мин чтения',
    
    // Blog Modal
    'blog.articleBy': 'Статья от',
    'blog.close': 'Закрыть',
    
    // FAQ
    'faq.title': 'Часто Задаваемые Вопросы',
    'faq.subtitle': 'Найдите ответы на самые распространенные вопросы о бронировании, путешествиях и использовании наших услуг. Не можете найти то, что ищете? Свяжитесь с нашей командой поддержки.',
    'faq.searchPlaceholder': 'Поиск вопросов и ответов...',
    'faq.allCategories': 'Все Категории',
    'faq.clearFilters': 'Очистить Фильтры',
    'faq.questionsFound': 'вопросов найдено',
    'faq.questionFound': 'вопрос найден',
    'faq.noQuestionsFound': 'Вопросы не найдены',
    'faq.tryAdjusting': 'Попробуйте изменить критерии поиска или просмотреть все категории',
    'faq.clearAllFilters': 'Очистить Все Фильтры',
    'faq.stillHaveQuestions': 'Все еще есть вопросы?',
    'faq.supportDescription': 'Наша команда поддержки клиентов готова помочь вам 24/7',
    'faq.contactSupport': 'Связаться с Поддержкой',
    'faq.liveChat': 'Живой Чат',
    
    // FAQ Categories
    'faq.category.bookingTickets': 'Бронирование и Билеты',
    'faq.category.travelRoutes': 'Путешествия и Маршруты',
    'faq.category.schedulesTimetables': 'Расписания и Обращения',
    'faq.category.safetySecurity': 'Безопасность и Защита',
    'faq.category.customerService': 'Обслуживание Клиентов',
    'faq.category.pricingDiscounts': 'Цены и Скидки',
    
    // FAQ Questions and Answers
    'faq.booking.howToBook.question': 'Как забронировать билет на автобус?',
    'faq.booking.howToBook.answer': 'Вы можете забронировать билеты через наш веб-сайт, мобильное приложение или позвонив в нашу службу поддержки клиентов. Просто введите города отправления и назначения, выберите дату поездки, выберите предпочтительный маршрут и завершите процесс оплаты.',
    'faq.booking.changeCancel.question': 'Могу ли я изменить или отменить свой билет?',
    'faq.booking.changeCancel.answer': 'Да, вы можете изменить или отменить билет до 2 часов до отправления. Изменения зависят от доступности и могут повлечь дополнительные сборы. Отмены, сделанные более чем за 24 часа до отправления, обычно подлежат возврату.',
    'faq.booking.paymentMethods.question': 'Какие методы оплаты вы принимаете?',
    'faq.booking.paymentMethods.answer': 'Мы принимаем все основные кредитные карты (Visa, MasterCard, American Express), дебетовые карты и цифровые кошельки, такие как PayPal. Мы также поддерживаем банковские переводы для предварительных бронирований.',
    'faq.booking.printTicket.question': 'Нужно ли печатать мой билет?',
    'faq.booking.printTicket.answer': 'Нет, вам не нужно печатать билет. Вы можете показать цифровой билет на мобильном устройстве, или мы можем отправить вам SMS с ссылкой на бронирование. Однако печать рекомендуется в качестве резервной копии.',
    
    'faq.travel.arriveEarly.question': 'Как рано я должен прибыть на автобусную станцию?',
    'faq.travel.arriveEarly.answer': 'Мы рекомендуем прибывать как минимум за 30 минут до отправления для внутренних маршрутов и за 45 минут для международных маршрутов. Это позволяет время для регистрации, обработки багажа и процедур посадки.',
    'faq.travel.missBus.question': 'Что происходит, если я пропущу автобус?',
    'faq.travel.missBus.answer': 'Если вы пропустили автобус, немедленно свяжитесь с нашей службой поддержки клиентов. В зависимости от доступности и типа вашего билета, мы можем перебронировать вас на следующий доступный рейс, хотя могут применяться дополнительные сборы.',
    'faq.travel.luggageRestrictions.question': 'Есть ли ограничения на багаж?',
    'faq.travel.luggageRestrictions.answer': 'Каждому пассажиру разрешается одна ручная кладь (макс. 10 кг) и один зарегистрированный багаж (макс. 20 кг). Дополнительный багаж может быть перевезен за дополнительную плату. Крупногабаритные предметы должны быть организованы заранее.',
    'faq.travel.pets.question': 'Могу ли я взять домашних животных на борт?',
    'faq.travel.pets.answer': 'Маленькие домашние животные в переносках разрешены на большинстве маршрутов, но должны быть предварительно забронированы. Служебные животные путешествуют бесплатно. Пожалуйста, проверьте конкретные политики маршрутов, так как некоторые международные маршруты могут иметь ограничения.',
    
    'faq.schedules.frequency.question': 'Как часто ходят автобусы?',
    'faq.schedules.frequency.answer': 'Частота варьируется в зависимости от маршрута. Популярные маршруты, такие как Кишинев-Бухарест, могут иметь несколько ежедневных отправлений, в то время как менее частые маршруты могут ходить один или два раза в день. Проверьте наше расписание для конкретных графиков.',
    'faq.schedules.weekendsHolidays.question': 'Расписания отличаются в выходные и праздники?',
    'faq.schedules.weekendsHolidays.answer': 'Да, некоторые маршруты имеют сниженную частоту в выходные и праздники. Мы рекомендуем проверить наше праздничное расписание или связаться со службой поддержки клиентов для получения самой актуальной информации.',
    'faq.schedules.journeyTime.question': 'Сколько обычно занимают поездки?',
    'faq.schedules.journeyTime.answer': 'Время в пути варьируется в зависимости от расстояния и маршрута. Например, от Кишинева до Бухареста занимает примерно 8-10 часов, в то время как более короткие внутренние маршруты могут занять 2-4 часа. Проверьте детали отдельных маршрутов для точного времени.',
    
    'faq.safety.measures.question': 'Какие меры безопасности приняты?',
    'faq.safety.measures.answer': 'Все наши автобусы регулярно проверяются и обслуживаются. Водители профессионально обучены и лицензированы. У нас есть системы мониторинга 24/7 и реагирования на чрезвычайные ситуации. Ремни безопасности доступны на всех местах.',
    'faq.safety.insurance.question': 'Включена ли страховка путешествия?',
    'faq.safety.insurance.answer': 'Базовая страховка путешествия включена во все билеты. Это покрывает медицинские чрезвычайные ситуации и отмены поездок. Дополнительная комплексная страховка может быть приобретена во время бронирования для расширенного покрытия.',
    'faq.safety.emergency.question': 'Что мне делать в случае чрезвычайной ситуации?',
    'faq.safety.emergency.answer': 'В случае чрезвычайной ситуации немедленно свяжитесь с нашей круглосуточной горячей линией экстренной помощи. Все автобусы оборудованы аварийными выходами и аптечками первой помощи. Водители обучены процедурам экстренной помощи и могут связаться с экстренными службами.',
    
    'faq.service.contact.question': 'Как я могу связаться со службой поддержки клиентов?',
    'faq.service.contact.answer': 'Вы можете связаться с нами через несколько каналов: круглосуточная телефонная поддержка, живой чат на нашем веб-сайте, поддержка по электронной почте или через наше мобильное приложение. У нас также есть столы обслуживания клиентов на основных автобусных станциях.',
    'faq.service.hours.question': 'Какие часы работы службы поддержки клиентов?',
    'faq.service.hours.answer': 'Наша служба поддержки клиентов доступна 24/7 для срочных вопросов. Общие вопросы обрабатываются с 6:00 до 22:00 ежедневно. Экстренная поддержка всегда доступна.',
    'faq.service.complaints.question': 'Как подать жалобу?',
    'faq.service.complaints.answer': 'Вы можете подать жалобы через форму обратной связи на нашем веб-сайте, написать нам напрямую по электронной почте или поговорить с представителем службы поддержки клиентов. Мы стремимся ответить на все жалобы в течение 48 часов.',
    
    'faq.pricing.studentDiscounts.question': 'Есть ли скидки для студентов или пенсионеров?',
    'faq.pricing.studentDiscounts.answer': 'Да, мы предлагаем скидки для студентов (с действительным удостоверением), пенсионеров (65+) и детей до 12 лет. У нас также есть специальные тарифы для групповых бронирований от 10 или более пассажиров.',
    'faq.pricing.loyaltyPrograms.question': 'Предлагаете ли вы программы лояльности?',
    'faq.pricing.loyaltyPrograms.answer': 'Да, наша программа Starlines Rewards предлагает баллы за каждую поездку, которые можно обменять на скидки при будущих бронированиях. Участники также получают доступ к эксклюзивным предложениям и ранним возможностям бронирования.',
    'faq.pricing.seasonalPromotions.question': 'Есть ли сезонные акции?',
    'faq.pricing.seasonalPromotions.answer': 'Да, мы регулярно проводим сезонные акции и специальные предложения. К ним относятся летние туристические предложения, праздничные пакеты и скидки в последнюю минуту. Подпишитесь на нашу рассылку, чтобы быть в курсе.',
    
    // Blog Article Content
    'blog.article.top10Destinations.content': `
      <h2>Откройте для себя Восточную Европу</h2>
      <p>Восточная Европа - это увлекательный регион, который предлагает уникальный опыт путешествий, сочетая богатую историю с захватывающими пейзажами и яркой культурой.</p>
      
      <h3>1. Прага, Чешская Республика</h3>
      <p>Город тысячи башен очарует вас готической и барочной архитектурой. Пражский Град и Карлов мост - это лишь несколько достопримечательностей, которые делают Прагу обязательным местом для посещения.</p>
      
      <h3>2. Будапешт, Венгрия</h3>
      <p>Венгерская столица предлагает двойной опыт: Буда с средневековым замком и Пешт с архитектурой в стиле модерн. Не пропустите круиз по Дунаю на закате.</p>
      
      <h3>3. Краков, Польша</h3>
      <p>Королевский город Польши перенесет вас во времени со средневековой площадью и замком Вавель. Еврейский квартал Казимеж добавляет глубокое культурное измерение.</p>
      
      <h3>4. Бухарест, Румыния</h3>
      <p>Столица Румынии предлагает увлекательную комбинацию коммунистической и классической архитектуры. Дворец Парламента и исторический центр - это только начало.</p>
      
      <h3>5. Братислава, Словакия</h3>
      <p>Словацкая столица, меньшая и более интимная, предлагает аутентичный опыт со средневековым замком и живописным историческим центром.</p>
      
      <h3>6. Любляна, Словения</h3>
      <p>Зеленый город Европы удивит вас архитектурой в стиле модерн и расслабленной атмосферой. Люблянский замок предлагает захватывающие панорамные виды.</p>
      
      <h3>7. Загреб, Хорватия</h3>
      <p>Хорватская столица предлагает изысканный городской опыт со средневековым центром и кварталом в стиле модерн.</p>
      
      <h3>8. София, Болгария</h3>
      <p>Город с 7000-летней историей предлагает увлекательную комбинацию римских, византийских и османских влияний.</p>
      
      <h3>9. Таллинн, Эстония</h3>
      <p>Эстонская столица предлагает аутентичный средневековый опыт с хорошо сохранившимся историческим центром и ганзейской атмосферой.</p>
      
      <h3>10. Рига, Латвия</h3>
      <p>Город с самой высокой концентрацией архитектуры в стиле модерн в Европе предлагает исключительный визуальный опыт.</p>
      
      <h2>Советы по Путешествию</h2>
      <p>Чтобы сделать ваше путешествие по Восточной Европе запоминающимся, я рекомендую:</p>
      <ul>
        <li>Планировать заранее, но оставлять место для спонтанности</li>
        <li>Изучить несколько слов на местном языке</li>
        <li>Исследовать как туристические достопримечательности, так и менее известные места</li>
        <li>Наслаждаться аутентичной местной кухней</li>
        <li>Взаимодействовать с местными жителями для более глубокого опыта</li>
      </ul>
    `,
    
    'blog.article.comfortableTravel.content': `
      <h2>Комфортное Путешествие на Дальние Расстояния</h2>
      <p>Путешествие на автобусе на дальние расстояния не должно быть неприятным опытом. С небольшим планированием и несколькими хитростями вы можете превратить 8-12-часовое путешествие в комфортный и даже приятный опыт.</p>
      
      <h3>1. Выбор Места</h3>
      <p>Попробуйте выбрать место у окна для видов и большего личного пространства. Передние места предлагают меньше вибрации, а задние могут быть более шумными.</p>
      
      <h3>2. Основы Комфорта</h3>
      <p>Не забудьте взять с собой:</p>
      <ul>
        <li>Дорожную подушку для поддержки шеи</li>
        <li>Легкое одеяло для тепла</li>
        <li>Солнечные очки для яркого света</li>
      </ul>
      
      <h3>3. Развлечения</h3>
      <p>Я рекомендую заранее скачать:</p>
      <ul>
        <li>Интересные подкасты</li>
        <li>Расслабляющую музыку</li>
        <li>Электронную или физическую книгу</li>
        <li>Офлайн игры на телефоне</li>
      </ul>
      
      <h3>4. Еда и Гидратация</h3>
      <p>Я рекомендую взять с собой:</p>
      <ul>
        <li>Здоровые закуски (орехи, сухофрукты)</li>
        <li>Многоразовую бутылку воды</li>
        <li>Легкие сэндвичи</li>
      </ul>
      
      <h3>5. Регулярные Перерывы</h3>
      <p>Пользуйтесь перерывами, чтобы:</p>
      <ul>
        <li>Растянуться и сделать легкие упражнения</li>
        <li>Подышать свежим воздухом</li>
        <li>Пообщаться с другими путешественниками</li>
      </ul>
    `,
    
    'blog.article.romaniaGuide.content': `
      <h2>Полное Руководство по Путешествию на Автобусе в Румынии</h2>
      <p>Румыния предлагает обширную сеть автобусного транспорта, которая соединяет все важные города и многие деревни. Вот все, что вам нужно знать для беспроблемного путешествия.</p>
      
      <h3>Транспортная Сеть</h3>
      <p>Румыния имеет хорошо развитую сеть автобусного транспорта с компаниями, такими как:</p>
      <ul>
        <li>Autogari.ro - основная платформа для бронирования</li>
        <li>Региональные и национальные компании</li>
        <li>Международные маршруты в соседние страны</li>
      </ul>
      
      <h3>Бронирование Билетов</h3>
      <p>Для бронирования билетов:</p>
      <ul>
        <li>Используйте онлайн-платформы (Autogari.ro, FlixBus)</li>
        <li>Бронируйте как минимум за 24 часа</li>
        <li>Проверяйте расписание и продолжительность путешествия</li>
      </ul>
      
      <h3>Популярные Направления</h3>
      <p>Самые популярные маршруты в Румынии:</p>
      <ul>
        <li>Бухарест - Брашов (2-3 часа)</li>
        <li>Бухарест - Сибиу (4-5 часов)</li>
        <li>Бухарест - Клуж-Напока (6-7 часов)</li>
        <li>Бухарест - Тимишоара (7-8 часов)</li>
      </ul>
      
      <h3>Практические Советы</h3>
      <p>Для беспроблемного путешествия:</p>
      <ul>
        <li>Приходите на автовокзал за 30 минут до отправления</li>
        <li>Проверяйте платформу отправления</li>
        <li>Следите за багажом</li>
        <li>Держите билет под рукой</li>
      </ul>
    `,
    
    'blog.article.bestTimeToVisit.content': `
      <h2>Лучшее Время для Посещения Восточной Европы</h2>
      <p>Восточная Европа предлагает уникальные впечатления в каждый сезон, но определенные периоды более подходят для определенных типов путешествий.</p>
      
      <h3>Весна (Март - Май)</h3>
      <p>Весна идеальна для:</p>
      <ul>
        <li>Посещения парков и цветущих садов</li>
        <li>Более низких цен на размещение</li>
        <li>Приятной погоды для исследования</li>
        <li>Весенних фестивалей</li>
      </ul>
      
      <h3>Лето (Июнь - Август)</h3>
      <p>Лето предлагает:</p>
      <ul>
        <li>Самую теплую и стабильную погоду</li>
        <li>Фестивали и культурные события</li>
        <li>Доступ к горным достопримечательностям</li>
        <li>Самые длинные дни для исследования</li>
      </ul>
      
      <h3>Осень (Сентябрь - Ноябрь)</h3>
      <p>Осень идеальна для:</p>
      <ul>
        <li>Спектрально окрашенной листвы</li>
        <li>Более низких цен после туристического сезона</li>
        <li>Приятной погоды для путешествий</li>
        <li>Осенних фестивалей</li>
      </ul>
      
      <h3>Зима (Декабрь - Февраль)</h3>
      <p>Зима предлагает:</p>
      <ul>
        <li>Волшебные рождественские рынки</li>
        <li>Доступные горнолыжные курорты</li>
        <li>Уникальные зимние впечатления</li>
        <li>Очень низкие цены на размещение</li>
      </ul>
    `,
    
    'blog.article.budgetTravel.content': `
      <h2>Как Путешествовать по Восточной Европе с Небольшим Бюджетом</h2>
      <p>Восточная Европа - один из самых доступных регионов Европы для бюджетных путешествий. Вот как сэкономить, не жертвуя впечатлениями.</p>
      
      <h3>Размещение</h3>
      <p>Для дешевого размещения:</p>
      <ul>
        <li>Хостелы (5-15 EUR/ночь)</li>
        <li>Квартиры через Airbnb (20-40 EUR/ночь)</li>
        <li>Небольшие местные отели (25-50 EUR/ночь)</li>
        <li>Couchsurfing (бесплатно)</li>
      </ul>
      
      <h3>Транспорт</h3>
      <p>Для дешевого транспорта:</p>
      <ul>
        <li>Местные автобусы (0.5-2 EUR)</li>
        <li>Метро в больших городах (0.5-1 EUR)</li>
        <li>Аренда велосипедов (5-10 EUR/день)</li>
        <li>Ходьба пешком (бесплатно)</li>
      </ul>
      
      <h3>Еда</h3>
      <p>Для дешевой еды:</p>
      <ul>
        <li>Местные рестораны (5-10 EUR/еда)</li>
        <li>Местные рынки для ингредиентов</li>
        <li>Уличная еда (2-5 EUR)</li>
        <li>Супермаркеты для закусок</li>
      </ul>
      
      <h3>Активности</h3>
      <p>Для бесплатных или дешевых активностей:</p>
      <ul>
        <li>Бесплатные музеи в первый день месяца</li>
        <li>Парки и общественные сады</li>
        <li>Прогулки с бесплатным гидом</li>
        <li>Местные бесплатные фестивали</li>
      </ul>
    `,
    
    'blog.article.localCuisine.content': `
      <h2>Гастрономический Гид по Восточной Европе</h2>
      <p>Кухня Восточной Европы - это увлекательное слияние кулинарных влияний, от славянских традиций до османских и австро-венгерских влияний.</p>
      
      <h3>Румыния</h3>
      <p>Румынская кухня предлагает:</p>
      <ul>
        <li>Сармале - виноградные листья, обернутые вокруг мяса и риса</li>
        <li>Мамалыга с сыром и сметаной</li>
        <li>Чорба де буртэ - традиционный суп</li>
        <li>Папанаши - пончики со сметаной и вареньем</li>
      </ul>
      
      <h3>Польша</h3>
      <p>Польская кухня предлагает:</p>
      <ul>
        <li>Пельмени - клецки, наполненные различными ингредиентами</li>
        <li>Бигос - традиционное рагу с капустой и мясом</li>
        <li>Журек - суп из ферментированной ржи</li>
        <li>Пацки - традиционные польские пончики</li>
      </ul>
      
      <h3>Венгрия</h3>
      <p>Венгерская кухня предлагает:</p>
      <ul>
        <li>Гуляш - традиционное мясное рагу</li>
        <li>Лангош - жареный хлеб с чесноком</li>
        <li>Chimney cake - пирог в форме корзины</li>
        <li>Токай - традиционное сладкое вино</li>
      </ul>
      
      <h3>Чешская Республика</h3>
      <p>Чешская кухня предлагает:</p>
      <ul>
        <li>Свичкова - говядина с соусом из сметаны</li>
        <li>Гуляш - традиционное рагу</li>
        <li>Трдельник - традиционный десерт</li>
        <li>Пилснер - традиционное пиво</li>
      </ul>
    `,
    
    'blog.article.safetyTips.content': `
      <h2>Советы по Безопасности для Путешествия на Автобусе</h2>
      <p>Путешествие на автобусе в целом безопасно, но важно следовать нескольким основным правилам для обеспечения вашей безопасности.</p>
      
      <h3>Перед Путешествием</h3>
      <p>Перед отъездом:</p>
      <ul>
        <li>Проверьте репутацию транспортной компании</li>
        <li>Читайте отзывы других путешественников</li>
        <li>Проверьте, есть ли у автобуса безопасность</li>
        <li>Зарегистрируйте багаж, если необходимо</li>
      </ul>
      
      <h3>Во Время Путешествия</h3>
      <p>Во время путешествия:</p>
      <ul>
        <li>Держите багаж рядом</li>
        <li>Не оставляйте ценные предметы без присмотра</li>
        <li>Будьте внимательны к остановкам для перерывов</li>
        <li>Не принимайте еду или напитки от незнакомцев</li>
      </ul>
      
      <h3>В Пункте Назначения</h3>
      <p>В пункте назначения:</p>
      <ul>
        <li>Проверьте багаж перед отъездом</li>
        <li>Будьте осторожны с неавторизованными такси</li>
        <li>Используйте официальный общественный транспорт</li>
        <li>Держите ценные предметы в безопасности</li>
      </ul>
      
      <h3>В Случае Чрезвычайной Ситуации</h3>
      <p>В случае чрезвычайной ситуации:</p>
      <ul>
        <li>Водитель отвечает за безопасность пассажиров</li>
        <li>Следуйте инструкциям персонала</li>
        <li>Держите номера экстренных служб под рукой</li>
        <li>Оставайтесь спокойными и помогайте другим, если можете</li>
      </ul>
    `,
    
    'blog.article.winterTravel.content': `
      <h2>Путешествие по Восточной Европе в Холодный Сезон</h2>
      <p>Зима в Восточной Европе предлагает совершенно другой опыт с замерзшими городами, волшебными рождественскими рынками и уникальными возможностями для исследования.</p>
      
      <h3>Подготовка к Зиме</h3>
      <p>Для успешного зимнего путешествия:</p>
      <ul>
        <li>Одевайтесь слоями для тепла</li>
        <li>Используйте водонепроницаемую обувь</li>
        <li>Не забудьте перчатки, шарфы и шапки</li>
        <li>Проверьте прогноз погоды заранее</li>
      </ul>
      
      <h3>Популярные Зимние Направления</h3>
      <p>Самые популярные зимние направления:</p>
      <ul>
        <li>Бухарест - волшебные рождественские рынки</li>
        <li>Братислава - замерзший исторический центр</li>
        <li>Прага - средневековая зимняя атмосфера</li>
        <li>Будапешт - термальные ванны в холодные дни</li>
      </ul>
      
      <h3>Зимние Активности</h3>
      <p>Популярные зимние активности:</p>
      <ul>
        <li>Катание на лыжах в курортах Карпат</li>
        <li>Катание на коньках по замерзшим озерам</li>
        <li>Посещение рождественских рынков</li>
        <li>Термальные ванны для согрева</li>
      </ul>
      
      <h3>Практические Советы</h3>
      <p>Для беспроблемного зимнего путешествия:</p>
      <ul>
        <li>Бронируйте размещение заранее</li>
        <li>Проверяйте расписание транспорта</li>
        <li>Будьте осторожны с льдом на тротуарах</li>
        <li>Пользуйтесь более низкими ценами</li>
      </ul>
    `,
    
    'blog.article.culturalEtiquette.content': `
      <h2>Культурный Этикет в Восточной Европе</h2>
      <p>Понимание культурного этикета необходимо для успешного опыта путешествий в Восточной Европе. Вот полное руководство.</p>
      
      <h3>Приветствия</h3>
      <p>Для приветствий:</p>
      <ul>
        <li>В Румынии: "Bună ziua" (формально) или "Salut" (неформально)</li>
        <li>В Польше: "Dzień dobry" (формально) или "Cześć" (неформально)</li>
        <li>В Венгрии: "Jó napot" (формально) или "Szia" (неформально)</li>
        <li>В Чешской Республике: "Dobrý den" (формально) или "Ahoj" (неформально)</li>
      </ul>
      
      <h3>За Столом</h3>
      <p>Для поведения за столом:</p>
      <ul>
        <li>Ждите приглашения к столу</li>
        <li>Не начинайте есть до хозяина</li>
        <li>Сделайте тост перед первым глотком</li>
        <li>Не оставляйте еду на тарелке</li>
      </ul>
      
      <h3>В Общественных Местах</h3>
      <p>Для поведения в общественных местах:</p>
      <ul>
        <li>Будьте уважительны к пожилым людям</li>
        <li>Не курите в закрытых общественных местах</li>
        <li>Будьте сдержанны с фотографиями</li>
        <li>Соблюдайте местные правила</li>
      </ul>
      
      <h3>Социальное Взаимодействие</h3>
      <p>Для социального взаимодействия:</p>
      <ul>
        <li>Будьте честны и прямолинейны</li>
        <li>Не избегайте сложных тем</li>
        <li>Уважайте политические мнения</li>
        <li>Будьте любопытны к местной культуре</li>
      </ul>
    `,
    
    // Admin
    'admin.title': 'Панель Администратора',
    'admin.subtitle': 'Управление маршрутами и администрирование',
    
    // Forms
    'form.firstName': 'Имя',
    'form.lastName': 'Фамилия',
    'form.email': 'Электронная почта',
    'form.phone': 'Телефон',
    'form.password': 'Пароль',
    'form.confirmPassword': 'Подтвердите Пароль',
    'form.required': 'Обязательно',
    'form.optional': 'Необязательно',
    
    // My Tickets
    'myTickets.title': 'Мои Билеты',
    'myTickets.subtitle': 'Найдите ваши билеты, скачайте PDF и управляйте бронированиями',
    'myTickets.lookupTab': 'Найти Билет',
    'myTickets.accountTab': 'Мой Аккаунт',
    'myTickets.findTicket': 'Найдите Ваш Билет',
    'myTickets.orderNumber': 'Номер Заказа',
    'myTickets.orderNumberPlaceholder': 'например, STL-2024-001',
    'myTickets.securityCode': 'Код Безопасности',
    'myTickets.securityCodePlaceholder': 'Введите код безопасности',
    'myTickets.findTicketButton': 'Найти Билет',
    'myTickets.searching': 'Поиск...',
    'myTickets.helpText1': 'Нет ваших данных?',
    'myTickets.helpText2': 'Проверьте письмо подтверждения или обратитесь в службу поддержки',
    'myTickets.ticketDetails': 'Детали Билета',
    'myTickets.enterOrderDetails': 'Введите детали заказа, чтобы найти билет',
    'myTickets.route': 'Маршрут',
    'myTickets.date': 'Дата',
    'myTickets.time': 'Время',
    'myTickets.passengers': 'Пассажиры',
    'myTickets.totalPaid': 'Всего Оплачено',
    'myTickets.downloadPDF': 'Скачать PDF',
    'myTickets.showQR': 'Показать QR',
    'myTickets.email': 'Email',
    'myTickets.pdfDownloaded': 'PDF Скачан',
    'myTickets.pdfDownloadedDesc': 'Билет успешно скачан',
    'myTickets.emailSent': 'Email Отправлен',
    'myTickets.emailSentDesc': 'Билет отправлен по email',
    'myTickets.qrCodeTitle': 'QR-код Вашего Билета',
    'myTickets.qrCodeDescription': 'Покажите этот QR-код водителю при посадке',
    'myTickets.qrCodePlaceholder': 'QR-код Заглушка',
    'myTickets.order': 'Заказ',
    'myTickets.accountInformation': 'Информация об Аккаунте',
    'myTickets.signInMessage': 'Войдите, чтобы получить доступ к вашим билетам',
    'myTickets.createAccountMessage': 'Создайте аккаунт или войдите, чтобы просмотреть все ваши бронирования и билеты',
    'myTickets.signIn': 'Войти',
    'myTickets.createAccount': 'Создать Аккаунт',
    'myTickets.recentBookings': 'Недавние Бронирования',
    'myTickets.passenger': 'пассажир',
    'myTickets.quickActions': 'Быстрые Действия',
    'myTickets.downloadAllTickets': 'Скачать Все Билеты',
    'myTickets.emailAllTickets': 'Отправить Все Билеты по Email',
    'myTickets.viewCalendar': 'Посмотреть Календарь',
    'myTickets.bookNewTrip': 'Забронировать Новую Поездку',
    'myTickets.missingInformation': 'Отсутствует Информация',
    'myTickets.enterBothFields': 'Пожалуйста, введите номер заказа и код безопасности.',
    'myTickets.ticketFound': 'Билет Найден',
    'myTickets.ticketRetrieved': 'Ваш билет был успешно найден.',
    'myTickets.ticketNotFound': 'Билет Не Найден',
    'myTickets.checkDetails': 'Пожалуйста, проверьте номер заказа и код безопасности.',
    'myTickets.copied': 'Скопировано!',
    'myTickets.copiedToClipboard': 'было скопировано в буфер обмена.',
    'myTickets.signInSuccess': 'Успешный Вход',
    'myTickets.welcomeBack': 'Добро пожаловать обратно!',
    'myTickets.signInError': 'Ошибка Входа',
    'myTickets.invalidCredentials': 'Неверный email или пароль.',
    'myTickets.signUpSuccess': 'Аккаунт Успешно Создан',
    'myTickets.accountCreated': 'Ваш аккаунт был создан!',
    'myTickets.signUpError': 'Ошибка Создания Аккаунта',
    'myTickets.passwordMismatch': 'Пароли не совпадают.',
    'myTickets.fillAllFields': 'Пожалуйста, заполните все поля.',
    'myTickets.authError': 'Ошибка Аутентификации',
    'myTickets.tryAgain': 'Попробуйте снова.',
    'myTickets.signOutSuccess': 'Успешный Выход',
    'myTickets.signedOut': 'Вы успешно вышли из аккаунта.',
    'myTickets.welcomeMessage': 'Добро пожаловать в ваш аккаунт!',
    'myTickets.accountActive': 'Ваш аккаунт активен и вы можете получить доступ ко всем функциям.',
    'myTickets.signOut': 'Выйти',
    'myTickets.signInDescription': 'Войдите, чтобы получить доступ к вашим билетам.',
    'myTickets.signUpDescription': 'Создайте новый аккаунт, чтобы начать пользоваться нашими услугами.',
    'myTickets.firstName': 'Имя',
    'myTickets.lastName': 'Фамилия',
    'myTickets.password': 'Пароль',
    'myTickets.confirmPassword': 'Подтвердите Пароль',
    'myTickets.processing': 'Обработка...',
    'myTickets.cancel': 'Отмена',
    
    // Contacts
    'contacts.title': 'Контакты',
    'contacts.description': 'Мы здесь, чтобы помочь вам спланировать идеальное путешествие',
    'contacts.breadcrumbHome': 'Главная',
    'contacts.breadcrumbContacts': 'Контакты',
    
    // Contact Information Section
    'contacts.weAreHereToHelp.title': 'Мы здесь, чтобы помочь вам',
    'contacts.weAreHereToHelp.description': 'Наша команда специалистов готова предоставить вам персональную помощь в планировании идеального путешествия по Европе.',
    
    // Contact Cards
    'contacts.email.title': 'Электронная почта',
    'contacts.email.description': 'Для общих вопросов и помощи',
    'contacts.phone.title': 'Телефон',
    'contacts.phone.description': 'Телефонная поддержка в рабочее время',
    'contacts.schedule.title': 'Расписание',
    'contacts.schedule.weekdays': 'Понедельник - Пятница: 9:00 - 18:00',
    'contacts.schedule.saturday': 'Суббота: 9:00 - 14:00',
    
    // Contact Form Section
    'contacts.form.title': 'Комплексная Контактная Форма',
    'contacts.form.description': 'Заполните форму ниже, чтобы получить персональное предложение для вашего путешествия по Европе.',
    
    // Success Message
    'contacts.success.title': 'Спасибо за сообщение!',
    'contacts.success.description': 'Мы получили ваш запрос и свяжемся с вами в ближайшее время для обсуждения вашего путешествия.',
    'contacts.success.responseTime': 'Ответ в течение 24 часов',
    
    // Form Sections
    'contacts.form.personalInfo.title': 'Личная Информация и Детали Путешествия',
    'contacts.form.personalInfo.section': 'Личная Информация',
    'contacts.form.travelDetails.section': 'Детали Путешествия',
    'contacts.form.passengers.section': 'Пассажиры',
    'contacts.form.contactInfo.section': 'Контактная Информация',
    'contacts.form.additionalMessage.section': 'Дополнительное Сообщение',
    
    // Form Fields
    'contacts.form.firstName.label': 'Имя',
    'contacts.form.firstName.placeholder': 'Введите ваше имя',
    'contacts.form.lastName.label': 'Фамилия',
    'contacts.form.lastName.placeholder': 'Введите вашу фамилию',
    'contacts.form.destination.label': 'Направление',
    'contacts.form.destination.placeholder': 'Выберите направление',
    'contacts.form.destination.other': 'Другое направление',
    'contacts.form.destination.otherPlaceholder': 'Укажите направление',
    'contacts.form.date.label': 'Дата Путешествия',
    'contacts.form.adults.label': 'Взрослые',
    'contacts.form.minors.label': 'Дети',
    'contacts.form.minorAge.label': 'Возраст Ребенка',
    'contacts.form.minorAge.placeholder': 'Например: 12 лет',
    'contacts.form.phone.label': 'Номер Телефона',
    'contacts.form.phone.placeholder': '+373 60 12 34 56',
    'contacts.form.email.label': 'Электронная почта',
    'contacts.form.email.placeholder': 'пример@email.com',
    'contacts.form.message.label': 'Сообщение (необязательно)',
    'contacts.form.message.placeholder': 'Опишите особые требования, предпочтения по размещению или другие важные детали для вашего путешествия...',
    
    // Form Validation Messages
    'contacts.form.validation.firstName.required': 'Имя обязательно',
    'contacts.form.validation.lastName.required': 'Фамилия обязательна',
    'contacts.form.validation.destination.required': 'Направление обязательно',
    'contacts.form.validation.date.required': 'Дата обязательна',
    'contacts.form.validation.minorAge.required': 'Возраст ребенка обязателен, когда путешествует ребенок',
    'contacts.form.validation.phone.required': 'Номер телефона обязателен',
    'contacts.form.validation.phone.invalid': 'Номер телефона недействителен (формат: +373XXXXXXXX или 0XXXXXXXX)',
    'contacts.form.validation.email.required': 'Электронная почта обязательна',
    'contacts.form.validation.email.invalid': 'Электронная почта недействительна',
    
    // Form Actions
    'contacts.form.submit.sending': 'Отправляется...',
    'contacts.form.submit.send': 'Отправить Запрос',
    
    // Company Information
    'contacts.company.about.title': 'О Starlines',
    'contacts.company.about.description': 'Мы - международная транспортная компания с более чем 10-летним опытом организации автобусных путешествий по Европе. Мы гордимся качественным сервисом и вниманием к деталям для каждого пассажира.',
    'contacts.company.registered': 'Компания зарегистрирована в Республике Молдова',
    'contacts.company.routes': 'Маршруты в 15+ европейских странах',
    'contacts.company.passengers': 'Более 50,000 довольных пассажиров',
    
    // Why Choose Us
    'contacts.company.whyChoose.title': 'Почему стоит выбрать Starlines?',
    'contacts.company.competitivePrices.title': 'Конкурентные Цены',
    'contacts.company.competitivePrices.description': 'Специальные предложения и скидки для групп',
    'contacts.company.personalizedService.title': 'Персональный Сервис',
    'contacts.company.personalizedService.description': 'Индивидуальная помощь для каждого путешествия',
    'contacts.company.guaranteedSafety.title': 'Гарантированная Безопасность',
    'contacts.company.guaranteedSafety.description': 'Современные автобусы со всеми стандартами безопасности',
    'contacts.company.support24.title': 'Поддержка 24/7',
    'contacts.company.support24.description': 'Телефонная помощь во время путешествия',
    
    // Popular Destinations
    'contacts.popularDestinations.berlin': 'Берлин, Германия',
    'contacts.popularDestinations.munich': 'Мюнхен, Германия',
    'contacts.popularDestinations.frankfurt': 'Франкфурт, Германия',
    'contacts.popularDestinations.vienna': 'Вена, Австрия',
    'contacts.popularDestinations.warsaw': 'Варшава, Польша',
    'contacts.popularDestinations.prague': 'Прага, Чехия',
    'contacts.popularDestinations.bucharest': 'Бухарест, Румыния',
    'contacts.popularDestinations.istanbul': 'Стамбул, Турция',
    
    // Terms of Service
    'terms.title': 'Условия использования',
    'terms.subtitle': 'Пожалуйста, внимательно прочитайте эти условия перед использованием наших услуг. Используя Starlines, вы соглашаетесь соблюдать и быть связанными этими условиями.',
    'terms.lastUpdated': 'Последнее обновление: 1 января 2024',
    'terms.version': 'Версия 2.1',
    'terms.quickNavigation': 'Быстрая навигация',
    'terms.questionsAboutTerms': 'Вопросы о наших условиях?',
    'terms.legalTeamHelp': 'Наша юридическая команда готова помочь разъяснить любые вопросы, которые у вас могут возникнуть по поводу этих условий.',
    'terms.contactLegal': 'Свяжитесь с нами по адресу',
    'terms.orCall': 'или позвоните',
    
    // Terms Sections
    'terms.section1.title': '1. Принятие условий',
    'terms.section1.content': 'Получая доступ к веб-сайту Starlines, мобильному приложению или услугам, вы подтверждаете, что прочитали, поняли и соглашаетесь соблюдать эти Условия использования. Если вы не согласны с этими условиями, пожалуйста, не используйте наши услуги.',
    
    'terms.section2.title': '2. Описание услуг',
    'terms.section2.content': 'Starlines предоставляет услуги автобусного транспорта в Восточной Европе. Наши услуги включают онлайн-бронирование билетов, информацию о маршрутах, поддержку клиентов и связанные туристические услуги. Мы оставляем за собой право изменять, приостанавливать или прекращать любой аспект наших услуг в любое время.',
    
    'terms.section3.title': '3. Бронирование и оплата',
    'terms.section3.content': 'Все бронирования подлежат наличию и подтверждению. Оплата должна быть завершена во время бронирования. Мы принимаем основные кредитные карты, дебетовые карты и другие способы оплаты, отображаемые во время оформления заказа. Цены могут быть изменены без предварительного уведомления до подтверждения оплаты.',
    
    'terms.section4.title': '4. Билеты и путешествие',
    'terms.section4.content': 'Для путешествия требуется действительное удостоверение личности. Пассажиры должны прибыть в пункт отправления как минимум за 30 минут до запланированного отправления. Билеты не подлежат передаче, если не указано иное. Потерянные или украденные билеты не могут быть заменены без надлежащей документации.',
    
    'terms.section5.title': '5. Отмена и возврат средств',
    'terms.section5.content': 'Отмены, сделанные более чем за 24 часа до отправления, имеют право на возврат средств за вычетом комиссий за обработку. Отмены в течение 24 часов до отправления могут не иметь права на возврат средств. Неявки не имеют права на возврат средств. Возврат средств обрабатывается в течение 7-10 рабочих дней.',
    
    'terms.section6.title': '6. Багаж и личные вещи',
    'terms.section6.content': 'Каждому пассажиру разрешается одна ручная кладь (максимум 10 кг) и один зарегистрированный багаж (максимум 20 кг). За избыточный вес или дополнительные сумки взимаются дополнительные сборы за багаж. Starlines не несет ответственности за потерянные, поврежденные или украденные личные вещи, если это не вызвано нашей небрежностью.',
    
    'terms.section7.title': '7. Поведение пассажиров',
    'terms.section7.content': 'Пассажиры должны соблюдать все правила безопасности и инструкции экипажа. Нарушительное, оскорбительное или опасное поведение может привести к удалению из транспортного средства без возврата средств. Курение, употребление алкоголя и запрещенных веществ запрещено на всех транспортных средствах.',
    
    'terms.section8.title': '8. Ограничение ответственности',
    'terms.section8.content': 'Ответственность Starlines ограничена в пределах, разрешенных законом. Мы не несем ответственности за задержки, вызванные погодными условиями, дорожным движением, механическими проблемами или другими обстоятельствами, не зависящими от нас. Максимальная ответственность по любому иску ограничена ценой оплаченного билета.',
    
    'terms.section9.title': '9. Конфиденциальность и защита данных',
    'terms.section9.content': 'Мы собираем и обрабатываем персональные данные в соответствии с нашей Политикой конфиденциальности и применимыми законами о защите данных. Используя наши услуги, вы соглашаетесь на сбор и использование вашей информации, как описано в нашей Политике конфиденциальности.',
    
    'terms.section10.title': '10. Изменения в условиях',
    'terms.section10.content': 'Starlines оставляет за собой право изменять эти Условия использования в любое время. Изменения будут размещены на нашем веб-сайте и вступят в силу немедленно. Продолжение использования наших услуг после изменений означает принятие измененных условий.',
    
    'terms.section11.title': '11. Применимое право',
    'terms.section11.content': 'Эти Условия использования регулируются законами Молдовы. Любые споры, возникающие из этих условий или наших услуг, должны разрешаться в судах Молдовы. Если какое-либо положение окажется неисполнимым, оставшиеся положения остаются в полной силе.',
    
    'terms.section12.title': '12. Контактная информация',
    'terms.section12.content': 'По вопросам об этих Условиях использования, пожалуйста, свяжитесь с нами по адресу legal@starlines.md или позвоните в нашу службу поддержки клиентов по телефону +373 22 123 456. Наш юридический отдел доступен с понедельника по пятницу с 9:00 до 18:00.',
    
    // Privacy Policy
    'privacy.title': 'Политика конфиденциальности',
    'privacy.subtitle': 'Мы ценим вашу конфиденциальность и стремимся защищать ваши персональные данные. Эта политика объясняет, как мы собираем, используем и защищаем вашу информацию.',
    'privacy.lastUpdated': 'Последнее обновление: 1 января 2024',
    'privacy.gdprCompliant': 'Соответствует GDPR',
    'privacy.typesOfData': 'Типы данных, которые мы собираем',
    'privacy.quickNavigation': 'Быстрая навигация',
    'privacy.exerciseYourRights': 'Осуществите ваши права на конфиденциальность',
    'privacy.rightsDescription': 'У вас есть контроль над вашими персональными данными. Свяжитесь с нами, чтобы осуществить любое из этих прав:',
    'privacy.contactDPO': 'Свяжитесь с нашим Специалистом по защите данных по адресу',
    'privacy.orCall': 'или позвоните',
    
    // Data Types
    'privacy.personalInformation': 'Персональная информация',
    'privacy.paymentInformation': 'Информация об оплате',
    'privacy.travelInformation': 'Информация о путешествии',
    'privacy.technicalInformation': 'Техническая информация',
    'privacy.name': 'Имя',
    'privacy.emailAddress': 'Адрес электронной почты',
    'privacy.phoneNumber': 'Номер телефона',
    'privacy.dateOfBirth': 'Дата рождения',
    'privacy.creditCardDetails': 'Детали кредитной карты',
    'privacy.billingAddress': 'Адрес для выставления счетов',
    'privacy.paymentHistory': 'История платежей',
    'privacy.bookingHistory': 'История бронирований',
    'privacy.travelPreferences': 'Предпочтения в путешествии',
    'privacy.specialRequirements': 'Особые требования',
    'privacy.ipAddress': 'IP-адрес',
    'privacy.browserType': 'Тип браузера',
    'privacy.deviceInformation': 'Информация об устройстве',
    'privacy.usageAnalytics': 'Аналитика использования',
    
    // Privacy Rights
    'privacy.accessData': 'Получить доступ к вашим данным',
    'privacy.rectifyInaccuracies': 'Исправить неточности',
    'privacy.eraseData': 'Удалить ваши данные',
    'privacy.restrictProcessing': 'Ограничить обработку',
    'privacy.dataPortability': 'Переносимость данных',
    'privacy.objectToProcessing': 'Возразить против обработки',
    'privacy.withdrawConsent': 'Отозвать согласие',
    'privacy.fileComplaint': 'Подать жалобу',
    
    // Privacy Sections
    'privacy.section1.title': '1. Введение',
    'privacy.section1.content': 'Starlines ("мы," "наш," или "нас") стремится защищать вашу конфиденциальность и персональные данные. Эта Политика конфиденциальности объясняет, как мы собираем, используем, обрабатываем и защищаем вашу информацию, когда вы используете наш веб-сайт, мобильное приложение и услуги. Мы соблюдаем применимые законы о защите данных, включая GDPR.',
    
    'privacy.section2.title': '2. Информация, которую мы собираем',
    'privacy.section2.content': 'Мы собираем информацию, которую вы предоставляете напрямую (имя, электронная почта, телефон, детали оплаты), информацию, собираемую автоматически (IP-адрес, тип браузера, информация об устройстве, данные об использовании), и информацию от третьих сторон (процессоры платежей, платформы социальных сетей, если вы решите подключиться).',
    
    'privacy.section3.title': '3. Как мы используем вашу информацию',
    'privacy.section3.content': 'Мы используем вашу информацию для обработки бронирований и платежей, предоставления поддержки клиентам, отправки подтверждений бронирования и обновлений о путешествии, улучшения наших услуг, соблюдения юридических обязательств, предотвращения мошенничества и обеспечения безопасности, а также отправки маркетинговых сообщений (с вашего согласия).',
    
    'privacy.section4.title': '4. Обмен и раскрытие информации',
    'privacy.section4.content': 'Мы не продаем вашу персональную информацию. Мы можем делиться вашей информацией с поставщиками услуг (процессоры платежей, ИТ-поддержка), деловыми партнерами (операторы автобусов), юридическими органами, когда это требуется по закону, и в случае передачи бизнеса (слияния, приобретения).',
    
    'privacy.section5.title': '5. Безопасность данных',
    'privacy.section5.content': 'Мы реализуем соответствующие технические и организационные меры для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения. Это включает шифрование, защищенные серверы, контроль доступа и регулярные аудиты безопасности.',
    
    'privacy.section6.title': '6. Хранение данных',
    'privacy.section6.content': 'Мы храним ваши персональные данные только столько времени, сколько необходимо для целей, описанных в этой политике, или столько, сколько требуется по закону. Данные о бронировании обычно хранятся в течение 7 лет для бухгалтерских и юридических целей. Маркетинговые данные хранятся до тех пор, пока вы не отзовете согласие.',
    
    'privacy.section7.title': '7. Ваши права',
    'privacy.section7.content': 'В соответствии с GDPR и другими применимыми законами, у вас есть право на доступ, исправление, удаление, ограничение обработки, переносимость данных, возражение против обработки и отзыв согласия. Вы можете осуществить эти права, связавшись с нами по адресу privacy@starlines.md.',
    
    'privacy.section8.title': '8. Файлы cookie и отслеживание',
    'privacy.section8.content': 'Мы используем файлы cookie и аналогичные технологии для улучшения вашего опыта, анализа использования и предоставления персонализированного контента. Вы можете контролировать настройки файлов cookie через настройки вашего браузера. См. нашу Политику в отношении файлов cookie для подробной информации о файлах cookie, которые мы используем.',
    
    'privacy.section9.title': '9. Международная передача данных',
    'privacy.section9.content': 'Ваши данные могут быть переданы и обработаны в странах за пределами вашего места жительства. Мы обеспечиваем наличие соответствующих гарантий, включая решения о достаточности, стандартные договорные условия или другие юридически одобренные механизмы.',
    
    'privacy.section10.title': '10. Конфиденциальность детей',
    'privacy.section10.content': 'Наши услуги не предназначены для детей младше 16 лет. Мы не собираем сознательно персональную информацию от детей младше 16 лет. Если мы узнаем, что собрали такую информацию, мы немедленно удалим ее.',
    
    'privacy.section11.title': '11. Изменения в Политике конфиденциальности',
    'privacy.section11.content': 'Мы можем периодически обновлять эту Политику конфиденциальности. Мы уведомим вас о существенных изменениях по электронной почте или через наш веб-сайт. Обновленная политика вступит в силу при публикации. Продолжение использования означает принятие изменений.',
    
    'privacy.section12.title': '12. Контактная информация',
    'privacy.section12.content': 'По вопросам, связанным с конфиденциальностью, или для осуществления ваших прав, свяжитесь с нашим Специалистом по защите данных по адресу privacy@starlines.md или напишите нам по адресу: Starlines Data Protection, Str. Ismail 123, Chișinău MD-2001, Moldova.',
    
    // Refund Policy
    'refunds.title': 'Политика возврата и отмены',
    'refunds.subtitle': 'Поймите наши условия возврата и процедуры отмены. Мы стремимся предоставить справедливую и прозрачную политику возврата для всех наших пассажиров.',
    'refunds.lastUpdated': 'Последнее обновление: 1 января 2024',
    'refunds.version': 'Версия 1.2',
    'refunds.refundSchedule': 'График возврата',
    'refunds.quickNavigation': 'Быстрая навигация',
    'refunds.requiredDocumentation': 'Требуемая документация для особых обстоятельств',
    'refunds.refundProcessingTimes': 'Время обработки возврата',
    'refunds.needHelpWithRefund': 'Нужна помощь с возвратом?',
    'refunds.customerServiceDescription': 'Наша команда обслуживания клиентов готова помочь вам с отменами и запросами на возврат.',
    'refunds.callCustomerService': 'Позвонить в службу поддержки клиентов',
    'refunds.submitRefundRequest': 'Отправить запрос на возврат',
    'refunds.hours': 'Часы работы: Понедельник-Пятница 8:00 AM - 8:00 PM',
    'refunds.note': 'Примечание: Вся документация должна быть официальной и проверяемой. Фотокопии или цифровые копии приемлемы для первоначального рассмотрения, но могут потребоваться оригинальные документы.',
    
    // Refund Scenarios
    'refunds.standardCancellation': 'Стандартная отмена',
    'refunds.lateCancellation': 'Поздняя отмена',
    'refunds.veryLateCancellation': 'Очень поздняя отмена',
    'refunds.lastMinuteNoShow': 'Последняя минута / Неявка',
    'refunds.timeframe': 'Временные рамки',
    'refunds.refund': 'Возврат',
    'refunds.fee': 'Комиссия',
    'refunds.processingFee': 'Комиссия за обработку',
    'refunds.noRefund': 'Без возврата',
    'refunds.na': 'Н/Д',
    
    // Refund Sections
    'refunds.section1.title': '1. Обзор политики возврата',
    'refunds.section1.content': 'Эта Политика возврата описывает условия и положения для отмены и возврата автобусных билетов, приобретенных через Starlines. Мы стремимся предоставить справедливые и прозрачные условия возврата, сохраняя при этом операционную эффективность. Право на возврат зависит от времени отмены и типа билета.',
    
    'refunds.section2.title': '2. Временные рамки отмены',
    'refunds.section2.content': 'Право на возврат основано на том, когда вы отменяете бронирование: Более чем за 24 часа до отправления (Полный возврат минус комиссия за обработку), За 12-24 часа до отправления (75% возврат), За 2-12 часов до отправления (50% возврат), Менее чем за 2 часа до отправления (Без возврата), Неявка (Без возврата).',
    
    'refunds.section3.title': '3. Обработка возврата',
    'refunds.section3.content': 'Одобренные возвраты обрабатываются в течение 7-10 рабочих дней на оригинальный способ оплаты. Могут применяться комиссии за обработку в размере 2-5 EUR в зависимости от способа оплаты и времени отмены. Возвраты за наличные платежи обрабатываются как банковские переводы или ваучеры.',
    
    'refunds.section4.title': '4. Ситуации без возврата',
    'refunds.section4.content': 'Определенные ситуации не подлежат возврату: Неявки без предварительного уведомления, отмены из-за неправомерного поведения пассажира, рекламные или дисконтные билеты (если не указано иное), билеты, приобретенные с ваучерами или кредитами, события форс-мажора, не зависящие от нас.',
    
    'refunds.section5.title': '5. Особые обстоятельства',
    'refunds.section5.content': 'Мы можем предоставить исключения для: Медицинских чрезвычайных ситуаций (с действительной документацией), Смерти в семье (с свидетельством о смерти), Военной командировки (с официальными приказами), Стихийных бедствий, влияющих на поездку, Отмены услуг Starlines (полный возврат включая комиссии).',
    
    'refunds.section6.title': '6. Как запросить возврат',
    'refunds.section6.content': 'Чтобы запросить возврат: Войдите в свой аккаунт и найдите бронирование, нажмите "Отменить бронирование" или "Запросить возврат", укажите причину отмены, отправьте требуемую документацию (если применимо), дождитесь подтверждающего письма с деталями возврата.',
    
    // Documentation Required
    'refunds.medicalEmergency': 'Медицинская чрезвычайная ситуация',
    'refunds.deathInFamily': 'Смерть в семье',
    'refunds.militaryDeployment': 'Военная командировка',
    'refunds.naturalDisaster': 'Стихийное бедствие',
    'refunds.medicalCertificate': 'Медицинская справка',
    'refunds.doctorsNote': 'Записка врача',
    'refunds.hospitalDischargePapers': 'Документы о выписке из больницы',
    'refunds.deathCertificate': 'Свидетельство о смерти',
    'refunds.proofOfRelationship': 'Доказательство родства',
    'refunds.officialDocumentation': 'Официальная документация',
    'refunds.officialDeploymentOrders': 'Официальные приказы о командировке',
    'refunds.militaryId': 'Военный билет',
    'refunds.commandAuthorization': 'Авторизация команды',
    'refunds.newsReports': 'Новостные отчеты',
    'refunds.officialEvacuationOrders': 'Официальные приказы об эвакуации',
    'refunds.governmentAdvisories': 'Правительственные рекомендации',
    
    // Processing Times
    'refunds.creditCards': 'Кредитные карты',
    'refunds.bankTransfers': 'Банковские переводы',
    'refunds.cashPayments': 'Наличные платежи',
    'refunds.businessDays': 'рабочих дней',
    
    // Contact Info
    'refunds.phone': 'Телефон',
    'refunds.email': 'Электронная почта',
    'refunds.phoneNumber': '+373 22 123 456',
    'refunds.emailAddress': 'refunds@starlines.md'
  },
  en: {
    // Authentication
    'auth.login.title': 'Login',
    'auth.login.description': 'Sign in to your account',
    'auth.login.button': 'Sign In',
    'auth.signUp.title': 'Create Account',
    'auth.signUp.description': 'Create a new account',
    'auth.signUp.button': 'Create Account',
    'auth.signUp.success.title': 'Account Created Successfully!',
    'auth.signUp.success.description': 'Check your email to confirm your account',
    'auth.signUp.success.login': 'Sign In',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'Enter your email',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmPasswordPlaceholder': 'Confirm your password',
    'auth.firstName': 'First Name',
    'auth.firstNamePlaceholder': 'Enter first name',
    'auth.lastName': 'Last Name',
    'auth.lastNamePlaceholder': 'Enter last name',
    'auth.phone': 'Phone',
    'auth.phonePlaceholder': 'Enter phone number',
    'auth.loggingIn': 'Signing in...',
    'auth.signingUp': 'Creating account...',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.forgotPassword': 'Forgot password?',
    'auth.logout': 'Sign Out',
    'auth.profile': 'Profile',
    'auth.or': 'Or',
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.signUpWithGoogle': 'Sign up with Google',

    // Header
    'header.home': 'Home',
    'header.bookings': 'Bookings',
    'header.routes': 'Routes & Prices',
    'header.timetable': 'Timetable',
    'header.myTickets': 'My Tickets',
    'header.more': 'More',
    'header.legal': 'Legal Information',
    'header.trust.safe': 'Safe Transport',
    'header.trust.experience': '10+ years experience',
    'header.language': 'Language',
    'header.currency': 'Currency',
    
    // Common actions
    'common.viewRoutes': 'View Routes',
    'common.viewTimetable': 'View Timetable',
    'common.viewTickets': 'View Tickets',
    'common.searchRoutes': 'Search Routes',
    'common.allPrices': 'All Prices',
    'common.book': 'Book',
    'common.search': 'Search',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.continue': 'Continue',
    
    // Hero Section
    'hero.title': 'Travel Safely Across Europe',
    'hero.subtitle': 'Reliable international transport with over 10 years of experience',
    'hero.searchPlaceholder': 'Where are you departing from?',
    'hero.searchButton': 'Search Tickets',
    'hero.popularRoutes': 'Popular Routes',
    'hero.routes': 'Routes',
    'hero.passengers': 'Passengers',
    'hero.support': 'Support',
    'hero.secure': 'Secure',
    
    // Search Form
    'search.from': 'From',
    'search.fromPlaceholder': 'Departure city',
    'search.to': 'To',
    'search.toPlaceholder': 'Destination city',
    'search.departure': 'Departure Date',
    'search.return': 'Return Date',
    'search.passengers': 'Passengers',
    'search.passenger': 'Passenger',
    'search.baggage': 'Baggage',
    'search.bag': 'Bag',
    'search.bags': 'Bags',
    'search.oneWay': 'One Way',
    'search.roundTrip': 'Round Trip',
    'search.searchTickets': 'Search Tickets',
    'search.popularRoutes': 'Popular Routes',
    'search.selectDate': 'Select date',
    'search.selectPassengers': 'Select number of passengers',
    'search.selectBaggage': 'Select baggage',
    'search.swapCities': 'Swap cities',
    
    // Index Page
    'index.whatToDo': 'What do you want to do?',
    'index.chooseAction': 'Choose the main action you want to perform. All are simple and clear!',
    'index.bookTicket': 'Book Ticket',
    'index.bookTicketDesc': 'Book your seat on the bus for your journey',
    'index.readyBookNow': 'Book Now',
    'index.readyViewRoutes': 'View Routes',
    'index.viewMyTickets': 'My Tickets',
    
    // Transport Routes
    'transport.title': 'Transport Routes',
    'transport.description': 'Discover and book bus routes across Europe with Starlines and InfoBus partners',
    'transport.home': 'Home',
    'transport.routes': 'Transport Routes',
    'transport.busRoutes': 'Bus Routes',
    'transport.findJourney': 'Find and book your perfect journey across Europe',
    'transport.listView': 'List View',
    'transport.mapView': 'Map View',
    'transport.searchPlaceholder': 'Search routes, cities, or operators...',
    'transport.fromCity': 'From City',
    'transport.toCity': 'To City',
    'transport.allCities': 'All Cities',
    'transport.operator': 'Operator',
    'transport.allOperators': 'All Operators',
    'transport.priceInterval': 'Price Interval',
    'transport.selectPriceInterval': 'Select price interval',
    'transport.allPrices': 'All prices',
    'transport.below80': 'Below €80',
    'transport.80to100': '€80 - €100',
    'transport.100to150': '€100 - €150',
    'transport.above150': 'Above €150',
    'transport.showingRoutes': 'Showing {count} of {total} routes',
    'transport.sortBy': 'Sort by:',
    'transport.departureTime': 'Departure Time',
    'transport.priceLowToHigh': 'Price (Low to High)',
    'transport.duration': 'Duration',
    'transport.rating': 'Rating',
    'transport.advancedFilters': 'Advanced Filters',
    'transport.datePicker': 'Date Picker',
    'transport.reviews': 'reviews',
    'transport.popular': 'Popular',
    'transport.viewDetails': 'View Details',
    'transport.bookNow': 'Book Now',
    'transport.noRoutesFound': 'No routes found',
    'transport.tryAdjusting': 'Try adjusting your search criteria or filters to find available routes.',
    'transport.clearAllFilters': 'Clear All Filters',
    'transport.interactiveMapView': 'Interactive Map View',
    'transport.mapViewDescription': 'Map view will be implemented here showing route visualization across Europe.',
    'transport.switchToListView': 'Switch to List View',
    'transport.cantFindRoute': 'Can\'t find the route you\'re looking for?',
    'transport.contactService': 'Contact our customer service team to request custom routes or get assistance with your travel plans.',
    'transport.requestCustomRoute': 'Request Custom Route',
    'transport.contactSupport': 'Contact Support',

    // Trip Details Page
    'tripDetails.loading': 'Loading route details...',
    'tripDetails.error.routeNotFound': 'Route not found',
    'tripDetails.error.failedToLoad': 'Failed to load route details',
    'tripDetails.error.noRouteId': 'No route ID provided',
    'tripDetails.backToRoutes': 'Back to Routes',
    'tripDetails.backToSearch': 'Back to Search',
    'tripDetails.bookNow': 'Book Now',
    'tripDetails.continueToCheckout': 'Continue to Checkout',
    'tripDetails.selectYourFare': 'Select Your Fare',
    'tripDetails.numberOfPassengers': 'Number of Passengers',
    'tripDetails.farePerPerson': 'Fare per person',
    'tripDetails.serviceFee': 'Service fee',
    'tripDetails.total': 'Total',
    'tripDetails.journeyTimeline': 'Journey Timeline',
    'tripDetails.interactiveMapComingSoon': 'Interactive map coming soon',
    'tripDetails.fareRulesPolicies': 'Fare Rules & Policies',
    'tripDetails.baggageAllowance': 'Baggage Allowance',
    'tripDetails.changesCancellations': 'Changes & Cancellations',
    'tripDetails.refundPolicy': 'Refund Policy',
    'tripDetails.handLuggage': 'Hand luggage',
    'tripDetails.checkedBaggage': 'Checked baggage',
    'tripDetails.oversizedItems': 'Oversized items',
    'tripDetails.extra': 'extra',
    'tripDetails.freeChanges': 'Free changes',
    'tripDetails.upTo2HoursBefore': 'Up to 2 hours before departure',
    'tripDetails.cancellationFee': 'Cancellation fee',
    'tripDetails.before24h': '24h before',
    'tripDetails.sameDay': 'same day',
    'tripDetails.noShow': 'No-show',
    'tripDetails.ofFare': 'of fare',
    'tripDetails.departure': 'Departure',
    'tripDetails.arrival': 'Arrival',
    'tripDetails.dailyService': 'Daily service',
    'tripDetails.reviews': 'reviews',
    'tripDetails.standardSeat': 'Standard seat',
    'tripDetails.basicAmenities': 'Basic amenities',
    'tripDetails.premiumSeat': 'Premium seat',
    'tripDetails.extraLegroom': 'Extra legroom',
    'tripDetails.priorityBoarding': 'Priority boarding',
    'tripDetails.refreshments': 'Refreshments',
    'tripDetails.businessSeat': 'Business seat',
    'tripDetails.maximumComfort': 'Maximum comfort',
    'tripDetails.premiumAmenities': 'Premium amenities',
    'tripDetails.flexibleChanges': 'Flexible changes',
    'tripDetails.flexible': 'Flexible',
    'tripDetails.changeable': 'Changeable',
    'tripDetails.securePayment': 'Secure Payment',
    'tripDetails.multiplePaymentMethods': 'Multiple payment methods accepted',

    // Timetable Page
    'timetable.title': 'Bus Timetable',
    'timetable.description': 'View complete schedules for all Starlines routes. Filter by date, operator, or direction to find your perfect journey.',
    'timetable.operator': 'Operator',
    'timetable.direction': 'Direction',
    'timetable.viewMode': 'View Mode',
    'timetable.calendar': 'Calendar',
    'timetable.list': 'List',
    'timetable.allOperators': 'All operators',
    'timetable.allDirections': 'All directions',
    'timetable.today': 'Today',
    'timetable.duration': 'Duration',
    'timetable.stops': 'Stops',
    'timetable.stop': 'stop',
    'timetable.book': 'Book',
    'timetable.bookNow': 'Book Now',
    'timetable.from': 'From',
    'timetable.noRoutesOperating': 'No routes operating at this time',
    'timetable.routesOperating': '{count} routes operating on {date}',
    'timetable.scheduleTitle': 'SCHEDULE',
    'timetable.busSchedule': 'bus schedule for route',
    'timetable.routeTitle': 'Chișinău (Republic of Moldova) – Kyiv (Ukraine)',
    'timetable.arrivalTime': 'arrival time',
    'timetable.stopDuration': 'stop duration',
    'timetable.departureTime': 'departure time',
    'timetable.distanceFromStart': 'Distance km. from starting stop',
    'timetable.stopNames': 'STOP NAMES',
    'timetable.distanceBetweenStops': 'Distance km. between stops',
    'timetable.directDirection': 'in direct direction',
    'timetable.reverseDirection': 'in reverse direction',
    'timetable.directRoute': 'Chișinău → Kyiv',
    'timetable.reverseRoute': 'Kyiv → Chișinău',
    'timetable.arrivalTimeDesc': 'arrival time at stop',
    'timetable.stopDurationDesc': 'stop duration',
    'timetable.departureTimeDesc': 'departure time from stop',
    'timetable.distanceFromStartDesc': 'distance from starting stop',
    'timetable.distanceBetweenDesc': 'distance from previous stop',
    'timetable.importantInfo': 'Important information',
    'timetable.borderCrossing': 'Border crossing point',
    'timetable.busStation': 'Bus station',
    'timetable.busPark': 'Bus park',
    'timetable.minutes': 'min',
    'timetable.kilometers': 'km',
    
    // Station names
    'stations.kyivVydubychi': 'Kyiv AS «Vydubychi»',
    'stations.kyivCentral': 'Kyiv AS «Kyiv»',
    'stations.zhytomyr': 'Zhytomyr',
    'stations.berdychiv': 'Berdychiv AS',
    'stations.vinnytsia': 'Vinnytsia',
    'stations.mohylivPodilskyi': 'Mohyliv-Podilskyi AS',
    'stations.mohylivBorderUkraine': 'APP «Mohyliv-Podilskyi»',
    'stations.atakiBorderMoldova': 'APP «Ataki»',
    'stations.edinet': 'Edinet AS',
    'stations.balti': 'Balti AS',
    'stations.orhei': 'Orhei AS',
    'stations.chisinauBusPark': 'Chișinău AP',
    'stations.chisinauCentral': 'Chișinău AS',
    
    // Station addresses
    'addresses.kyivVydubychi': 'Naberezhno-Pecherska Road, 10A',
    'addresses.kyivCentral': 'S. Petluri St, 32',
    'addresses.zhytomyr': 'Kyivska St 93',
    'addresses.berdychiv': 'Privokzalna Square 1-A',
    'addresses.vinnytsia': 'Kyivska St, 8',
    'addresses.mohylivPodilskyi': 'Pushkinska St 41',
    'addresses.edinet': 'Independenței St, 227',
    'addresses.balti': 'Ștefan cel Mare St, 2',
    'addresses.orhei': 'Sadoveanu St, 50',
    'addresses.chisinauBusPark': 'Dacia Boulevard 80/3',
    'addresses.chisinauCentral': 'Calea Moșilor St, 2/1',
    
    // Days of the week
    'days.sunday': 'Sunday',
    'days.monday': 'Monday',
    'days.tuesday': 'Tuesday',
    'days.wednesday': 'Wednesday',
    'days.thursday': 'Thursday',
    'days.friday': 'Friday',
    'days.saturday': 'Saturday',
    
    'index.viewRoutesDesc': 'All available routes and prices',
    'index.timetable': 'Timetable',
    'index.timetableDesc': 'Bus timetable for all routes',
    'index.viewTimetable': 'View Timetable',
    'index.trustSafe': 'Safe Transport',
    'index.trustSafeDesc': 'Modern buses with all safety standards',
    'index.trustExperience': '10+ Years Experience',
    'index.trustExperienceDesc': 'Reliable company in international transport',
    'index.trustSupport': '24/7 Support',
    'index.trustSupportDesc': 'We are here to help you whenever you need',
    'index.trustSimple': 'Simple Bookings',
    'index.trustSimpleDesc': 'Simple and fast booking process',
    'index.contactUs': 'Contact Us',
    'index.contactDesc': 'Call us for personalized help with booking',
    'index.phone': '+373 60 12 34 56',
    'index.workingHours': 'Monday - Friday: 9:00 - 18:00',
    'index.viewAllContacts': 'View all contacts',
    'index.faq': 'Frequently Asked Questions',
    'index.faqDesc': 'Find quick answers to your questions',
    'index.howToBook': 'How do I book?',
    'index.canCancel': 'Can I cancel my ticket?',
    'index.whatIfLate': 'What if I\'m late?',
    'index.viewAllQuestions': 'View all questions',
    'index.readyToStart': 'Ready to Start Your Journey?',
    'index.readyDesc': 'Book your seat on the bus in a few simple clicks. The process is fast and secure!',
    
    // Quick Access Section
    'index.quickAccess': 'Quick Access',
    'index.everythingYouNeed': 'Everything You Need',
    'index.quickAccessDesc': 'Quick access to all the tools and information you need for a seamless travel experience with Starlines.',
    'index.searchRoutesDesc': 'Find and book your perfect bus journey',
    'index.transportRoutesDesc': 'View all available routes and destinations',
    'index.myTicketsDesc': 'Access and manage your bookings',
    'index.blogDesc': 'Travel tips, news and destination guides',
    'index.aboutDesc': 'Learn about Starlines and our mission',
    'index.cantFindWhatYouNeed': 'Can\'t Find What You Need?',
    'index.useSearchOrContact': 'Use our search or contact support',
    
    // Search Results
    'search.filters': 'Filters',
    'search.departureTime': 'Departure Time',
    'search.duration': 'Duration (hours)',
    'search.price': 'Price (€)',
    'search.amenities': 'Amenities',
    'search.operator': 'Operator',
    'search.stops': 'Stops',
    'search.allOperators': 'All operators',
    'search.anyStops': 'Any number of stops',
    'search.directOnly': 'Direct routes only',
    'search.max1Stop': 'Max 1 stop',
    'search.resetFilters': 'Reset Filters',
    'search.recommended': 'Recommended',
    'search.priceLowToHigh': 'Price: Low to High',
    'search.priceHighToLow': 'Price: High to Low',
    'search.rating': 'Rating',
    'search.routesFound': 'routes found',
    'search.routeFound': 'route found',
    'search.noRoutesFound': 'No routes found',
    'search.tryAdjusting': 'Try adjusting your filters or search criteria',
    'search.select': 'Select',
    
    // Checkout Process
    'checkout.title': 'Checkout',
    'checkout.back': 'Back',
    'checkout.passenger': 'passenger',
    'checkout.passengers': 'passengers',
    
    // Checkout Steps
    'checkout.step1.title': 'Passengers',
    'checkout.step1.desc': 'Enter passenger details.',
    'checkout.step2.title': 'Contact',
    'checkout.step2.desc': 'Your contact information.',
    'checkout.step3.title': 'Review',
    'checkout.step3.desc': 'Review your booking.',
    'checkout.step4.title': 'Payment',
    'checkout.step4.desc': 'Complete payment.',
    
    // Passenger Details
    'checkout.passengerDetails.title': 'Passenger Details',
    'checkout.passengerDetails.desc': 'Please provide the details for all passengers',
    'checkout.passengerDetails.passenger': 'Passenger',
    'checkout.passengerDetails.firstName': 'First Name',
    'checkout.passengerDetails.firstNamePlaceholder': 'Enter first name',
    'checkout.passengerDetails.lastName': 'Last Name',
    'checkout.passengerDetails.lastNamePlaceholder': 'Enter last name',
    'checkout.passengerDetails.dateOfBirth': 'Date of Birth',
    'checkout.passengerDetails.dateOfBirthPlaceholder': 'dd.mm.yyyy',
    'checkout.passengerDetails.nationality': 'Nationality',
    'checkout.passengerDetails.nationalityPlaceholder': 'Select nationality',
    'checkout.passengerDetails.documentType': 'Document Type',
    'checkout.passengerDetails.documentType.passport': 'Passport',
    'checkout.passengerDetails.documentNumber': 'Document Number',
    'checkout.passengerDetails.documentNumberPlaceholder': 'Enter document number',
    
    // Contact Information
    'checkout.contact.title': 'Contact Information',
    'checkout.contact.desc': 'We\'ll use this information to send you booking confirmations and updates',
    'checkout.contact.email': 'Email Address',
    'checkout.contact.emailPlaceholder': 'your.email@example.com',
    'checkout.contact.phone': 'Phone Number',
    'checkout.contact.phonePlaceholder': 'Enter phone number',
    'checkout.contact.verifyPhone': 'Verify Phone Number',
    
    // Review Booking
    'checkout.review.title': 'Review Your Booking',
    'checkout.review.desc': 'Please review all details before proceeding to payment.',
    'checkout.review.tripSummary.title': 'Trip Summary',
    'checkout.review.tripSummary.route': 'Route',
    'checkout.review.tripSummary.date': 'Date',
    'checkout.review.tripSummary.time': 'Time',
    'checkout.review.tripSummary.duration': 'Duration',
    'checkout.review.tripSummary.fareType': 'Fare Type',
    'checkout.review.tripSummary.passengers': 'Passengers',
    'checkout.review.priceBreakdown.title': 'Price Breakdown',
    'checkout.review.priceBreakdown.farePerPerson': 'Fare per person',
    'checkout.review.priceBreakdown.passengers': 'Passengers',
    'checkout.review.priceBreakdown.serviceFee': 'Service fee',
    'checkout.review.priceBreakdown.total': 'Total',
    'checkout.review.promoCode.title': 'Promo Code',
    'checkout.review.promoCode.placeholder': 'Enter promo code',
    'checkout.review.promoCode.apply': 'Apply',
    'checkout.review.promoCode.discount': 'Promo discount',
    'checkout.review.promoCode.success': '✓ Promo code applied successfully!',
    'checkout.review.promoCode.error': '✗ Invalid promo code',
    
    // Payment
    'checkout.payment.ready.title': 'Ready for Payment',
    'checkout.payment.ready.desc': 'You\'re almost done! Click the button below to proceed to secure payment',
    'checkout.payment.secure': 'Secure payment powered by Stripe',
    'checkout.payment.totalAmount': 'Total amount to be charged',
    'checkout.payment.previous': 'Previous',
    'checkout.payment.proceed': 'Proceed to Payment',
    
    // Validation Messages
    'checkout.validation.firstNameRequired': 'First name is required',
    'checkout.validation.lastNameRequired': 'Last name is required',
    'checkout.validation.dateOfBirthRequired': 'Date of birth is required',
    'checkout.validation.nationalityRequired': 'Nationality is required',
    'checkout.validation.documentNumberRequired': 'Document number is required',
    'checkout.validation.emailRequired': 'Email is required',
    'checkout.validation.phoneRequired': 'Phone number is required',
    'checkout.validation.completeAllFields': 'Please complete all required fields before continuing',
    
    // Terms and Conditions
    'checkout.terms.agree': 'I agree to the terms and conditions',
    'checkout.terms.description': 'By checking this box, you agree to our',
    'checkout.terms.termsOfService': 'Terms of Service',
    'checkout.terms.and': 'and',
    'checkout.terms.privacyPolicy': 'Privacy Policy',
    
    // Months
    'months.january': 'January',
    'months.february': 'February',
    'months.march': 'March',
    'months.april': 'April',
    'months.may': 'May',
    'months.june': 'June',
    'months.july': 'July',
    'months.august': 'August',
    'months.september': 'September',
    'months.october': 'October',
    'months.november': 'November',
    'months.december': 'December',
    
    // Fare Types
    'fareType.economy': 'Economy',
    'fareType.standard': 'Standard',
    'fareType.premium': 'Premium',
    'fareType.business': 'Business',
    
    // My Tickets
    'myTickets.title': 'My Tickets',
    'myTickets.subtitle': 'Look up your tickets, download PDFs, and manage your bookings',
    'myTickets.lookupTab': 'Look Up Ticket',
    'myTickets.accountTab': 'My Account',
    'myTickets.findTicket': 'Find Your Ticket',
    'myTickets.orderNumber': 'Order Number',
    'myTickets.orderNumberPlaceholder': 'e.g., STL-2024-001',
    'myTickets.securityCode': 'Security Code',
    'myTickets.securityCodePlaceholder': 'Enter security code',
    'myTickets.findTicketButton': 'Find Ticket',
    'myTickets.searching': 'Searching...',
    'myTickets.helpText1': 'Don\'t have your details?',
    'myTickets.helpText2': 'Check your confirmation email or contact support',
    'myTickets.ticketDetails': 'Ticket Details',
    'myTickets.enterOrderDetails': 'Enter your order details to find your ticket',
    'myTickets.route': 'Route',
    'myTickets.date': 'Date',
    'myTickets.time': 'Time',
    'myTickets.passengers': 'Passengers',
    'myTickets.totalPaid': 'Total Paid',
    'myTickets.downloadPDF': 'Download PDF',
    'myTickets.showQR': 'Show QR',
    'myTickets.email': 'Email',
    'myTickets.pdfDownloaded': 'PDF Downloaded',
    'myTickets.pdfDownloadedDesc': 'Ticket has been downloaded successfully',
    'myTickets.emailSent': 'Email Sent',
    'myTickets.emailSentDesc': 'Ticket has been sent via email',
    'myTickets.qrCodeTitle': 'Your Ticket QR Code',
    'myTickets.qrCodeDescription': 'Show this QR code to the driver when boarding',
    'myTickets.qrCodePlaceholder': 'QR Code Placeholder',
    'myTickets.order': 'Order',
    'myTickets.accountInformation': 'Account Information',
    'myTickets.signInMessage': 'Sign in to access your tickets',
    'myTickets.createAccountMessage': 'Create an account or sign in to view all your bookings and tickets',
    'myTickets.signIn': 'Sign In',
    'myTickets.createAccount': 'Create Account',
    'myTickets.recentBookings': 'Recent Bookings',
    'myTickets.passenger': 'passenger',
    'myTickets.quickActions': 'Quick Actions',
    'myTickets.downloadAllTickets': 'Download All Tickets',
    'myTickets.emailAllTickets': 'Email All Tickets',
    'myTickets.viewCalendar': 'View Calendar',
    'myTickets.bookNewTrip': 'Book New Trip',
    'myTickets.missingInformation': 'Missing Information',
    'myTickets.enterBothFields': 'Please enter both order number and security code.',
    'myTickets.ticketFound': 'Ticket Found',
    'myTickets.ticketRetrieved': 'Your ticket has been retrieved successfully.',
    'myTickets.ticketNotFound': 'Ticket Not Found',
    'myTickets.checkDetails': 'Please check your order number and security code.',
    'myTickets.copied': 'Copied!',
    'myTickets.copiedToClipboard': 'has been copied to clipboard.',
    'myTickets.signInSuccess': 'Sign In Successful',
    'myTickets.welcomeBack': 'Welcome back!',
    'myTickets.signInError': 'Sign In Error',
    'myTickets.invalidCredentials': 'Invalid email or password.',
    'myTickets.signUpSuccess': 'Account Created Successfully',
    'myTickets.accountCreated': 'Your account has been created!',
    'myTickets.signUpError': 'Account Creation Error',
    'myTickets.passwordMismatch': 'Passwords do not match.',
    'myTickets.fillAllFields': 'Please fill in all fields.',
    'myTickets.authError': 'Authentication Error',
    'myTickets.tryAgain': 'Please try again.',
    'myTickets.signOutSuccess': 'Sign Out Successful',
    'myTickets.signedOut': 'You have been signed out successfully.',
    'myTickets.welcomeMessage': 'Welcome to your account!',
    'myTickets.accountActive': 'Your account is active and you can access all features.',
    'myTickets.signOut': 'Sign Out',
    'myTickets.signInDescription': 'Sign in to access your tickets.',
    'myTickets.signUpDescription': 'Create a new account to start using our services.',
    'myTickets.firstName': 'First Name',
    'myTickets.lastName': 'Last Name',
    'myTickets.password': 'Password',
    'myTickets.confirmPassword': 'Confirm Password',
    'myTickets.processing': 'Processing...',
    'myTickets.cancel': 'Cancel',
    
    // Features
    'features.title': 'Why Choose Starlines?',
    'features.subtitle': 'Our 10+ years of experience in international transport',
    'features.safeTransport': 'Safe Transport',
    'features.safeDesc': 'Modern fleet with professional drivers',
    'features.experience': 'Vast Experience',
    'features.experienceDesc': '10+ years in international transport',
    'features.support': '24/7 Support',
    'features.supportDesc': 'Our team is always available',
    'features.easyBooking': 'Easy Booking',
    'features.easyDesc': 'Simple online booking process',
    'features.securePayments': 'Secure Payments',
    'features.securePaymentsDesc': 'SSL encrypted transactions with multiple payment options',
    'features.flexibleReturns': 'Flexible Returns',
    'features.flexibleReturnsDesc': 'Easy cancellation and refund policies',
    'features.destinations': 'Multiple Destinations',
    'features.destinationsDesc': 'Comprehensive coverage across Eastern Europe',
    'features.modernAmenities': 'Modern Amenities',
    'features.modernAmenitiesDesc': 'WiFi, USB ports, and comfortable seating',
    'features.paymentOptions': 'Multiple Payment Options',
    'features.paymentOptionsDesc': 'Credit cards, digital wallets, and bank transfers',
    'features.mobileApp': 'Mobile App',
    'features.mobileAppDesc': 'Book and manage trips from your phone',
    'features.multilingual': 'Multilingual Support',
    'features.multilingualDesc': 'Assistance in Romanian, Russian, and English',
    
    // Popular Routes
    'routes.title': 'Popular Destinations',
    'routes.subtitle': 'Discover our most beloved routes',
    'routes.viewAll': 'View All Routes',
    'routes.perPerson': 'per person',
    'routes.viewDetails': 'View Details',
    'routes.readyToExplore': 'Ready to Explore?',
    'routes.findPerfectRoute': 'Find your perfect route today',
    'routes.browseAll': 'Browse All Routes',
    
    // Booking
    'booking.passengers': 'Passengers',
    'booking.departure': 'Departure',
    'booking.arrival': 'Arrival',
    'booking.duration': 'Duration',
    'booking.operator': 'Operator',
    'booking.price': 'Price',
    'booking.total': 'Total',
    'booking.serviceFee': 'Service Fee',
    
    // About
    'about.title': 'About Us',
    'about.subtitle': 'Our success story in international transport',
    'about.mission': 'Our Mission',
    'about.vision': 'Our Vision',
    'about.values': 'Our Values',
    
    // About Page Content
    'about.ourStory': 'Our Story',
    'about.connectingDreams': 'Connecting Dreams,',
    'about.oneJourneyAtTime': 'One Journey at a Time',
    'about.heroDescription': 'For over 15 years, Starlines has been more than just a bus company. We\'re the bridge between people and possibilities, connecting communities across Eastern Europe with reliability, comfort, and care.',
    'about.missionStatement': '"To democratize quality transportation by making safe, comfortable, and reliable bus travel accessible to everyone in Eastern Europe, while building bridges between communities and fostering sustainable growth."',
    
    // Stats Section
    'about.yearsOfService': 'Years of Service',
    'about.buildingTrust': 'Building trust since 2009',
    'about.routesCovered': 'Routes Covered',
    'about.acrossCountries': 'Across 12 countries',
    'about.happyCustomers': 'Happy Customers',
    'about.satisfiedTravelers': 'Satisfied travelers',
    'about.safetyRecord': 'Safety Record',
    'about.perfectSafetyScore': 'Perfect safety score',
    
    // Values Section
    'about.whatDrivesUs': 'What Drives Us',
    'about.valuesDescription': 'Our values aren\'t just words on a wall—they\'re the principles that guide every decision we make and every action we take.',
    'about.safetyAboveAll': 'Safety Above All',
    'about.safetyDescription': 'We believe that safety is not just a priority—it\'s our foundation. Every journey begins with rigorous safety protocols, state-of-the-art vehicle maintenance, and highly trained drivers who prioritize your well-being above everything else.',
    'about.passengerCentric': 'Passenger-Centric',
    'about.passengerDescription': 'Every decision we make is guided by one question: \'How does this improve our passengers\' experience?\' From comfortable seating to seamless booking, we put you at the heart of everything we do.',
    'about.reliabilityPromise': 'Reliability Promise',
    'about.reliabilityDescription': 'When you choose Starlines, you\'re choosing dependability. Our 99.9% on-time performance isn\'t just a statistic—it\'s our commitment to getting you where you need to be, when you need to be there.',
    'about.innovationDriven': 'Innovation Driven',
    'about.innovationDescription': 'We\'re not just keeping up with technology—we\'re leading the way. From AI-powered route optimization to eco-friendly vehicles, we\'re constantly pushing boundaries to create the future of transportation.',
    'about.sustainabilityFirst': 'Sustainability First',
    'about.sustainabilityDescription': 'Our commitment to the environment goes beyond compliance. We\'re actively reducing our carbon footprint through electric buses, renewable energy, and sustainable practices that protect our planet for future generations.',
    'about.communityImpact': 'Community Impact',
    'about.communityDescription': 'We\'re more than a transportation company—we\'re a bridge between communities. By connecting people and places, we\'re helping to build stronger, more connected societies across Eastern Europe.',
    
    // Team Section
    'about.mindsBehindheMagic': 'The Minds Behind the Magic',
    'about.teamDescription': 'Meet the passionate leaders who turn our vision into reality, driving innovation and excellence in everything we do.',
    'about.ceoFounder': 'CEO & Founder',
    'about.mihaiBio': 'A visionary entrepreneur with 25+ years in transportation, Mihai started Starlines with a simple dream: to make quality bus travel accessible to everyone in Eastern Europe. His passion for innovation and customer service drives our company forward.',
    'about.coo': 'Chief Operations Officer',
    'about.elenaBio': 'Elena brings military precision to our operations. With a background in logistics and a passion for efficiency, she ensures that every Starlines journey runs like clockwork, maintaining our reputation for reliability.',
    'about.cco': 'Chief Customer Officer',
    'about.alexandruBio': 'Alexandru believes that exceptional customer service is an art form. He\'s built our customer experience team from the ground up, creating a culture where every passenger feels valued and heard.',
    'about.cto': 'Chief Technology Officer',
    'about.mariaBio': 'Maria is our digital architect, transforming how people interact with transportation. From our award-winning app to AI-powered route optimization, she\'s making travel smarter, faster, and more enjoyable.',
    
    // Expertise labels
    'about.strategicVision': 'Strategic Vision',
    'about.industryLeadership': 'Industry Leadership',
    'about.customerExperience': 'Customer Experience',
    'about.operationsExcellence': 'Operations Excellence',
    'about.logistics': 'Logistics',
    'about.qualityControl': 'Quality Control',
    'about.teamBuilding': 'Team Building',
    'about.serviceInnovation': 'Service Innovation',
    'about.digitalTransformation': 'Digital Transformation',
    'about.aiMachineLearning': 'AI & Machine Learning',
    'about.productDevelopment': 'Product Development',
    
    // Timeline Section
    'about.journeyThroughTime': 'Our Journey Through Time',
    'about.timelineDescription': 'Every milestone tells a story of growth, innovation, and unwavering commitment to our passengers and communities.',
    'about.dreamBegins': 'The Dream Begins',
    'about.dreamDescription': 'Starlines was born from a simple observation: quality bus travel in Eastern Europe was either too expensive or too unreliable. We started with 3 buses and a big dream.',
    'about.dreamImpact': '3 routes, 3 buses, unlimited ambition',
    'about.breakingBorders': 'Breaking Borders',
    'about.bordersDescription': 'Our first international expansion proved that quality knows no boundaries. We connected Moldova to Romania and Ukraine, showing that great service transcends borders.',
    'about.bordersImpact': '50+ routes across 3 countries',
    'about.digitalRevolution': 'Digital Revolution',
    'about.digitalDescription': 'We launched our first online platform, making booking as easy as a few clicks. This wasn\'t just an upgrade—it was a complete reimagining of how people book travel.',
    'about.digitalImpact': 'First online booking platform in the region',
    'about.europeanExpansion': 'European Expansion',
    'about.expansionDescription': 'Our network grew to cover the heart of Eastern Europe. From the Baltic to the Black Sea, Starlines became synonymous with reliable cross-border travel.',
    'about.expansionImpact': '200+ routes across 8 countries',
    'about.greenRevolution': 'Green Revolution',
    'about.greenDescription': 'We introduced our first electric buses and launched carbon offset programs. Sustainability isn\'t just good business—it\'s our responsibility to future generations.',
    'about.greenImpact': 'First electric bus fleet in the region',
    'about.industryLeadershipTitle': 'Industry Leadership',
    'about.leadershipDescription': 'Today, Starlines stands as the most trusted name in Eastern European bus transportation. But we\'re not resting on our laurels—we\'re building tomorrow\'s transportation network.',
    'about.leadershipImpact': '300+ routes, 2M+ satisfied customers',
    
    // Fun Facts Section
    'about.didYouKnow': 'Did You Know?',
    'about.factsDescription': 'Some fascinating facts about Starlines that make us unique',
    'about.earthTrips': 'Our buses travel the equivalent of 15 trips around the Earth every day',
    'about.coffeeServed': 'We\'ve served coffee to over 500,000 passengers in our premium lounges',
    'about.languagesSpoken': 'Our drivers speak 8 different languages collectively',
    'about.familiesReunited': 'We\'ve helped reunite 2,000+ families through our affordable travel options',
    
    // CTA Section
    'about.readyToBePartOfStory': 'Ready to Be Part of Our Story?',
    'about.ctaDescription': 'Join millions of satisfied travelers who\'ve discovered that with Starlines, every journey is an adventure waiting to happen.',
    'about.startYourJourney': 'Start Your Journey',
    'about.learnMore': 'Learn More',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We are here to help you',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.address': 'Address',
    'contact.hours': 'Hours',
    
    // Footer
    'footer.transport': 'Transport',
    'footer.info': 'Information',
    'footer.support': 'Support',
    'footer.company': 'Company',
    'footer.legal': 'Legal',
    'footer.rights': 'All rights reserved',
    
    // Legal Pages
    'legal.terms': 'Terms & Conditions',
    'legal.termsDesc': 'Terms of use',
    'legal.privacy': 'Privacy Policy',
    'legal.privacyDesc': 'Personal data protection',
    'legal.refund': 'Refund Policy',
    'legal.refundDesc': 'Refund conditions',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Travel articles and guides',
    
    // Blog Page Content
    'blog.travelBlog': 'Travel Blog',
    'blog.discoverTravelTips': 'Discover travel tips, destination guides, and insights to make your journeys unforgettable.',
    'blog.searchArticles': 'Search articles...',
    'blog.allCategories': 'All categories',
    'blog.filterByTags': 'Filter by Tags',
    'blog.clearFilters': 'Clear Filters',
    'blog.articlesFound': 'articles found',
    'blog.articleFound': 'article found',
    'blog.noArticlesFound': 'No articles found',
    'blog.tryAdjusting': 'Try adjusting your search criteria or filters',
    'blog.clearAllFilters': 'Clear All Filters',
    'blog.readMore': 'Read More',
    'blog.blogImage': 'Blog Image',
    'blog.featured': 'Featured',
    
    // Blog Categories
    'blog.category.all': 'All',
    'blog.category.travelGuides': 'Travel Guides',
    'blog.category.travelTips': 'Travel Tips',
    'blog.category.budgetTravel': 'Budget Travel',
    'blog.category.travelPlanning': 'Travel Planning',
    
    // Blog Tags
    'blog.tag.easternEurope': 'Eastern Europe',
    'blog.tag.culture': 'Culture',
    'blog.tag.history': 'History',
    'blog.tag.travelTips': 'Travel Tips',
    'blog.tag.comfort': 'Comfort',
    'blog.tag.longDistance': 'Long Distance',
    'blog.tag.romania': 'Romania',
    'blog.tag.busNetwork': 'Bus Network',
    'blog.tag.featured': 'Featured',
    
    // Blog Articles
    'blog.article.top10Destinations.title': 'Top 10 Must-Visit Destinations in Eastern Europe',
    'blog.article.top10Destinations.excerpt': 'Discover the hidden gems and cultural treasures of Eastern Europe. From historic cities to breathtaking landscapes, these destinations will leave you speechless.',
    'blog.article.top10Destinations.author': 'Maria Popescu',
    'blog.article.top10Destinations.readTime': '8 min read',
    
    'blog.article.comfortableTravel.title': 'How to Travel Comfortably on Long Bus Journeys',
    'blog.article.comfortableTravel.excerpt': 'Essential tips and tricks for making your long-distance bus travel comfortable and enjoyable. Learn about seating, entertainment, and comfort essentials.',
    'blog.article.comfortableTravel.author': 'Alexandru Ionescu',
    'blog.article.comfortableTravel.readTime': '6 min read',
    
    'blog.article.romaniaGuide.title': 'The Ultimate Guide to Bus Travel in Romania',
    'blog.article.romaniaGuide.excerpt': 'Everything you need to know about traveling by bus in Romania. From booking tickets to understanding the network and finding the best deals.',
    'blog.article.romaniaGuide.author': 'Elena Dumitrescu',
    'blog.article.romaniaGuide.readTime': '10 min read',
    
    'blog.article.bestTimeToVisit.title': 'The Best Time to Visit Eastern Europe',
    'blog.article.bestTimeToVisit.excerpt': 'Discover when is the best time to visit Eastern Europe. From tourist seasons to cultural events, our guide will help you plan the perfect trip.',
    'blog.article.bestTimeToVisit.author': 'Mihai Popescu',
    'blog.article.bestTimeToVisit.readTime': '7 min read',
    
    'blog.article.budgetTravel.title': 'How to Travel Eastern Europe on a Budget',
    'blog.article.budgetTravel.excerpt': 'Practical tips for making your Eastern Europe trip financially accessible. From accommodation to transport and food, save money without sacrificing experience.',
    'blog.article.budgetTravel.author': 'Ana Vasilescu',
    'blog.article.budgetTravel.readTime': '9 min read',
    
    'blog.article.localCuisine.title': 'The Gastronomic Guide to Eastern Europe',
    'blog.article.localCuisine.excerpt': 'Explore the authentic flavors of Eastern Europe. From Romanian sarmale to Polish pierogi, discover the culinary traditions that define this fascinating region.',
    'blog.article.localCuisine.author': 'Diana Munteanu',
    'blog.article.localCuisine.readTime': '11 min read',
    
    'blog.article.safetyTips.title': 'Safety Tips for Bus Travel',
    'blog.article.safetyTips.excerpt': 'Ensure your safety during bus travel. From keeping luggage safe to interacting with strangers, these tips will help you stay safe.',
    'blog.article.safetyTips.author': 'Cristian Dumitru',
    'blog.article.safetyTips.readTime': '5 min read',
    
    'blog.article.winterTravel.title': 'Traveling Eastern Europe in the Cold Season',
    'blog.article.winterTravel.excerpt': 'Discover the beauty of Eastern Europe during winter. From frozen cities to ski resorts, our guide will help you enjoy the magic of the cold season.',
    'blog.article.winterTravel.author': 'Laura Ionescu',
    'blog.article.winterTravel.readTime': '8 min read',
    
    'blog.article.culturalEtiquette.title': 'Cultural Etiquette in Eastern Europe',
    'blog.article.culturalEtiquette.excerpt': 'Learn to navigate the cultural nuances of Eastern Europe. From greetings to table manners, these tips will help you integrate with locals.',
    'blog.article.culturalEtiquette.author': 'Vlad Popa',
    'blog.article.culturalEtiquette.readTime': '6 min read',
    
    // Blog Modal
    'blog.articleBy': 'Article by',
    'blog.close': 'Close',
    
    // Blog Article Content
    'blog.article.top10Destinations.content': `
      <h2>Discover Eastern Europe</h2>
      <p>Eastern Europe is a fascinating region that offers a unique travel experience, combining rich history with breathtaking landscapes and vibrant culture.</p>
      
      <h3>1. Prague, Czech Republic</h3>
      <p>The city of a thousand spires will captivate you with its Gothic and Baroque architecture. Prague Castle and Charles Bridge are just a few of the attractions that make Prague a must-visit destination.</p>
      
      <h3>2. Budapest, Hungary</h3>
      <p>The Hungarian capital offers a dual experience: Buda with its medieval castle and Pest with Art Nouveau architecture. Don't miss a Danube cruise at sunset.</p>
      
      <h3>3. Krakow, Poland</h3>
      <p>Poland's royal city will transport you back in time with its medieval square and Wawel Castle. The Jewish Quarter Kazimierz adds a deep cultural dimension.</p>
      
      <h3>4. Bucharest, Romania</h3>
      <p>Romania's capital offers a fascinating combination of communist and classical architecture. The Palace of Parliament and historic center are just the beginning.</p>
      
      <h3>5. Bratislava, Slovakia</h3>
      <p>The Slovak capital, smaller and more intimate, offers an authentic experience with its medieval castle and picturesque historic center.</p>
      
      <h3>6. Ljubljana, Slovenia</h3>
      <p>Europe's green city will surprise you with its Art Nouveau architecture and relaxed atmosphere. Ljubljana Castle offers spectacular panoramic views.</p>
      
      <h3>7. Zagreb, Croatia</h3>
      <p>The Croatian capital offers a sophisticated urban experience with its medieval center and Art Nouveau quarter.</p>
      
      <h3>8. Sofia, Bulgaria</h3>
      <p>The city with 7,000 years of history offers a fascinating combination of Roman, Byzantine, and Ottoman influences.</p>
      
      <h3>9. Tallinn, Estonia</h3>
      <p>The Estonian capital offers an authentic medieval experience with its well-preserved historic center and Hanseatic atmosphere.</p>
      
      <h3>10. Riga, Latvia</h3>
      <p>The city with the highest concentration of Art Nouveau architecture in Europe offers an exceptional visual experience.</p>
      
      <h2>Travel Tips</h2>
      <p>To make your Eastern Europe trip memorable, I recommend:</p>
      <ul>
        <li>Planning ahead but leaving room for spontaneity</li>
        <li>Learning a few words in the local language</li>
        <li>Exploring both tourist attractions and lesser-known places</li>
        <li>Enjoying authentic local cuisine</li>
        <li>Interacting with locals for a deeper experience</li>
      </ul>
    `,
    
    'blog.article.comfortableTravel.content': `
      <h2>Comfortable Travel on Long Distances</h2>
      <p>Long-distance bus travel doesn't have to be an unpleasant experience. With a little planning and a few tricks, you can turn an 8-12 hour journey into a comfortable and even enjoyable experience.</p>
      
      <h3>1. Seat Selection</h3>
      <p>Try to choose a window seat for views and more personal space. Front seats offer less vibration, while back seats can be noisier.</p>
      
      <h3>2. Comfort Essentials</h3>
      <p>Don't forget to bring:</p>
      <ul>
        <li>A travel pillow for neck support</li>
        <li>A light blanket for warmth</li>
        <li>Sunglasses for bright light</li>
      </ul>
      
      <h3>3. Entertainment</h3>
      <p>I recommend downloading in advance:</p>
      <ul>
        <li>Interesting podcasts</li>
        <li>Relaxing music</li>
        <li>An e-book or physical book</li>
        <li>Offline games on your phone</li>
      </ul>
      
      <h3>4. Food and Hydration</h3>
      <p>I recommend bringing:</p>
      <ul>
        <li>Healthy snacks (nuts, dried fruits)</li>
        <li>A reusable water bottle</li>
        <li>Light sandwiches</li>
      </ul>
      
      <h3>5. Regular Breaks</h3>
      <p>Take advantage of breaks to:</p>
      <ul>
        <li>Stretch and do light exercises</li>
        <li>Breathe fresh air</li>
        <li>Socialize with other travelers</li>
      </ul>
    `,
    
    'blog.article.romaniaGuide.content': `
      <h2>The Complete Guide to Bus Travel in Romania</h2>
      <p>Romania offers an extensive bus transport network that connects all major cities and many villages. Here's everything you need to know for a hassle-free journey.</p>
      
      <h3>Transport Network</h3>
      <p>Romania has a well-developed bus transport network with companies such as:</p>
      <ul>
        <li>Autogari.ro - the main booking platform</li>
        <li>Regional and national companies</li>
        <li>International routes to neighboring countries</li>
      </ul>
      
      <h3>Ticket Booking</h3>
      <p>For booking tickets:</p>
      <ul>
        <li>Use online platforms (Autogari.ro, FlixBus)</li>
        <li>Book at least 24 hours in advance</li>
        <li>Check the schedule and journey duration</li>
      </ul>
      
      <h3>Popular Destinations</h3>
      <p>The most popular routes in Romania:</p>
      <ul>
        <li>Bucharest - Brașov (2-3 hours)</li>
        <li>Bucharest - Sibiu (4-5 hours)</li>
        <li>Bucharest - Cluj-Napoca (6-7 hours)</li>
        <li>Bucharest - Timișoara (7-8 hours)</li>
      </ul>
      
      <h3>Practical Tips</h3>
      <p>For a hassle-free journey:</p>
      <ul>
        <li>Arrive at the bus station 30 minutes before departure</li>
        <li>Check the departure platform</li>
        <li>Watch your luggage</li>
        <li>Keep your ticket handy</li>
      </ul>
    `,
    
    'blog.article.bestTimeToVisit.content': `
      <h2>The Best Time to Visit Eastern Europe</h2>
      <p>Eastern Europe offers unique experiences in every season, but certain periods are more suitable for certain types of travel.</p>
      
      <h3>Spring (March - May)</h3>
      <p>Spring is perfect for:</p>
      <ul>
        <li>Visiting parks and blooming gardens</li>
        <li>Lower accommodation prices</li>
        <li>Pleasant weather for exploration</li>
        <li>Spring festivals</li>
      </ul>
      
      <h3>Summer (June - August)</h3>
      <p>Summer offers:</p>
      <ul>
        <li>The warmest and most stable weather</li>
        <li>Festivals and cultural events</li>
        <li>Access to mountain attractions</li>
        <li>The longest days for exploration</li>
      </ul>
      
      <h3>Autumn (September - November)</h3>
      <p>Autumn is ideal for:</p>
      <ul>
        <li>Spectacularly colored foliage</li>
        <li>Lower prices after the tourist season</li>
        <li>Pleasant weather for travel</li>
        <li>Autumn festivals</li>
      </ul>
      
      <h3>Winter (December - February)</h3>
      <p>Winter offers:</p>
      <ul>
        <li>Magical Christmas markets</li>
        <li>Affordable ski resorts</li>
        <li>Unique winter experiences</li>
        <li>Very low accommodation prices</li>
      </ul>
    `,
    
    'blog.article.budgetTravel.content': `
      <h2>How to Travel Eastern Europe on a Budget</h2>
      <p>Eastern Europe is one of the most accessible regions in Europe for budget travel. Here's how to save money without sacrificing experience.</p>
      
      <h3>Accommodation</h3>
      <p>For cheap accommodation:</p>
      <ul>
        <li>Hostels (5-15 EUR/night)</li>
        <li>Apartments through Airbnb (20-40 EUR/night)</li>
        <li>Small local hotels (25-50 EUR/night)</li>
        <li>Couchsurfing (free)</li>
      </ul>
      
      <h3>Transport</h3>
      <p>For cheap transport:</p>
      <ul>
        <li>Local buses (0.5-2 EUR)</li>
        <li>Metro in big cities (0.5-1 EUR)</li>
        <li>Bicycle rental (5-10 EUR/day)</li>
        <li>Walking (free)</li>
      </ul>
      
      <h3>Food</h3>
      <p>For cheap food:</p>
      <ul>
        <li>Local restaurants (5-10 EUR/meal)</li>
        <li>Local markets for ingredients</li>
        <li>Street food (2-5 EUR)</li>
        <li>Supermarkets for snacks</li>
      </ul>
      
      <h3>Activities</h3>
      <p>For free or cheap activities:</p>
      <ul>
        <li>Free museums on the first day of the month</li>
        <li>Parks and public gardens</li>
        <li>Walks with free guides</li>
        <li>Local free festivals</li>
      </ul>
    `,
    
    'blog.article.localCuisine.content': `
      <h2>The Gastronomic Guide to Eastern Europe</h2>
      <p>Eastern European cuisine is a fascinating fusion of culinary influences, from Slavic traditions to Ottoman and Austro-Hungarian influences.</p>
      
      <h3>Romania</h3>
      <p>Romanian cuisine offers:</p>
      <ul>
        <li>Sarmale - grape leaves wrapped around meat and rice</li>
        <li>Mămăligă with cheese and sour cream</li>
        <li>Ciorbă de burtă - traditional soup</li>
        <li>Papanăși - donuts with sour cream and jam</li>
      </ul>
      
      <h3>Poland</h3>
      <p>Polish cuisine offers:</p>
      <ul>
        <li>Pierogi - dumplings filled with various ingredients</li>
        <li>Bigos - traditional stew with cabbage and meat</li>
        <li>Żurek - fermented rye soup</li>
        <li>Paczki - traditional Polish donuts</li>
      </ul>
      
      <h3>Hungary</h3>
      <p>Hungarian cuisine offers:</p>
      <ul>
        <li>Gulyás - traditional meat stew</li>
        <li>Lángos - fried bread with garlic</li>
        <li>Chimney cake - cake in basket form</li>
        <li>Tokaji - traditional sweet wine</li>
      </ul>
      
      <h3>Czech Republic</h3>
      <p>Czech cuisine offers:</p>
      <ul>
        <li>Svíčková - beef with sour cream sauce</li>
        <li>Guláš - traditional stew</li>
        <li>Trdelík - traditional dessert</li>
        <li>Pilsner - traditional beer</li>
      </ul>
    `,
    
    'blog.article.safetyTips.content': `
      <h2>Safety Tips for Bus Travel</h2>
      <p>Bus travel is generally safe, but it's important to follow a few basic rules to ensure your safety.</p>
      
      <h3>Before Travel</h3>
      <p>Before departure:</p>
      <ul>
        <li>Check the transport company's reputation</li>
        <li>Read reviews from other travelers</li>
        <li>Check if the bus has safety features</li>
        <li>Register luggage if necessary</li>
      </ul>
      
      <h3>During Travel</h3>
      <p>During the journey:</p>
      <ul>
        <li>Keep your luggage nearby</li>
        <li>Don't leave valuable items unattended</li>
        <li>Be attentive to stops for breaks</li>
        <li>Don't accept food or drinks from strangers</li>
      </ul>
      
      <h3>At Destination</h3>
      <p>At destination:</p>
      <ul>
        <li>Check your luggage before departure</li>
        <li>Be careful with unauthorized taxis</li>
        <li>Use official public transport</li>
        <li>Keep valuable items safe</li>
      </ul>
      
      <h3>In Case of Emergency</h3>
      <p>In case of emergency:</p>
      <ul>
        <li>The driver is responsible for passenger safety</li>
        <li>Follow staff instructions</li>
        <li>Keep emergency numbers handy</li>
        <li>Stay calm and help others if you can</li>
      </ul>
    `,
    
    'blog.article.winterTravel.content': `
      <h2>Traveling Eastern Europe in the Cold Season</h2>
      <p>Winter in Eastern Europe offers a completely different experience with frozen cities, magical Christmas markets, and unique opportunities for exploration.</p>
      
      <h3>Winter Preparation</h3>
      <p>For a successful winter journey:</p>
      <ul>
        <li>Dress in layers for warmth</li>
        <li>Use waterproof footwear</li>
        <li>Don't forget gloves, scarves, and hats</li>
        <li>Check the weather forecast in advance</li>
      </ul>
      
      <h3>Popular Winter Destinations</h3>
      <p>The most popular winter destinations:</p>
      <ul>
        <li>Bucharest - magical Christmas markets</li>
        <li>Bratislava - frozen historic center</li>
        <li>Prague - medieval winter atmosphere</li>
        <li>Budapest - thermal baths on cold days</li>
      </ul>
      
      <h3>Winter Activities</h3>
      <p>Popular winter activities:</p>
      <ul>
        <li>Skiing in Carpathian resorts</li>
        <li>Ice skating on frozen lakes</li>
        <li>Visiting Christmas markets</li>
        <li>Thermal baths for warming up</li>
      </ul>
      
      <h3>Practical Tips</h3>
      <p>For a hassle-free winter journey:</p>
      <ul>
        <li>Book accommodation in advance</li>
        <li>Check transport schedules</li>
        <li>Be careful with ice on sidewalks</li>
        <li>Take advantage of lower prices</li>
      </ul>
    `,
    
    'blog.article.culturalEtiquette.content': `
      <h2>Cultural Etiquette in Eastern Europe</h2>
      <p>Understanding cultural etiquette is essential for a successful travel experience in Eastern Europe. Here's the complete guide.</p>
      
      <h3>Greetings</h3>
      <p>For greetings:</p>
      <ul>
        <li>In Romania: "Bună ziua" (formal) or "Salut" (informal)</li>
        <li>In Poland: "Dzień dobry" (formal) or "Cześć" (informal)</li>
        <li>In Hungary: "Jó napot" (formal) or "Szia" (informal)</li>
        <li>In Czech Republic: "Dobrý den" (formal) or "Ahoj" (informal)</li>
      </ul>
      
      <h3>At the Table</h3>
      <p>For table behavior:</p>
      <ul>
        <li>Wait to be invited to the table</li>
        <li>Don't start eating before the host</li>
        <li>Make a toast before the first sip</li>
        <li>Don't leave food on the plate</li>
      </ul>
      
      <h3>In Public Places</h3>
      <p>For behavior in public places:</p>
      <ul>
        <li>Be respectful to elderly people</li>
        <li>Don't smoke in closed public places</li>
        <li>Be discreet with photographs</li>
        <li>Respect local rules</li>
      </ul>
      
      <h3>Social Interaction</h3>
      <p>For social interaction:</p>
      <ul>
        <li>Be honest and direct</li>
        <li>Don't avoid difficult topics</li>
        <li>Respect political opinions</li>
        <li>Be curious about local culture</li>
      </ul>
    `,
    
    // Admin
    'admin.title': 'Admin Panel',
    'admin.subtitle': 'Route management and administration',
    
    // Forms
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.password': 'Password',
    'form.confirmPassword': 'Confirm Password',
    'form.required': 'Required',
    'form.optional': 'Optional',
    
    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Find answers to the most common questions about booking, traveling, and using our services. Can\'t find what you\'re looking for? Contact our support team.',
    'faq.searchPlaceholder': 'Search questions and answers...',
    'faq.allCategories': 'All Categories',
    'faq.clearFilters': 'Clear Filters',
    'faq.questionsFound': 'questions found',
    'faq.questionFound': 'question found',
    'faq.noQuestionsFound': 'No questions found',
    'faq.tryAdjusting': 'Try adjusting your search criteria or browse all categories',
    'faq.clearAllFilters': 'Clear All Filters',
    'faq.stillHaveQuestions': 'Still have questions?',
    'faq.supportDescription': 'Our customer support team is here to help you 24/7',
    'faq.contactSupport': 'Contact Support',
    'faq.liveChat': 'Live Chat',
    
    // FAQ Categories
    'faq.category.bookingTickets': 'Booking & Tickets',
    'faq.category.travelRoutes': 'Travel & Routes',
    'faq.category.schedulesTimetables': 'Schedules & Timetables',
    'faq.category.safetySecurity': 'Safety & Security',
    'faq.category.customerService': 'Customer Service',
    'faq.category.pricingDiscounts': 'Pricing & Discounts',
    
    // FAQ Questions and Answers
    'faq.booking.howToBook.question': 'How do I book a bus ticket?',
    'faq.booking.howToBook.answer': 'You can book tickets through our website, mobile app, or by calling our customer service. Simply enter your departure and destination cities, select your travel date, choose your preferred route, and complete the payment process.',
    'faq.booking.changeCancel.question': 'Can I change or cancel my ticket?',
    'faq.booking.changeCancel.answer': 'Yes, you can modify or cancel your ticket up to 2 hours before departure. Changes are subject to availability and may incur additional fees. Cancellations made more than 24 hours before departure are usually refundable.',
    'faq.booking.paymentMethods.question': 'What payment methods do you accept?',
    'faq.booking.paymentMethods.answer': 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like PayPal. We also support bank transfers for advance bookings.',
    'faq.booking.printTicket.question': 'Do I need to print my ticket?',
    'faq.booking.printTicket.answer': 'No, you don\'t need to print your ticket. You can show the digital ticket on your mobile device, or we can send you an SMS with your booking reference. However, printing is recommended as a backup.',
    
    'faq.travel.arriveEarly.question': 'How early should I arrive at the bus station?',
    'faq.travel.arriveEarly.answer': 'We recommend arriving at least 30 minutes before departure for domestic routes and 45 minutes for international routes. This allows time for check-in, baggage handling, and boarding procedures.',
    'faq.travel.missBus.question': 'What happens if I miss my bus?',
    'faq.travel.missBus.answer': 'If you miss your bus, contact our customer service immediately. Depending on availability and your ticket type, we may be able to rebook you on the next available departure, though additional fees may apply.',
    'faq.travel.luggageRestrictions.question': 'Are there luggage restrictions?',
    'faq.travel.luggageRestrictions.answer': 'Each passenger is allowed one carry-on bag (max 10kg) and one checked bag (max 20kg). Additional luggage can be transported for an extra fee. Oversized items should be arranged in advance.',
    'faq.travel.pets.question': 'Can I bring pets on board?',
    'faq.travel.pets.answer': 'Small pets in carriers are allowed on most routes, but must be pre-booked. Service animals travel free of charge. Please check specific route policies as some international routes may have restrictions.',
    
    'faq.schedules.frequency.question': 'How often do buses run?',
    'faq.schedules.frequency.answer': 'Frequency varies by route. Popular routes like Chișinău-București may have multiple daily departures, while less frequent routes may run once or twice daily. Check our timetable for specific schedules.',
    'faq.schedules.weekendsHolidays.question': 'Are schedules different on weekends and holidays?',
    'faq.schedules.weekendsHolidays.answer': 'Yes, some routes have reduced frequency on weekends and holidays. We recommend checking our holiday schedule or contacting customer service for the most up-to-date information.',
    'faq.schedules.journeyTime.question': 'How long do journeys typically take?',
    'faq.schedules.journeyTime.answer': 'Journey times vary by distance and route. For example, Chișinău to București takes approximately 8-10 hours, while shorter domestic routes may take 2-4 hours. Check individual route details for exact times.',
    
    'faq.safety.measures.question': 'What safety measures are in place?',
    'faq.safety.measures.answer': 'All our buses are regularly inspected and maintained. Drivers are professionally trained and licensed. We have 24/7 monitoring and emergency response systems. Seat belts are available on all seats.',
    'faq.safety.insurance.question': 'Is travel insurance included?',
    'faq.safety.insurance.answer': 'Basic travel insurance is included with all tickets. This covers medical emergencies and trip cancellations. Additional comprehensive insurance can be purchased during booking for enhanced coverage.',
    'faq.safety.emergency.question': 'What should I do in case of an emergency?',
    'faq.safety.emergency.answer': 'In case of emergency, contact our 24/7 emergency hotline immediately. All buses are equipped with emergency exits and first aid kits. Drivers are trained in emergency procedures and can contact emergency services.',
    
    'faq.service.contact.question': 'How can I contact customer service?',
    'faq.service.contact.answer': 'You can reach us through multiple channels: 24/7 phone support, live chat on our website, email support, or through our mobile app. We also have customer service desks at major bus stations.',
    'faq.service.hours.question': 'What are your customer service hours?',
    'faq.service.hours.answer': 'Our customer service is available 24/7 for urgent matters. General inquiries are handled from 6:00 AM to 10:00 PM daily. Emergency support is always available.',
    'faq.service.complaints.question': 'How do I file a complaint?',
    'faq.service.complaints.answer': 'You can submit complaints through our website\'s feedback form, email us directly, or speak with a customer service representative. We aim to respond to all complaints within 48 hours.',
    
    'faq.pricing.studentDiscounts.question': 'Are there discounts for students or seniors?',
    'faq.pricing.studentDiscounts.answer': 'Yes, we offer discounts for students (with valid ID), seniors (65+), and children under 12. We also have special rates for group bookings of 10 or more passengers.',
    'faq.pricing.loyaltyPrograms.question': 'Do you offer loyalty programs?',
    'faq.pricing.loyaltyPrograms.answer': 'Yes, our Starlines Rewards program offers points for every journey, which can be redeemed for discounts on future bookings. Members also get access to exclusive deals and early booking opportunities.',
    'faq.pricing.seasonalPromotions.question': 'Are there seasonal promotions?',
    'faq.pricing.seasonalPromotions.answer': 'Yes, we regularly run seasonal promotions and special offers. These include summer travel deals, holiday packages, and last-minute discounts. Sign up for our newsletter to stay updated.',
    
    // Contacts
    'contacts.title': 'Contacts',
    'contacts.description': 'We are here to help you plan your perfect trip',
    'contacts.breadcrumbHome': 'Home',
    'contacts.breadcrumbContacts': 'Contacts',
    
    // Contact Information Section
    'contacts.weAreHereToHelp.title': 'We are here to help you',
    'contacts.weAreHereToHelp.description': 'Our team of specialists is ready to provide you with personalized assistance to plan your perfect trip in Europe.',
    
    // Contact Cards
    'contacts.email.title': 'Email',
    'contacts.email.description': 'For general questions and assistance',
    'contacts.phone.title': 'Phone',
    'contacts.phone.description': 'Phone support during business hours',
    'contacts.schedule.title': 'Schedule',
    'contacts.schedule.weekdays': 'Monday - Friday: 9:00 AM - 6:00 PM',
    'contacts.schedule.saturday': 'Saturday: 9:00 AM - 2:00 PM',
    
    // Contact Form Section
    'contacts.form.title': 'Complex Contact Form',
    'contacts.form.description': 'Fill out the form below to receive a personalized offer for your trip to Europe.',
    
    // Success Message
    'contacts.success.title': 'Thank you for your message!',
    'contacts.success.description': 'We have received your request and will contact you as soon as possible to discuss your trip.',
    'contacts.success.responseTime': 'Response within 24 hours',
    
    // Form Sections
    'contacts.form.personalInfo.title': 'Personal Information and Trip Details',
    'contacts.form.personalInfo.section': 'Personal Information',
    'contacts.form.travelDetails.section': 'Trip Details',
    'contacts.form.passengers.section': 'Passengers',
    'contacts.form.contactInfo.section': 'Contact Information',
    'contacts.form.additionalMessage.section': 'Additional Message',
    
    // Form Fields
    'contacts.form.firstName.label': 'First Name',
    'contacts.form.firstName.placeholder': 'Enter your first name',
    'contacts.form.lastName.label': 'Last Name',
    'contacts.form.lastName.placeholder': 'Enter your last name',
    'contacts.form.destination.label': 'Destination',
    'contacts.form.destination.placeholder': 'Select destination',
    'contacts.form.destination.other': 'Other destination',
    'contacts.form.destination.otherPlaceholder': 'Specify destination',
    'contacts.form.date.label': 'Trip Date',
    'contacts.form.adults.label': 'Adults',
    'contacts.form.minors.label': 'Minors',
    'contacts.form.minorAge.label': 'Minor Age',
    'contacts.form.minorAge.placeholder': 'Ex: 12 years',
    'contacts.form.phone.label': 'Phone Number',
    'contacts.form.phone.placeholder': '+373 60 12 34 56',
    'contacts.form.email.label': 'Email',
    'contacts.form.email.placeholder': 'example@email.com',
    'contacts.form.message.label': 'Message (optional)',
    'contacts.form.message.placeholder': 'Describe special requirements, accommodation preferences, or other important details for your trip...',
    
    // Form Validation Messages
    'contacts.form.validation.firstName.required': 'First name is required',
    'contacts.form.validation.lastName.required': 'Last name is required',
    'contacts.form.validation.destination.required': 'Destination is required',
    'contacts.form.validation.date.required': 'Date is required',
    'contacts.form.validation.minorAge.required': 'Minor age is required when a minor is traveling',
    'contacts.form.validation.phone.required': 'Phone number is required',
    'contacts.form.validation.phone.invalid': 'Phone number is not valid (format: +373XXXXXXXX or 0XXXXXXXX)',
    'contacts.form.validation.email.required': 'Email is required',
    'contacts.form.validation.email.invalid': 'Email is not valid',
    
    // Form Actions
    'contacts.form.submit.sending': 'Sending...',
    'contacts.form.submit.send': 'Send Request',
    
    // Company Information
    'contacts.company.about.title': 'About Starlines',
    'contacts.company.about.description': 'We are an international transport company with over 10 years of experience organizing bus trips in Europe. We pride ourselves on quality service and attention to detail for every passenger.',
    'contacts.company.registered': 'Company registered in Republic of Moldova',
    'contacts.company.routes': 'Routes in 15+ European countries',
    'contacts.company.passengers': 'Over 50,000 satisfied passengers',
    
    // Why Choose Us
    'contacts.company.whyChoose.title': 'Why Choose Starlines?',
    'contacts.company.competitivePrices.title': 'Competitive Prices',
    'contacts.company.competitivePrices.description': 'Special offers and discounts for groups',
    'contacts.company.personalizedService.title': 'Personalized Service',
    'contacts.company.personalizedService.description': 'Individual assistance for each trip',
    'contacts.company.guaranteedSafety.title': 'Guaranteed Safety',
    'contacts.company.guaranteedSafety.description': 'Modern buses with all safety standards',
    'contacts.company.support24.title': '24/7 Support',
    'contacts.company.support24.description': 'Phone assistance during the trip',
    
    // Popular Destinations
    'contacts.popularDestinations.berlin': 'Berlin, Germany',
    'contacts.popularDestinations.munich': 'Munich, Germany',
    'contacts.popularDestinations.frankfurt': 'Frankfurt, Germany',
    'contacts.popularDestinations.vienna': 'Vienna, Austria',
    'contacts.popularDestinations.warsaw': 'Warsaw, Poland',
    'contacts.popularDestinations.prague': 'Prague, Czech Republic',
    'contacts.popularDestinations.bucharest': 'Bucharest, Romania',
    'contacts.popularDestinations.istanbul': 'Istanbul, Turkey',
    
    // Terms of Service
    'terms.title': 'Terms of Service',
    'terms.subtitle': 'Please read these terms carefully before using our services. By using Starlines, you agree to comply with and be bound by these terms.',
    'terms.lastUpdated': 'Last updated: January 1, 2024',
    'terms.version': 'Version 2.1',
    'terms.quickNavigation': 'Quick Navigation',
    'terms.questionsAboutTerms': 'Questions About Our Terms?',
    'terms.legalTeamHelp': 'Our legal team is here to help clarify any questions you may have about these terms.',
    'terms.contactLegal': 'Contact us at',
    'terms.orCall': 'or call',
    
    // Terms Sections
    'terms.section1.title': '1. Acceptance of Terms',
    'terms.section1.content': 'By accessing and using the Starlines website, mobile application, or services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with these terms, please do not use our services.',
    
    'terms.section2.title': '2. Description of Services',
    'terms.section2.content': 'Starlines provides bus transportation services across Eastern Europe. Our services include online ticket booking, route information, customer support, and related travel services. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.',
    
    'terms.section3.title': '3. Booking and Payment',
    'terms.section3.content': 'All bookings are subject to availability and confirmation. Payment must be completed at the time of booking. We accept major credit cards, debit cards, and other payment methods as displayed during checkout. Prices are subject to change without notice until payment is confirmed.',
    
    'terms.section4.title': '4. Tickets and Travel',
    'terms.section4.content': 'Valid identification is required for travel. Passengers must arrive at the departure point at least 30 minutes before scheduled departure. Tickets are non-transferable unless explicitly stated otherwise. Lost or stolen tickets cannot be replaced without proper documentation.',
    
    'terms.section5.title': '5. Cancellation and Refunds',
    'terms.section5.content': 'Cancellations made more than 24 hours before departure are eligible for refund minus processing fees. Cancellations within 24 hours of departure may not be eligible for refund. No-shows are not eligible for refunds. Refunds are processed within 7-10 business days.',
    
    'terms.section6.title': '6. Luggage and Personal Items',
    'terms.section6.content': 'Each passenger is allowed one carry-on bag (max 10kg) and one checked bag (max 20kg). Additional luggage fees apply for excess weight or additional bags. Starlines is not responsible for lost, damaged, or stolen personal items unless caused by our negligence.',
    
    'terms.section7.title': '7. Passenger Conduct',
    'terms.section7.content': 'Passengers must comply with all safety regulations and crew instructions. Disruptive, abusive, or dangerous behavior may result in removal from the vehicle without refund. Smoking, consumption of alcohol, and illegal substances are prohibited on all vehicles.',
    
    'terms.section8.title': '8. Limitation of Liability',
    'terms.section8.content': 'Starlines\' liability is limited to the extent permitted by law. We are not responsible for delays caused by weather, traffic, mechanical issues, or other circumstances beyond our control. Maximum liability for any claim is limited to the ticket price paid.',
    
    'terms.section9.title': '9. Privacy and Data Protection',
    'terms.section9.content': 'We collect and process personal data in accordance with our Privacy Policy and applicable data protection laws. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.',
    
    'terms.section10.title': '10. Changes to Terms',
    'terms.section10.content': 'Starlines reserves the right to modify these Terms of Service at any time. Changes will be posted on our website and become effective immediately. Continued use of our services after changes constitutes acceptance of the modified terms.',
    
    'terms.section11.title': '11. Governing Law',
    'terms.section11.content': 'These Terms of Service are governed by the laws of Moldova. Any disputes arising from these terms or our services shall be resolved in the courts of Moldova. If any provision is found unenforceable, the remaining provisions remain in full effect.',
    
    'terms.section12.title': '12. Contact Information',
    'terms.section12.content': 'For questions about these Terms of Service, please contact us at legal@starlines.md or call our customer service at +373 22 123 456. Our legal department is available Monday through Friday, 9:00 AM to 6:00 PM.',
    
    // Privacy Policy
    'privacy.title': 'Privacy Policy',
    'privacy.subtitle': 'We value your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information.',
    'privacy.lastUpdated': 'Last updated: January 1, 2024',
    'privacy.gdprCompliant': 'GDPR Compliant',
    'privacy.typesOfData': 'Types of Data We Collect',
    'privacy.quickNavigation': 'Quick Navigation',
    'privacy.exerciseYourRights': 'Exercise Your Privacy Rights',
    'privacy.rightsDescription': 'You have control over your personal data. Contact us to exercise any of these rights:',
    'privacy.contactDPO': 'Contact our Data Protection Officer at',
    'privacy.orCall': 'or call',
    
    // Data Types
    'privacy.personalInformation': 'Personal Information',
    'privacy.paymentInformation': 'Payment Information',
    'privacy.travelInformation': 'Travel Information',
    'privacy.technicalInformation': 'Technical Information',
    'privacy.name': 'Name',
    'privacy.emailAddress': 'Email address',
    'privacy.phoneNumber': 'Phone number',
    'privacy.dateOfBirth': 'Date of birth',
    'privacy.creditCardDetails': 'Credit card details',
    'privacy.billingAddress': 'Billing address',
    'privacy.paymentHistory': 'Payment history',
    'privacy.bookingHistory': 'Booking history',
    'privacy.travelPreferences': 'Travel preferences',
    'privacy.specialRequirements': 'Special requirements',
    'privacy.ipAddress': 'IP address',
    'privacy.browserType': 'Browser type',
    'privacy.deviceInformation': 'Device information',
    'privacy.usageAnalytics': 'Usage analytics',
    
    // Privacy Rights
    'privacy.accessData': 'Access your data',
    'privacy.rectifyInaccuracies': 'Rectify inaccuracies',
    'privacy.eraseData': 'Erase your data',
    'privacy.restrictProcessing': 'Restrict processing',
    'privacy.dataPortability': 'Data portability',
    'privacy.objectToProcessing': 'Object to processing',
    'privacy.withdrawConsent': 'Withdraw consent',
    'privacy.fileComplaint': 'File a complaint',
    
    // Privacy Sections
    'privacy.section1.title': '1. Introduction',
    'privacy.section1.content': 'Starlines ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, process, and protect your information when you use our website, mobile application, and services. We comply with applicable data protection laws including GDPR.',
    
    'privacy.section2.title': '2. Information We Collect',
    'privacy.section2.content': 'We collect information you provide directly (name, email, phone, payment details), information collected automatically (IP address, browser type, device information, usage data), and information from third parties (payment processors, social media platforms if you choose to connect).',
    
    'privacy.section3.title': '3. How We Use Your Information',
    'privacy.section3.content': 'We use your information to process bookings and payments, provide customer support, send booking confirmations and travel updates, improve our services, comply with legal obligations, prevent fraud and ensure security, and send marketing communications (with your consent).',
    
    'privacy.section4.title': '4. Information Sharing and Disclosure',
    'privacy.section4.content': 'We do not sell your personal information. We may share your information with service providers (payment processors, IT support), business partners (bus operators), legal authorities when required by law, and in case of business transfers (mergers, acquisitions).',
    
    'privacy.section5.title': '5. Data Security',
    'privacy.section5.content': 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, access controls, and regular security audits.',
    
    'privacy.section6.title': '6. Data Retention',
    'privacy.section6.content': 'We retain your personal data only as long as necessary for the purposes outlined in this policy or as required by law. Booking data is typically retained for 7 years for accounting and legal purposes. Marketing data is retained until you withdraw consent.',
    
    'privacy.section7.title': '7. Your Rights',
    'privacy.section7.content': 'Under GDPR and other applicable laws, you have the right to access, rectify, erase, restrict processing, data portability, object to processing, and withdraw consent. You can exercise these rights by contacting us at privacy@starlines.md.',
    
    'privacy.section8.title': '8. Cookies and Tracking',
    'privacy.section8.content': 'We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings. See our Cookie Policy for detailed information about the cookies we use.',
    
    'privacy.section9.title': '9. International Data Transfers',
    'privacy.section9.content': 'Your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards are in place, including adequacy decisions, standard contractual clauses, or other legally approved mechanisms.',
    
    'privacy.section10.title': '10. Children\'s Privacy',
    'privacy.section10.content': 'Our services are not directed to children under 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected such information, we will delete it promptly.',
    
    'privacy.section11.title': '11. Changes to Privacy Policy',
    'privacy.section11.content': 'We may update this Privacy Policy periodically. We will notify you of material changes by email or through our website. The updated policy will be effective when posted. Your continued use constitutes acceptance of changes.',
    
    'privacy.section12.title': '12. Contact Information',
    'privacy.section12.content': 'For privacy-related questions or to exercise your rights, contact our Data Protection Officer at privacy@starlines.md or write to us at: Starlines Data Protection, Str. Ismail 123, Chișinău MD-2001, Moldova.',
    
    // Refund Policy
    'refunds.title': 'Refund & Cancellation Policy',
    'refunds.subtitle': 'Understand our refund terms and cancellation procedures. We strive to provide fair and transparent refund policies for all our passengers.',
    'refunds.lastUpdated': 'Last updated: January 1, 2024',
    'refunds.version': 'Version 1.2',
    'refunds.refundSchedule': 'Refund Schedule',
    'refunds.quickNavigation': 'Quick Navigation',
    'refunds.requiredDocumentation': 'Required Documentation for Special Circumstances',
    'refunds.refundProcessingTimes': 'Refund Processing Times',
    'refunds.needHelpWithRefund': 'Need Help with Your Refund?',
    'refunds.customerServiceDescription': 'Our customer service team is ready to assist you with cancellations and refund requests.',
    'refunds.callCustomerService': 'Call Customer Service',
    'refunds.submitRefundRequest': 'Submit Refund Request',
    'refunds.hours': 'Hours: Monday-Friday 8:00 AM - 8:00 PM',
    'refunds.note': 'Note: All documentation must be official and verifiable. Photocopies or digital copies are acceptable for initial review, but original documents may be required.',
    
    // Refund Scenarios
    'refunds.standardCancellation': 'Standard Cancellation',
    'refunds.lateCancellation': 'Late Cancellation',
    'refunds.veryLateCancellation': 'Very Late Cancellation',
    'refunds.lastMinuteNoShow': 'Last Minute / No-Show',
    'refunds.timeframe': 'Timeframe',
    'refunds.refund': 'Refund',
    'refunds.fee': 'Fee',
    'refunds.processingFee': 'Processing Fee',
    'refunds.noRefund': 'No refund',
    'refunds.na': 'N/A',
    
    // Refund Sections
    'refunds.section1.title': '1. Refund Policy Overview',
    'refunds.section1.content': 'This Refund Policy outlines the terms and conditions for cancellations and refunds of bus tickets purchased through Starlines. We aim to provide fair and transparent refund terms while maintaining operational efficiency. Refund eligibility depends on the timing of cancellation and ticket type.',
    
    'refunds.section2.title': '2. Cancellation Timeframes',
    'refunds.section2.content': 'Refund eligibility is based on when you cancel your booking: More than 24 hours before departure (Full refund minus processing fee), 12-24 hours before departure (75% refund), 2-12 hours before departure (50% refund), Less than 2 hours before departure (No refund), No-show (No refund).',
    
    'refunds.section3.title': '3. Refund Processing',
    'refunds.section3.content': 'Approved refunds are processed within 7-10 business days to the original payment method. Processing fees of €2-€5 may apply depending on the payment method and cancellation timing. Refunds for cash payments are processed as bank transfers or vouchers.',
    
    'refunds.section4.title': '4. Non-Refundable Situations',
    'refunds.section4.content': 'Certain situations are not eligible for refunds: No-shows without prior notification, cancellations due to passenger misconduct, promotional or discounted tickets (unless specified), tickets purchased with vouchers or credits, force majeure events beyond our control.',
    
    'refunds.section5.title': '5. Special Circumstances',
    'refunds.section5.content': 'We may provide exceptions for: Medical emergencies (with valid documentation), Death in family (with death certificate), Military deployment (with official orders), Natural disasters affecting travel, Service cancellations by Starlines (full refund including fees).',
    
    'refunds.section6.title': '6. How to Request a Refund',
    'refunds.section6.content': 'To request a refund: Log into your account and find your booking, click "Cancel Booking" or "Request Refund", provide reason for cancellation, submit required documentation (if applicable), await confirmation email with refund details.',
    
    // Documentation Required
    'refunds.medicalEmergency': 'Medical Emergency',
    'refunds.deathInFamily': 'Death in Family',
    'refunds.militaryDeployment': 'Military Deployment',
    'refunds.naturalDisaster': 'Natural Disaster',
    'refunds.medicalCertificate': 'Medical certificate',
    'refunds.doctorsNote': 'Doctor\'s note',
    'refunds.hospitalDischargePapers': 'Hospital discharge papers',
    'refunds.deathCertificate': 'Death certificate',
    'refunds.proofOfRelationship': 'Proof of relationship',
    'refunds.officialDocumentation': 'Official documentation',
    'refunds.officialDeploymentOrders': 'Official deployment orders',
    'refunds.militaryId': 'Military ID',
    'refunds.commandAuthorization': 'Command authorization',
    'refunds.newsReports': 'News reports',
    'refunds.officialEvacuationOrders': 'Official evacuation orders',
    'refunds.governmentAdvisories': 'Government advisories',
    
    // Processing Times
    'refunds.creditCards': 'Credit Cards',
    'refunds.bankTransfers': 'Bank Transfers',
    'refunds.cashPayments': 'Cash Payments',
    'refunds.businessDays': 'business days',
    
    // Contact Info
    'refunds.phone': 'Phone',
    'refunds.email': 'Email',
    'refunds.phoneNumber': '+373 22 123 456',
    'refunds.emailAddress': 'refunds@starlines.md'
  }
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage or defaults
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('starlines-language');
    return saved && SUPPORTED_LANGUAGES.find(l => l.code === saved) ? saved : 'ro';
  });

  const [currentCurrency, setCurrentCurrency] = useState(() => {
    const saved = localStorage.getItem('starlines-currency');
    return saved && SUPPORTED_CURRENCIES.find(c => c.code === saved) ? saved : 'EUR';
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('starlines-language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('starlines-currency', currentCurrency);
  }, [currentCurrency]);

  const setLanguage = (code: string) => {
    if (SUPPORTED_LANGUAGES.find(l => l.code === code)) {
      setCurrentLanguage(code);
    }
  };

  const setCurrency = (code: string) => {
    if (SUPPORTED_CURRENCIES.find(c => c.code === code)) {
      setCurrentCurrency(code);
    }
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.flag || '🌐';
  };

  const getCurrencyName = (code: string) => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code)?.name || code;
  };

  const getCurrencySymbol = (code: string) => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code)?.symbol || code;
  };

  const getCurrencyFlag = (code: string) => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code)?.flag || '💱';
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES]?.[toCurrency as keyof typeof EXCHANGE_RATES];
    return rate ? amount * rate : amount;
  };

  const formatPrice = (amount: number, currency?: string, fromCurrency?: string): string => {
    const curr = currency || currentCurrency;
    const symbol = getCurrencySymbol(curr);
    
    // Convert amount if fromCurrency is different from current currency
    let convertedAmount = amount;
    if (fromCurrency && fromCurrency !== curr) {
      convertedAmount = convertCurrency(amount, fromCurrency, curr);
    }
    
    // Format based on currency
    switch (curr) {
      case 'EUR':
        return `${symbol}${convertedAmount.toFixed(2)}`;
      case 'USD':
        return `${symbol}${convertedAmount.toFixed(2)}`;
      case 'MDL':
        return `${convertedAmount.toFixed(2)} ${symbol}`;
      case 'RON':
        return `${convertedAmount.toFixed(2)} ${symbol}`;
      default:
        return `${symbol}${convertedAmount.toFixed(2)}`;
    }
  };

  const t = (key: string): string => {
    return translations[currentLanguage as keyof typeof translations]?.[key as keyof typeof translations.ro] || key;
  };

  const value: LocalizationContextType = {
    currentLanguage,
    setLanguage,
    getLanguageName,
    getLanguageFlag,
    currentCurrency,
    setCurrency,
    getCurrencyName,
    getCurrencySymbol,
    getCurrencyFlag,
    convertCurrency,
    formatPrice,
    t
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
