# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

//////////////////////////////

# Riff Finder 🎸

Riff Finder is a music discovery web app built with **React + TypeScript** that allows users to search artists, explore artist details (top tracks, albums, related artists), and generate recommendations using a rules-based discovery algorithm.

This project is designed with a **mock Spotify API layer** for local development and will later support full integration with the Spotify Web API.

---

## 🚀 Features

- 🔍 Artist search (name + genre matching)
- 🎤 Artist detail pages (genres, popularity, top tracks, albums)
- 🔗 Related artists browsing
- 🧠 Rules-based discovery recommendations (genre overlap + similarity scoring)
- ⚡ Fast API caching + loading states using TanStack Query
- 🎨 Responsive UI with TailwindCSS
- 🧪 Mock Spotify API layer (easy swap to real Spotify endpoints later)

---

## 🛠 Tech Stack

- **React**
- **TypeScript**
- **Vite**
- **React Router**
- **TanStack Query**
- **TailwindCSS**
- **Mock API layer (Spotify-style endpoints)**

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/tworoniak/riff-finder.git
cd riff-finder



src/
  api/
    endpoints.ts # Switchable mock/real API interface
    mockSpotify.ts # Mock Spotify-style API implementation
    queries.ts # TanStack query keys + query functions
    types.ts # Shared API data types
  hooks/
    useDebouncedValue.ts
  layouts/
    AppLayout.tsx
  pages/
    HomePage.tsx
    ArtistPage.tsx
    DiscoverPage.tsx
```
