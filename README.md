# 🚗 Cruizr - Car Dating App

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.3-646cff.svg)](https://vitejs.dev)

Modern, fully responsive car dating app frontend cu sistem complet de componente UI bazat pe Atomic Design.

## ✨ Features

- 🎨 **Component Library Complet** - 25+ componente organizate după Atomic Design
- 📱 **Fully Responsive** - Optimizat pentru mobile, tablet și desktop
- ⚛️ **TypeScript** - 100% type-safe
- 🎭 **Framer Motion** - Animații fluide și interactive
- 🎨 **Tailwind CSS** - Styling modern și customizabil
- 🔥 **Hot Module Replacement** - Development experience excelent
- 📦 **Tree Shaking** - Bundle size optimizat

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/AndiPrapugicu/cruizr-frontend.git
   cd cruizr-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   App disponibil la: `http://localhost:5173`

5. **View component showcase**
   ```
   http://localhost:5173/showcase
   ```

## 📚 Documentation

### Complete Guides

- 📘 **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** - Documentație completă componente
- 🚀 **[QUICK_START.md](./QUICK_START.md)** - Setup rapid și exemple
- 🔄 **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migrare pagini existente
- 🎨 **[CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md)** - Theming și customizare
- 📋 **[INDEX.md](./INDEX.md)** - Index complet resurse

### Quick Links

- [Lista componentelor](./COMPONENT_LIBRARY.md#-componente---ghid-de-utilizare)
- [Exemple de cod](./src/examples/ComponentExamples.tsx)
- [Demo interactiv](./src/pages/ComponentShowcase.tsx)
- [Responsive patterns](./MIGRATION_GUIDE.md#-pattern-uri-responsive-comune)

## 🎨 Component Library

### Atoms (9)
`Avatar` · `Badge` · `Button` · `Checkbox` · `Icon` · `Input` · `Spinner` · `Switch` · `Typography`

### Molecules (8)
`Card` · `CarCard` · `FormField` · `Modal` · `SearchBar` · `TabBar` · `Toast` · `UserAvatar`

### Organisms (4)
`CarGrid` · `ChatList` · `ProfileCard` · `StoreGrid`

### Templates (4)
`BottomNavigation` · `PageTransition` · `ResponsiveLayout` · `TopHeader`

### Usage Example

```tsx
import { ResponsiveLayout, PageContainer, Button, Card } from '@/components';
import { useResponsive } from '@/hooks/useMediaQuery';

export default function MyPage() {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveLayout showHeader showBottomNav>
      <PageContainer title="My Page">
        <Card>
          <h2>Welcome to Cruizr</h2>
          <Button variant="primary" size={isMobile ? 'md' : 'lg'}>
            Get Started
          </Button>
        </Card>
      </PageContainer>
    </ResponsiveLayout>
  );
}
```

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Features

- ✅ Mobile-first design
- ✅ Adaptive layouts (bottom nav pe mobile)
- ✅ Touch-friendly components
- ✅ Responsive typography
- ✅ Flexible grid systems

## 🛠️ Tech Stack

- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 6.3** - Build tool & dev server
- **Tailwind CSS 4.1** - Utility-first CSS
- **Framer Motion 12** - Animations
- **React Router 7** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication

## 🏗️ Project Structure

```
cruizr-frontend/
├── src/
│   ├── components/          # Component Library (Atomic Design)
│   │   ├── atoms/           # Basic UI elements (Button, Input, etc.)
│   │   ├── molecules/       # Compound components (Card, Modal, etc.)
│   │   ├── organisms/       # Complex components (CarGrid, ProfileCard, etc.)
│   │   ├── templates/       # Page layouts (ResponsiveLayout, etc.)
│   │   └── index.ts         # Central export point
│   ├── hooks/               # Custom React hooks
│   │   ├── useMediaQuery.ts # Responsive breakpoints
│   │   └── useDeviceDetect.ts # Device detection
│   ├── pages/               # Route page components
│   ├── contexts/            # React contexts (Auth, Notifications)
│   ├── services/            # API services & HTTP clients
│   ├── types/               # TypeScript type definitions
│   └── assets/              # Static assets (images, icons)
├── public/                  # Public static files
└── [docs]/                  # Documentation (5 MD files)
```

## 🏭 Build

Build pentru producție:

```bash
npm run build
```

Fișierele generate vor fi în directorul `dist/`.

## 🔒 Security & Best Practices

- Toate datele sensibile (API keys, tokens) sunt în `.env`
- Fișierele `.env` **NU** sunt committed în repository
- Folosește `.env.example` ca template pentru variabilele necesare
- Path aliases configurate: `@/components`, `@/hooks` pentru import-uri clean

## 🤝 Contributing

1. Fork repository-ul
2. Creează branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Deschide Pull Request

## 📄 License

Acest proiect este proprietate privată. Toate drepturile rezervate.

---

**Dezvoltat cu ❤️ pentru comunitatea Cruizr**
