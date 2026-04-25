# Geo Collectibles Map App — MCP Instruction File
> Machine Configuration Protocol · Version 1.0 · April 2026

---

## Project Identity

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Name          | Geo Collectibles Map App                   |
| Codename      | `new_web`                                  |
| Type          | Interactive Geo-Game Web Application       |
| Framework     | Next.js 16.2.4 (App Router, Turbopack)     |
| Language      | TypeScript 5                               |
| Runtime       | React 19 / Node.js                         |
| Local URL     | http://localhost:3000                      |
| Dev Command   | `npm run dev`                              |
| Build Command | `npm run build`                            |
| Lint Command  | `npm run lint`                             |

---

## Vision & Purpose

A **mobile-first, futuristic dark-themed** interactive map game where the user moves around in the real world, spots collectibles placed on a map, navigates to them using real road-based routing, and collects them to earn points.

The UI aesthetic is inspired by sci-fi HUDs:
- Dark background (`#0b0f14`)
- Neon cyan accent (`#00ffd5`)
- Glassmorphism panels
- Smooth Anime.js animations

---

## Technology Stack

### Core
| Package           | Version  | Purpose                                      |
|-------------------|----------|----------------------------------------------|
| `next`            | 16.2.4   | App framework (App Router, SSR/CSR hybrid)   |
| `react`           | 19.2.4   | UI rendering                                 |
| `react-dom`       | 19.2.4   | DOM rendering + React Portals for map markers|
| `typescript`      | ^5       | Type safety                                  |

### Map Engine
| Package       | Version | Purpose                                          |
|---------------|---------|--------------------------------------------------|
| `maplibre-gl` | ^5.24.0 | Open-source WebGL map renderer (CartoDB tiles)   |

Map Style: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`

### State Management
| Package   | Version | Purpose                      |
|-----------|---------|------------------------------|
| `zustand` | ^5.0.12 | Global client-side state     |

### Animation
| Package            | Version | Purpose                                    |
|--------------------|---------|--------------------------------------------|
| `animejs`          | ^4.3.6  | JS-driven animations (v4 API — use `animate(target, props, opts)`, NOT `anime({...})`) |
| `@types/animejs`   | ^3.1.13 | Type definitions                           |

### UI / Styling
| Package                  | Version | Purpose                           |
|--------------------------|---------|-----------------------------------|
| `tailwindcss`            | ^4      | Utility CSS                       |
| `shadcn`                 | ^4.5.0  | Component library base            |
| `radix-ui`               | ^1.4.3  | Headless UI primitives            |
| `lucide-react`           | ^1.11.0 | Icon set                          |
| `class-variance-authority`| ^0.7.1 | Variant-based class management    |
| `clsx`                   | ^2.1.1  | Conditional class names           |
| `tailwind-merge`         | ^3.5.0  | Tailwind class merging            |

---

## Project Structure

```
new_web/
├── app/
│   ├── globals.css          # Dark theme CSS variables + MapLibre GL overrides
│   ├── layout.tsx           # Root layout (dark mode, full-screen body)
│   └── page.tsx             # Main page — assembles MapView + ControlPanel + ScoreDisplay
│
├── components/
│   ├── MapView.tsx          # Full-screen MapLibre GL map + marker portals + route rendering
│   ├── UserMarker.tsx       # Live user location marker (Iron Man superhero icon, floating animation)
│   ├── Collectible.tsx      # Collectible item marker with burst animation on collection
│   ├── ControlPanel.tsx     # Floating glass HUD panel (enable location, spawn, navigate)
│   ├── ScoreDisplay.tsx     # Score counter with pop animation on score change
│   └── ui/                  # Shadcn/Radix auto-generated UI primitives (map.tsx etc.)
│
├── store/
│   ├── useLocationStore.ts  # Zustand: userLocation, permissionState, mockLocation toggle
│   └── useGameStore.ts      # Zustand: score, collectibles[], currentTarget, routeData
│
├── lib/
│   ├── map.ts               # Haversine distance calc, COLLECTION_RADIUS_METERS, random coord gen
│   ├── animation.ts         # Anime.js v4 helpers: triggerCollectibleHoverAnim, triggerBurstAnim, triggerPopupScore
│   └── routing.ts           # fetchRoadRoute() — OSRM public API for real road-following routes
│
└── public/
    └── superhero.png        # Iron Man chibi icon used as the live user location marker
