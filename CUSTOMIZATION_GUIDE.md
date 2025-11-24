# 🎨 Customization & Theming Guide

Ghid complet pentru customizarea culorilor, stilurilor și a temelor în Cruizr UI.

## 🌈 Sistema de Culori

### Culori Principale (CSS Variables)

Editează `src/index.css`:

```css
:root {
  /* Primary Colors - Pink/Red Gradient */
  --color-primary: #ff5e3a;
  --color-primary-dark: #e04d2a;
  --color-primary-light: #ff7557;
  
  /* Secondary Colors - Blue */
  --color-secondary: #3a86ff;
  --color-secondary-dark: #2a70e8;
  --color-secondary-light: #5299ff;
  
  /* Accent Colors - Yellow/Gold */
  --color-accent: #ffc75f;
  --color-accent-dark: #f5b84c;
  --color-accent-light: #ffd478;
  
  /* Neutral Colors */
  --color-bg-light: #f0f4f8;
  --color-bg-dark: #ffffff;
  --color-text-primary: #222831;
  --color-text-secondary: #555555;
  
  /* Status Colors */
  --color-success: #4ade80;
  --color-warning: #fbbf24;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### Folosire în Componente

```tsx
// Prin CSS variable
<div style={{ color: 'var(--color-primary)' }}>
  Colored Text
</div>

// Prin Tailwind (custom config)
<div className="text-cruizr-primary bg-cruizr-secondary">
  Custom colors
</div>
```

## 🎨 Extindere Tailwind Config

Creează/editează `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cruizr: {
          primary: {
            DEFAULT: '#ff5e3a',
            dark: '#e04d2a',
            light: '#ff7557',
          },
          secondary: {
            DEFAULT: '#3a86ff',
            dark: '#2a70e8',
            light: '#5299ff',
          },
          accent: {
            DEFAULT: '#ffc75f',
            dark: '#f5b84c',
            light: '#ffd478',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
```

## 🎯 Customizare Componente Specifice

### Button Custom Variant

```tsx
// Extinde Button component
import { Button, ButtonProps } from '@/components';

interface CustomButtonProps extends ButtonProps {
  gradient?: 'pink' | 'blue' | 'purple';
}

export const GradientButton: React.FC<CustomButtonProps> = ({
  gradient = 'pink',
  className = '',
  ...props
}) => {
  const gradients = {
    pink: 'bg-gradient-to-r from-pink-500 to-rose-500',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
  };

  return (
    <Button
      className={`${gradients[gradient]} text-white ${className}`}
      {...props}
    />
  );
};
```

### Card Custom Style

```tsx
import { Card } from '@/components';

export const GlassCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Card
      className="
        backdrop-blur-lg
        bg-white/30
        border border-white/20
        shadow-xl
      "
    >
      {children}
    </Card>
  );
};
```

### Avatar Custom Shapes

```tsx
import { Avatar } from '@/components';

export const SquareAvatar: React.FC<AvatarProps> = (props) => {
  return (
    <div className="rounded-lg overflow-hidden">
      <Avatar {...props} className="rounded-none" />
    </div>
  );
};

export const DiamondAvatar: React.FC<AvatarProps> = (props) => {
  return (
    <div className="rotate-45 overflow-hidden">
      <div className="-rotate-45">
        <Avatar {...props} />
      </div>
    </div>
  );
};
```

## 🌓 Dark Mode Support

### Setup Dark Mode

```tsx
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### Dark Mode Classes

```css
/* src/index.css */
:root {
  --color-bg: #ffffff;
  --color-text: #222831;
}

.dark {
  --color-bg: #1a1a1a;
  --color-text: #f0f0f0;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

### Dark Mode în Componente

```tsx
import { useTheme } from '@/contexts/ThemeContext';

export const ThemedCard = () => {
  const { theme } = useTheme();

  return (
    <Card
      className={`
        ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
      `}
    >
      Content
    </Card>
  );
};
```

## 🎭 Animații Custom

### Framer Motion Variants Custom

```tsx
import { motion } from 'framer-motion';

const customVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

export const AnimatedCard = ({ children }) => {
  return (
    <motion.div
      variants={customVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card>{children}</Card>
    </motion.div>
  );
};
```

### Hover Effects Custom

```tsx
export const InteractiveCard = ({ children, onClick }) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
    >
      <Card>{children}</Card>
    </motion.div>
  );
};
```

## 📱 Responsive Breakpoints Custom

### Custom Hook pentru Breakpoints Specifice

```tsx
// src/hooks/useCustomBreakpoints.ts
import { useMediaQuery } from './useMediaQuery';

export const useCustomBreakpoints = () => {
  const isSmallMobile = useMediaQuery('(max-width: 480px)');
  const isMobileLandscape = useMediaQuery('(max-height: 480px) and (orientation: landscape)');
  const isTabletPortrait = useMediaQuery('(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)');
  const isLargeDesktop = useMediaQuery('(min-width: 1920px)');

  return {
    isSmallMobile,
    isMobileLandscape,
    isTabletPortrait,
    isLargeDesktop,
  };
};
```

### Utilizare

```tsx
import { useCustomBreakpoints } from '@/hooks/useCustomBreakpoints';

export const ResponsiveComponent = () => {
  const { isSmallMobile, isLargeDesktop } = useCustomBreakpoints();

  return (
    <div className={`
      ${isSmallMobile ? 'p-2' : 'p-4'}
      ${isLargeDesktop ? 'max-w-7xl' : 'max-w-5xl'}
    `}>
      Content
    </div>
  );
};
```

## 🎨 Typography Custom

### Font Loading (Google Fonts)

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">
```

```css
/* src/index.css */
:root {
  font-family: 'Inter', system-ui, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Poppins', system-ui, sans-serif;
}
```

### Typography Variants Custom

```tsx
import { Typography, TypographyProps } from '@/components';

export const GradientText: React.FC<TypographyProps> = (props) => {
  return (
    <Typography
      {...props}
      className={`
        bg-gradient-to-r from-pink-500 to-purple-500
        bg-clip-text text-transparent
        ${props.className || ''}
      `}
    />
  );
};
```

## 🖼️ Icons Custom

### Icon Library Custom

```tsx
// src/components/icons/CustomIcons.tsx
export const CarIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

export const HeartFillIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);
```

## 🎁 Component Bundles

### Themed Component Set

```tsx
// src/components/themed/CruizrComponents.tsx
import { Button, Card, Avatar, Badge } from '@/components';

// Pre-configured components cu tema Cruizr
export const CruizrButton = (props) => (
  <Button
    {...props}
    className={`
      shadow-lg hover:shadow-xl
      transform hover:-translate-y-0.5
      transition-all duration-200
      ${props.className || ''}
    `}
  />
);

export const CruizrCard = (props) => (
  <Card
    {...props}
    variant="elevated"
    className={`
      hover:shadow-2xl
      transition-shadow duration-300
      ${props.className || ''}
    `}
  />
);
```

## 📦 Export Custom Components

```tsx
// src/components/custom/index.ts
export { GradientButton } from './GradientButton';
export { GlassCard } from './GlassCard';
export { ThemedCard } from './ThemedCard';
export { AnimatedCard } from './AnimatedCard';
export { GradientText } from './GradientText';

// Import în aplicație
import { GradientButton, GlassCard } from '@/components/custom';
```

---

**🎨 Continuă să customizezi și să creezi componente unice pentru Cruizr!**
