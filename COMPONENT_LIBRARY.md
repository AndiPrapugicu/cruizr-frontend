# 🚗 Cruizr UI Component Library

Component library complet și responsive pentru **Cruizr** - Car Dating App, construit cu React, TypeScript și Tailwind CSS.

## 📚 Cuprins

- [Structură](#structură)
- [Instalare & Setup](#instalare--setup)
- [Arhitectură - Atomic Design](#arhitectură---atomic-design)
- [Componente](#componente)
- [Responsive Design](#responsive-design)
- [Utilizare](#utilizare)
- [Best Practices](#best-practices)

## 🏗️ Structură

```
src/
├── components/
│   ├── atoms/           # Componente atomice de bază
│   ├── molecules/       # Combinații de atoms
│   ├── organisms/       # Componente complexe
│   ├── templates/       # Layout-uri responsive
│   └── index.ts         # Export centralizat
├── hooks/
│   ├── useMediaQuery.ts    # Hook pentru media queries
│   └── useDeviceDetect.ts  # Hook pentru detectare device
└── pages/              # Pagini ale aplicației
```

## 📦 Instalare & Setup

### Dependențe necesare

Toate dependențele sunt deja instalate în proiect:

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^12.16.0",
    "@heroicons/react": "^2.2.0",
    "tailwindcss": "^4.1.7"
  }
}
```

### Import componente

```tsx
// Import individual
import { Button, Input, Avatar } from '@/components/atoms';
import { Card, Modal, SearchBar } from '@/components/molecules';
import { ProfileCard, CarGrid } from '@/components/organisms';
import { ResponsiveLayout, BottomNavigation } from '@/components/templates';

// Import hooks
import { useResponsive, useDeviceDetect } from '@/hooks';
```

## 🎨 Arhitectură - Atomic Design

### ⚛️ Atoms (Componente Atomice)

Cele mai mici unități de UI, reutilizabile:

- **Button** - Butoane cu variante multiple
- **Input** - Input fields cu validare
- **Avatar** - Avatar cu status indicator
- **Badge** - Etichete și tags
- **Typography** - Text responsive
- **Spinner** - Loading indicators
- **Checkbox** - Checkboxuri custom
- **Switch** - Toggle switches
- **Icon** - Wrapper pentru icoane

### 🧬 Molecules (Componente Moleculare)

Combinații de atoms care formează elemente funcționale:

- **Card** - Container universal cu header/body/footer
- **SearchBar** - Căutare cu debounce
- **Modal** - Dialog-uri responsive
- **Toast** - Notificări animate
- **FormField** - Input cu label și validare
- **UserAvatar** - Avatar cu info utilizator
- **CarCard** - Card pentru mașini
- **TabBar** - Navigare cu tabs

### 🦠 Organisms (Componente Complexe)

Secțiuni complete de UI:

- **ProfileCard** - Card complex pentru profile
- **CarGrid** - Grid responsive pentru mașini
- **ChatList** - Listă de conversații
- **StoreGrid** - Grid pentru magazin

### 📐 Templates (Layout-uri)

Structuri de pagină complete:

- **ResponsiveLayout** - Layout principal adaptiv
- **TopHeader** - Header cu navigare
- **BottomNavigation** - Nav bar pentru mobile
- **PageContainer** - Wrapper pentru pagini

## 📱 Responsive Design

### Breakpoints

```typescript
{
  sm: '640px',   // Mobile large
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Desktop large
  '2xl': '1536px' // Desktop XL
}
```

### Hooks pentru Responsive

```tsx
import { useResponsive, useDeviceDetect } from '@/hooks';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const deviceInfo = useDeviceDetect();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### Principii Responsive

1. **Mobile First** - Design-ul pornește de la mobile
2. **Desktop Neschimbat** - Experiența desktop rămâne identică
3. **Progressive Enhancement** - Funcționalități adăugate progresiv
4. **Touch Friendly** - Butoane și zone de tap optimizate pentru mobile

## 🎯 Componente - Ghid de Utilizare

### Button

```tsx
import { Button } from '@/components/atoms';

<Button variant="primary" size="lg" fullWidth>
  Click me
</Button>

<Button 
  variant="outline" 
  leftIcon={<HeartIcon />}
  loading={isLoading}
>
  Like
</Button>
```

**Variante:** `primary`, `secondary`, `outline`, `ghost`, `danger`, `success`  
**Dimensiuni:** `xs`, `sm`, `md`, `lg`, `xl`

### Input

```tsx
import { Input } from '@/components/atoms';

<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  error={errors.email}
  leftIcon={<EnvelopeIcon />}
/>
```

### Card

```tsx
import { Card, CardHeader, CardBody } from '@/components/molecules';

<Card variant="elevated" padding="lg">
  <CardHeader 
    title="Profile" 
    subtitle="Edit your information"
    icon={<UserIcon />}
  />
  <CardBody>
    Content here
  </CardBody>
</Card>
```

### Modal

```tsx
import { Modal } from '@/components/molecules';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <div className="flex gap-2">
      <Button onClick={handleConfirm}>Confirm</Button>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
    </div>
  }
>
  Are you sure you want to continue?
</Modal>
```

### ProfileCard

```tsx
import { ProfileCard } from '@/components/organisms';

<ProfileCard
  profile={{
    id: '1',
    name: 'John Doe',
    age: 28,
    avatar: '/avatar.jpg',
    photos: ['/photo1.jpg', '/photo2.jpg'],
    bio: 'Car enthusiast',
    car: {
      make: 'BMW',
      model: 'M3',
      year: 2023
    },
    interests: ['Racing', 'Tuning'],
    isVIP: true
  }}
  onLike={(id) => handleLike(id)}
  onDislike={(id) => handleDislike(id)}
  showActions
/>
```

### ResponsiveLayout

```tsx
import { ResponsiveLayout } from '@/components/templates';

function App() {
  return (
    <ResponsiveLayout
      showHeader
      showBottomNav
      headerProps={{
        notificationCount: 5,
        onNotificationClick: handleNotifications
      }}
      sidebar={<Sidebar />}
      maxWidth="xl"
    >
      <PageContent />
    </ResponsiveLayout>
  );
}
```

### CarGrid

```tsx
import { CarGrid } from '@/components/organisms';

<CarGrid
  cars={[
    {
      id: '1',
      make: 'BMW',
      model: 'M3',
      year: 2023,
      image: '/car.jpg',
      badges: ['Tuned', 'Modified'],
      isVIP: true
    }
  ]}
  onCarClick={(id) => navigate(`/car/${id}`)}
  loading={isLoading}
/>
```

## 📖 Best Practices

### 1. Utilizare Consistentă a Variantelor

```tsx
// ✅ Good - Folosește variantele predefinite
<Button variant="primary">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>

// ❌ Bad - Nu customiza direct cu className excesiv
<Button className="bg-custom-color">Custom</Button>
```

### 2. Responsive Design

```tsx
// ✅ Good - Folosește hook-urile responsive
const { isMobile } = useResponsive();

return (
  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
    {items.map(item => <Card key={item.id} {...item} />)}
  </div>
);

// ✅ Good - Folosește clase Tailwind responsive
<Typography 
  variant="h1" 
  className="text-2xl md:text-4xl lg:text-5xl"
>
  Responsive Title
</Typography>
```

### 3. Composition Pattern

```tsx
// ✅ Good - Compune componente pentru flexibilitate
<Card>
  <CardHeader title="Title" action={<Button>Edit</Button>} />
  <CardBody>
    <UserAvatar name="John" subtitle="Online" />
  </CardBody>
</Card>
```

### 4. Loading States

```tsx
// ✅ Good - Oferă feedback vizual
<Button loading={isSubmitting}>
  Submit
</Button>

<CarGrid loading={isLoading} cars={cars} />
```

### 5. Accessibility

```tsx
// ✅ Good - Include labels și ARIA
<Input
  label="Email"
  aria-label="Email address"
  required
/>

<Button aria-label="Close modal">
  <XIcon />
</Button>
```

## 🎨 Customizare Teme

Culorile principale se definesc în `index.css`:

```css
:root {
  --color-primary: #ff5e3a;      /* Pink/Red gradient */
  --color-secondary: #3a86ff;    /* Blue */
  --color-accent: #ffc75f;       /* Yellow/Gold */
}
```

## 📱 Mobile-Specific Features

### Bottom Navigation

Afișată automat pe mobile (<768px):

```tsx
<ResponsiveLayout showBottomNav>
  {/* Bottom nav se arată automat pe mobile */}
</ResponsiveLayout>
```

### Touch Gestures

ProfileCard suportă swipe:

```tsx
<ProfileCard
  profile={profile}
  onLike={handleLike}
  onDislike={handleDislike}
  // Swipe left = dislike, Swipe right = like
/>
```

### Safe Area

Bottom Navigation respectă safe area pe dispozitive moderne:

```tsx
<BottomNavigation className="safe-area-bottom" />
```

## 🚀 Performance

- **Code Splitting** - Componentele se încarcă lazy
- **Memoization** - React.memo pentru componente costisitoare
- **Debouncing** - SearchBar folosește debounce
- **Optimized Images** - Folosește aspect-ratio pentru preveni layout shift

## 📄 License

Proprietary - Cruizr App © 2025

## 🤝 Contributing

Pentru contribuții, urmează ghidul:
1. Creează branch pentru feature
2. Respectă structura Atomic Design
3. Asigură responsive design
4. Testează pe mobile, tablet, desktop
5. Documentează componentele noi

---

**Made with ❤️ for Cruizr - The Car Dating App**
