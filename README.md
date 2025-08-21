# Starlines — Bus Travel Booking UI

A modern, responsive bus travel booking interface built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

### ✅ Implemented (MVP UI)
- **Design System**: Complete color scheme, typography, spacing, and component library
- **App Shell**: Header with navigation, language/currency selectors, mobile drawer
- **Home Page**: Hero search form, features section, popular routes, promo carousel, blog teasers, app CTA
- **Components**: SearchForm, Header, Footer, FeaturesSection, PopularRoutesSection, PromoCarousel, BlogTeasers, AppCTA
- **Utility Components**: PageHeader, EmptyState, ErrorState, Stepper
- **Mock Services**: Fake data for routes, cities, OTP verification, payment status, ticket lookup

### 🔄 In Progress
- Search results page with filters
- Trip details page
- Checkout flow with stepper
- Payment flow and status pages
- My tickets page
- Additional pages (Timetable, Blog, About, Contacts, FAQ, Legal)

### 📋 Planned
- Dark mode toggle
- i18n internationalization
- PWA capabilities
- Advanced filtering and sorting
- Seat selection interface

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives + shadcn/ui
- **Animations**: Framer Motion (ready for integration)

## 🎨 Design System

### Colors
- **Primary**: Indigo (#4F46E5) - easily rebrandable
- **Text**: Dark (#0B1220) / Light (#F5F7FB)
- **Surface**: Light (#F8FAFC) / Dark (#0F172A)
- **Feedback**: Success, Warning, Danger, Info

### Typography
- **Font**: Inter (system fallback)
- **Scale**: xs(12) → 5xl(48)
- **Line Height**: 1.4-1.6

### Spacing & Layout
- **Container**: max-w-[1200px]
- **Spacing**: 4/8/12/16/24/32/40
- **Radius**: md(10), lg(14), xl(20), 2xl(24)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd starlight-routes
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
bun run build
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Main navigation
│   ├── Footer.tsx      # Site footer
│   ├── HeroSection.tsx # Hero with search
│   ├── SearchForm.tsx  # Main search form
│   └── ...             # Other components
├── lib/                # Utilities and services
│   ├── mock-data.ts    # Mock data service
│   └── utils.ts        # Helper functions
├── pages/              # Page components
│   ├── Index.tsx       # Home page
│   └── NotFound.tsx    # 404 page
├── hooks/              # Custom React hooks
└── index.css           # Global styles & design system
```

## 🎯 Component Architecture

### Atoms
- Button, Input, Select, Checkbox, Badge, etc.

### Molecules
- SearchForm, DateRangePicker, PassengersPicker, etc.

### Organisms
- Header, Footer, ResultsList, CheckoutForm, etc.

### Layouts
- AppLayout, SidebarLayout, TwoColumns, etc.

## 🔧 Development

### Adding New Components

1. Create component file in `src/components/`
2. Follow naming convention: `PascalCase.tsx`
3. Use shadcn/ui components when possible
4. Follow the design system (colors, spacing, typography)
5. Add TypeScript interfaces for props

### Styling Guidelines

- Use Tailwind CSS classes
- Follow the design system spacing (4, 8, 12, 16, 24, 32, 40)
- Use CSS variables for colors: `bg-primary`, `text-foreground`
- Apply hover effects: `hover-lift` utility class
- Use focus styles: `focus-ring` utility class

### Mock Data

- All fake data is in `src/lib/mock-data.ts`
- Simulate API delays (400-800ms)
- Use realistic data structures
- Easy to replace with real API calls later

## 🌐 Internationalization

Ready for i18n with:
- Language switcher (RO/EN/RU/UA)
- Currency switcher (MDL/EUR/USD)
- Localized date/time formatting
- RTL support preparation

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)
- Mobile drawer navigation
- Responsive grid layouts
- Touch-friendly interactions

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check
```

## 📦 Deployment

The project builds to static files that can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 🤝 Contributing

1. Follow the existing code style
2. Use conventional commit messages
3. Test your changes thoroughly
4. Update documentation as needed

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the existing documentation
2. Review the component examples
3. Open an issue with detailed description

---

**Built with ❤️ for modern bus travel booking experiences**
