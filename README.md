# React + TypeScript + Vite

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
```

---

## 🔄 Spotify API Integration (Planned)

Spotify is currently being integrated into this project using a serverless/local proxy token strategy (Client Credentials flow). The app is structured so that switching from mock data to real Spotify endpoints is seamless.

**Planned Spotify features include:**

- Real Spotify artist search + details
- Real top tracks + albums
- Real related artist discovery
- Audio previews and discovery queue
- Shareable discovery URLs

## 📁 Project Structure

src/

- api/
- discover.ts
  - endpoints.ts # Switchable mock/real API interface
  - mockSpotify.ts # Mock Spotify-style API implementation
  - queries.ts # TanStack query keys + query functions
  - spotify-token.ts
  - spotify.ts
  - types.ts # Shared API data types
- hooks/
  - useDebouncedValue.ts
- layouts/
  - AppLayout.tsx
- pages/
  - HomePage.tsx
  - ArtistPage.tsx
  - DiscoverPage.tsx

```

```
