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
  formatPrice: (amount: number, currency?: string) => string;
  
  // Localization
  t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Translations
const translations = {
  ro: {
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
    'search.to': 'Unde',
    'search.departure': 'Data plecării',
    'search.return': 'Data întoarcerii',
    'search.passengers': 'Pasageri',
    'search.baggage': 'Bagaje',
    'search.oneWay': 'Dus',
    'search.roundTrip': 'Dus-întors',
    'search.searchTickets': 'Caută Bilete',
    'search.popularRoutes': 'Rute Populare',
    'search.selectDate': 'Selectează data',
    'search.selectPassengers': 'Selectează numărul de pasageri',
    'search.selectBaggage': 'Selectează bagajele',
    
    // Index Page
    'index.whatToDo': 'Ce vrei să faci?',
    'index.chooseAction': 'Alege acțiunea principală pe care vrei să o faci. Toate sunt simple și clare!',
    'index.bookTicket': 'Rezervă Bilet',
    'index.bookTicketDesc': 'Rezervă-ți locul în autobuz pentru călătoria ta',
    'index.bookNow': 'Rezervă Acum',
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
    
    // Transport Routes
    'transport.title': 'Rute de Transport',
    'transport.description': 'Descoperă și rezervă rute de autobuz prin Europa cu Starlines și partenerii InfoBus',
    'transport.home': 'Acasă',
    'transport.routes': 'Rute de Transport',
    'transport.searchPlaceholder': 'Caută rute...',
    'transport.from': 'De la',
    'transport.to': 'Către',
    'transport.operator': 'Operator',
    'transport.priceRange': 'Interval Preț',
    'transport.sortBy': 'Sortează după',
    'transport.viewMode': 'Mod vizualizare',
    'transport.listView': 'Vizualizare listă',
    'transport.mapView': 'Vizualizare hartă',
    'transport.popular': 'Popular',
    'transport.viewDetails': 'Vezi Detalii',
    'transport.bookNow': 'Rezervă Acum',
    'transport.noRoutesFound': 'Nu s-au găsit rute',
    'transport.noRoutesDesc': 'Încearcă să ajustezi criteriile de căutare sau filtrele pentru a găsi rute disponibile.',
    'transport.clearFilters': 'Șterge Toate Filtrele',
    'transport.mapViewTitle': 'Vizualizare Hartă Interactivă',
    'transport.mapViewDesc': 'Vizualizarea pe hartă va fi implementată aici, arătând vizualizarea rutelor prin Europa.',
    'transport.switchToList': 'Comută la Vizualizarea Listă',
    'transport.cantFindRoute': 'Nu poți găsi ruta pe care o cauți?',
    'transport.contactService': 'Contactează echipa noastră de servicii pentru clienți pentru a solicita rute personalizate sau pentru a obține asistență cu planurile tale de călătorie.',
    'transport.requestCustom': 'Solicită Rută Personalizată',
    'transport.contactSupport': 'Contactează Suportul',
    
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
    
    // Forms
    'form.firstName': 'Prenume',
    'form.lastName': 'Nume',
    'form.email': 'Email',
    'form.phone': 'Telefon',
    'form.password': 'Parolă',
    'form.confirmPassword': 'Confirmă Parola',
    'form.required': 'Obligatoriu',
    'form.optional': 'Opțional'
  },
  ru: {
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
    'search.to': 'Куда',
    'search.departure': 'Дата отправления',
    'search.return': 'Дата возвращения',
    'search.passengers': 'Пассажиры',
    'search.baggage': 'Багаж',
    'search.oneWay': 'В одну сторону',
    'search.roundTrip': 'Туда-обратно',
    'search.searchTickets': 'Найти Билеты',
    'search.popularRoutes': 'Популярные Маршруты',
    'search.selectDate': 'Выберите дату',
    'search.selectPassengers': 'Выберите количество пассажиров',
    'search.selectBaggage': 'Выберите багаж',
    
    // Index Page
    'index.whatToDo': 'Что вы хотите сделать?',
    'index.chooseAction': 'Выберите основное действие, которое хотите выполнить. Все просто и понятно!',
    'index.bookTicket': 'Забронировать Билет',
    'index.bookTicketDesc': 'Забронируйте место в автобусе для вашей поездки',
    'index.readyBookNow': 'Забронировать Сейчас',
    'index.readyViewRoutes': 'Посмотреть Маршруты',
    
    // Transport Routes
    'transport.title': 'Маршруты Транспорта',
    'transport.description': 'Откройте для себя и забронируйте автобусные маршруты по Европе с Starlines и партнерами InfoBus',
    'transport.home': 'Главная',
    'transport.routes': 'Маршруты Транспорта',
    'transport.searchPlaceholder': 'Поиск маршрутов...',
    'transport.from': 'Откуда',
    'transport.to': 'Куда',
    'transport.operator': 'Оператор',
    'transport.priceRange': 'Диапазон Цен',
    'transport.sortBy': 'Сортировать по',
    'transport.viewMode': 'Режим просмотра',
    'transport.listView': 'Просмотр списка',
    'transport.mapView': 'Просмотр карты',
    'transport.popular': 'Популярный',
    'transport.viewDetails': 'Посмотреть Детали',
    'transport.bookNow': 'Забронировать Сейчас',
    'transport.noRoutesFound': 'Маршруты не найдены',
    'transport.noRoutesDesc': 'Попробуйте скорректировать критерии поиска или фильтры, чтобы найти доступные маршруты.',
    'transport.clearFilters': 'Очистить Все Фильтры',
    'transport.mapViewTitle': 'Интерактивный Просмотр Карты',
    'transport.mapViewDesc': 'Просмотр карты будет реализован здесь, показывая визуализацию маршрутов по Европе.',
    'transport.switchToList': 'Переключиться на Просмотр Списка',
    'transport.cantFindRoute': 'Не можете найти нужный маршрут?',
    'transport.contactService': 'Свяжитесь с нашей командой обслуживания клиентов, чтобы запросить индивидуальные маршруты или получить помощь с планами путешествий.',
    'transport.requestCustom': 'Запросить Индивидуальный Маршрут',
    'transport.contactSupport': 'Связаться с Поддержкой',
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
    
    // Forms
    'form.firstName': 'Имя',
    'form.lastName': 'Фамилия',
    'form.email': 'Электронная почта',
    'form.phone': 'Телефон',
    'form.password': 'Пароль',
    'form.confirmPassword': 'Подтвердите Пароль',
    'form.required': 'Обязательно',
    'form.optional': 'Необязательно'
  },
  en: {
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
    'search.to': 'To',
    'search.departure': 'Departure Date',
    'search.return': 'Return Date',
    'search.passengers': 'Passengers',
    'search.baggage': 'Baggage',
    'search.oneWay': 'One Way',
    'search.roundTrip': 'Round Trip',
    'search.searchTickets': 'Search Tickets',
    'search.popularRoutes': 'Popular Routes',
    'search.selectDate': 'Select date',
    'search.selectPassengers': 'Select number of passengers',
    'search.selectBaggage': 'Select baggage',
    
    // Index Page
    'index.whatToDo': 'What do you want to do?',
    'index.chooseAction': 'Choose the main action you want to perform. All are simple and clear!',
    'index.bookTicket': 'Book Ticket',
    'index.bookTicketDesc': 'Book your seat on the bus for your journey',
    'index.readyBookNow': 'Book Now',
    'index.readyViewRoutes': 'View Routes',
    
    // Transport Routes
    'transport.title': 'Transport Routes',
    'transport.description': 'Discover and book bus routes across Europe with Starlines and InfoBus partners',
    'transport.home': 'Home',
    'transport.routes': 'Transport Routes',
    'transport.searchPlaceholder': 'Search routes...',
    'transport.from': 'From',
    'transport.to': 'To',
    'transport.operator': 'Operator',
    'transport.priceRange': 'Price Range',
    'transport.sortBy': 'Sort by',
    'transport.viewMode': 'View mode',
    'transport.listView': 'List View',
    'transport.mapView': 'Map View',
    'transport.popular': 'Popular',
    'transport.viewDetails': 'View Details',
    'transport.bookNow': 'Book Now',
    'transport.noRoutesFound': 'No routes found',
    'transport.noRoutesDesc': 'Try adjusting your search criteria or filters to find available routes.',
    'transport.clearFilters': 'Clear All Filters',
    'transport.mapViewTitle': 'Interactive Map View',
    'transport.mapViewDesc': 'Map view will be implemented here showing route visualization across Europe.',
    'transport.switchToList': 'Switch to List View',
    'transport.cantFindRoute': 'Can\'t find the route you\'re looking for?',
    'transport.contactService': 'Contact our customer service team to request custom routes or get assistance with your travel plans.',
    'transport.requestCustom': 'Request Custom Route',
    'transport.contactSupport': 'Contact Support',
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
    
    // Forms
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.password': 'Password',
    'form.confirmPassword': 'Confirm Password',
    'form.required': 'Required',
    'form.optional': 'Optional'
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

  const formatPrice = (amount: number, currency?: string): string => {
    const curr = currency || currentCurrency;
    const symbol = getCurrencySymbol(curr);
    
    // Format based on currency
    switch (curr) {
      case 'EUR':
        return `${symbol}${amount.toFixed(2)}`;
      case 'USD':
        return `${symbol}${amount.toFixed(2)}`;
      case 'MDL':
        return `${amount.toFixed(2)} ${symbol}`;
      case 'RON':
        return `${amount.toFixed(2)} ${symbol}`;
      default:
        return `${symbol}${amount.toFixed(2)}`;
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
