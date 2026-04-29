# Geo Collect: Hunt & Collect

![Geo Collect Banner](/public/auth_bg.png)

> **A Real-World Interactive Location-Based Experience**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📖 Project Description

Geo Collect is a modern, high-performance geospatial game engine that blends real-world exploration with engaging collectible mechanics. Built with a sleek cyber-aesthetic and powered by Next.js and Supabase, players explore their physical surroundings (mapped digitally) to collect characters, acquire powers, and unlock hidden zones.

## 🎮 Game Concept

The world is your inventory. By physically navigating the real world or exploring the interactive map, players discover collectibles that range from recognizable characters (like Batman, Spiderman) to powerful abilities (Thunder, Dragon, Shield). Energy is consumed as you travel and recharges over time. Progressing through the game unlocks new map zones, yielding rarer collectibles and higher score multipliers.

## ✨ Features

- **Real-world location-based gameplay**: Explore a dynamic map integrated directly with real-world geography.
- **Character collection system**: Find, collect, and switch your avatar to legendary characters.
- **Power acquisition system**: Stack and activate powers like Thunder, Dragon, or Radar.
- **Energy-based movement**: Strategic movement mechanics tied to a replenishing energy bar.
- **Zone unlocking**: Discover new territories as you level up.
- **Multi-route navigation**: Advanced routing engine showing optimal paths to collectibles.
- **Admin-controlled collectible placement**: Tools for manual management and dynamic spawning.

## 🚀 Gameplay Overview

1. **Initialize**: Log in and select your starter avatar (Male/Female).
2. **Explore**: Observe the map and identify nearby Collectible Markers.
3. **Navigate**: Use the routing engine to find the best path to your target.
4. **Collect**: Reach the destination to earn points, level up, and acquire the character/power.
5. **Progress**: Gain enough XP to level up, expanding your energy pool and unlocking restricted zones.

## 🛠 Technology Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Vanilla CSS Modules (Glassmorphism & Cyber UI)
- **State Management**: Zustand (Modular stores for Game, Avatar, Energy, Location)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth)
- **Map Engine**: Leaflet / React-Leaflet
- **Icons**: Lucide React

## 🏗 Architecture Overview

The codebase is organized following a strict modular architecture:
- `components/`: UI layer (MapView, ControlPanel, AuthModal, EnergyBar).
- `store/`: State management grouped by domain (`useGameStore`, `useAvatarStore`).
- `lib/`: Core systems and utilities (`routing.ts`, `zones.ts`, `supabase.ts`).
- `app/api/`: Secure server routes handling progression sync and authentication handshakes.

## ⚙️ Installation Steps

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables template and configure your Supabase instance:
   ```bash
   cp .env.example .env.local
   ```
4. Update `.env.local` with your Supabase URL and keys.

## 💻 Development Setup

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the game engine in action.

## 🗺 Future Roadmap

- [ ] Multiplayer live-tracking (see other players on the map).
- [ ] PvP Power interactions (use collected powers on other players).
- [ ] Advanced AR (Augmented Reality) view for collectible capture.
- [ ] Push notifications for idle energy recharge completion.

## 🤝 Credits

- Map data provided by OpenStreetMap.
- Routing powered by OSRM.

## 👨‍💻 About the Creator

**Your Name**  
*Full Stack Developer*  
Developer building real-world interactive location-based experiences.

🔗 [GitHub](#) | 🔗 [LinkedIn](#) | 🔗 [Portfolio](#)
