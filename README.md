# Auto-Match Frontend (Cruizr)

Car dating app frontend built with React, TypeScript, and Vite.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000` (or configure `VITE_API_URL`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AndiPrapugicu/cruizr-frontend.git
   cd auto-match-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your configuration:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```
   
   ⚠️ **Important:** Never commit your `.env` file! It's already in `.gitignore`.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── onboarding/  # Onboarding flow components
│   └── ...
├── pages/           # Page components
├── contexts/        # React contexts (Auth, Notifications, etc.)
├── hooks/           # Custom React hooks
├── services/        # API services
├── types/           # TypeScript type definitions
└── assets/          # Static assets
```

## 🔒 Security

- All sensitive data (API keys, tokens) are stored in `.env` files
- `.env` files are **NOT** committed to the repository
- Use `.env.example` as a template for required environment variables

## 🛠️ Tech Stack

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Socket.io** - Real-time features

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