```

---

## Key Architecture Decisions

### 1. MapLibre + React Portals
MapLibre GL manages its own DOM canvas. Custom React components (`UserMarker`, `CollectibleNode`) are mounted into MapLibre `Marker` elements using **React Portals** (`createPortal`). This lets React animate and manage marker UI while MapLibre handles geographic positioning.

### 2. Map Initialization Guard
The map container must have **explicit `width: 100%` / `height: 100%` inline styles** (not just Tailwind classes) for MapLibre's canvas to size correctly. A `map.current.resize()` call is fired on the `load` event as a safety measure.

### 3. Opacity Fade-In
The map container starts at `opacity: 0` and transitions to `opacity: 1` via a CSS `transition` triggered by `mapLoaded` state (set after `style.load` fires). Do NOT use Anime.js to animate the map container opacity — it crashes before the map DOM is ready.

### 4. Anime.js v4 API
**CRITICAL:** Anime.js v4 (installed) uses a completely different API from v3:
```ts
// ✅ CORRECT (v4)
import { animate } from 'animejs';
animate(element, { opacity: [0, 1] }, { duration: 500 });

// ❌ WRONG (v3 style — will crash)
import anime from 'animejs';
anime({ targets: element, opacity: 1 });
```

### 5. Real Road Routing (OSRM)
`lib/routing.ts` calls the **free OSRM public API** (no key needed):
```
https://router.project-osrm.org/route/v1/walking/{lng},{lat};{lng},{lat}?overview=full&geometries=geojson
```
Returns a GeoJSON `LineString` that follows real roads/walkways. Falls back to a straight line on network error.

### 6. Zustand Stores
- **`useLocationStore`** — tracks `userLocation: { lat, lng } | null`, permission state, and mock location mode
- **`useGameStore`** — tracks `collectibles[]`, `currentTarget`, `routeData` (GeoJSON), and `score`

---

## Design System

### Color Palette
| Token        | Value       | Usage                              |
|--------------|-------------|------------------------------------|
| `--background`| `#0b0f14`  | App background, map overlay        |
| `--primary`  | `#00ffd5`   | Neon cyan accent, route line, glow |
| `--secondary`| `#1e293b`   | Panel backgrounds                  |
| `--text`     | `#e2e8f0`   | Body text                          |

### UI Patterns
- **Glassmorphism panels**: `backdrop-blur-md`, semi-transparent dark backgrounds, `border: 1px solid rgba(0,255,213,0.3)`
- **Glow effects**: `box-shadow: 0 0 20px rgba(0,255,213,0.5)`
- **Floating animations**: CSS keyframes (`ghost-float`, `ghost-shadow-pulse`, `ghost-glow`) injected once into `document.head`
- **Map route line**: Two stacked MapLibre layers — a wide blurred glow underlay + a crisp 4px main line, both `#00ffd5`

---

## Gameplay Loop

```
1. User opens app → MapLibre map loads (dark matter style, NYC default center)
2. User clicks "Enable Location" OR "Use Mock Location"
   → userLocation set in useLocationStore
   → Iron Man marker appears on map, map flies to user position
3. User clicks "Spawn Collectibles"
   → Random collectibles generated around user coords (useGameStore)
   → CollectibleNode markers appear on map via React Portals
4. User clicks a collectible
   → OSRM API called → real road route drawn on map as neon line
   → currentTarget set in useGameStore
5. User "walks" to collectible (in real life; or simulated via mock location)
   → Distance checked via Haversine in useEffect
   → If within COLLECTION_RADIUS_METERS → burst animation plays → score increments
6. Route clears, collectible removed, score updates with pop animation
```

---

## Known Patterns & Gotchas

| Issue | Solution |
|-------|----------|
| MapLibre canvas renders at 0×0 | Always set `width`/`height` as inline styles on the container div |
| Anime.js `anime is not a function` | Use named `animate` import from `animejs` v4 |
| Anime.js `Cannot read 'keyframes'` | Pass args as `animate(target, keyframes, options)` — NOT a single config object |
| React `setState in useEffect` lint warns | Use `useRef` flags instead of secondary `useState` to track animation triggers |
| MapLibre marker positioning | Use `anchor: 'bottom'` on `new maplibregl.Marker()` so icon feet sit on the coordinate |

---

## Development Commands

```bash
# Start dev server (Turbopack)
npm run dev

# Lint check
npm run lint

# Production build
npm run build
```

---

## Future Roadmap

- [ ] Real GPS movement simulation (animate mock location along a path)
- [ ] Collectible rarity tiers (common / rare / legendary) with different icons
- [ ] Leaderboard using a backend (e.g. Supabase)
- [ ] AR camera overlay mode
- [ ] Sound effects on collection
- [ ] Push notifications when near a collectible
