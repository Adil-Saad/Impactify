<div align="center">

# 🍃 GoKind
### *Acts of kindness near you.*

**GoKind** is a gorgeous, community-driven Progressive Web App (PWA) that connects people who need help with local community members willing to lend a hand. Built on a modern Next.js and Supabase stack, it features Tinder-style swipeable quest discovery, a live interactive "Kindness Pulse" map, and real-time multiplayer notifications.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Architecture](#-architecture)

</div>

---

## ✨ Features

- **Tinder-Style Discovery:** Swipe right to accept a quest, or swipe left to skip. Fluid, native-feeling animations using Framer Motion.
- **Live Kindness Pulse Map:** A beautiful, dark-themed interactive map that displays local quests. Watch the map come alive with pulsing glowing rings when a new quest is posted or accepted in real time.
- **Real-Time Notifications:** Stay in the loop with instant, database-backed notifications when someone posts a quest nearby or accepts yours.
- **Quest Creation & Photo Uploads:** Seamlessly post a quest, snap a photo, and pin the exact location using OpenStreetMap Nominatim autocomplete.
- **Fully Containerised:** The entire stack—Next.js frontend and the complete Supabase backend suite—runs gracefully in Docker Compose for one-command production deployment.
- **Modern Auth:** Secure Email/Password and Magic Link authentication, elegantly handled SSR-side by Supabase.

---

## 🛠 Tech Stack

### Frontend (PWA)
- **Framework:** Next.js 15 (App Router, Server Actions)
- **Styling:** Tailwind CSS (Fluid, glassmorphism, rich gradients)
- **Animations:** Framer Motion
- **Map Integration:** React Leaflet & OpenStreetMap (No API keys needed)
- **Icons:** Lucide React

### Backend (Supabase)
- **Database:** PostgreSQL (with PostGIS for future spatial queries)
- **Auth:** Supabase Auth (SSR configured)
- **Storage:** Supabase Storage (Public buckets for Quest Photos)
- **Realtime:** Supabase Realtime (Multiplayer map pulses & notification events)

### Infrastructure
- **Deployment:** Docker & Docker Compose (Multi-stage Next.js standalone builds)
- **Proxy/Tunneling:** Next.js proxy rewrite mapping frontend requests directly to the internal Docker network. Tested with Cloudflare Tunnels (`cloudflared`).

---

## 🚀 Quick Start (Local & Production Server)

We've designed this repository to spin up instantly using Docker Compose, bundling both the Next.js app and the local Supabase CLI stack.

### Prerequisites
- [Docker & Docker CLI](https://docs.docker.com/engine/install/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`)
- Node.js & npm (for package management)

### 1. Start the Database & Backend
First, spin up the Supabase backend stack using the CLI. This sets up PostgreSQL, Auth, Storage, and Realtime on your local machine.
```bash
npx supabase start
```
*Note: This will output your local API URLs and keys. You don't need to manually copy them, as the frontend Docker Compose file automatically pulls them!*

### 2. Apply Database Migrations (Optional)
If the tables aren't perfectly seeded, reset the database to apply the latest schemas and Row Level Security (RLS) policies:
```bash
npx supabase db reset
```

### 3. Spin up the App
Run the frontend Docker Compose file to build the Next.js standalone container and join it to the Supabase network.
```bash
docker compose up --build -d
```

### 4. Visit the App
You are live! Open your browser to:
[**http://localhost:43000**](http://localhost:43000)

---

## 🏗 Architecture & Configuration

### Networking & Proxies
To ensure the app can be served seamlessly behind a Cloudflare Tunnel (e.g., `gokind.flatsync.app`) without complex CORS issues, the PWA implements a Next.js proxy rewrite. 

All browser requests to `/supabase/*` are intercepted by the Next.js Node server and securely forwarded to `http://supabase_kong_gokind:8000` on the internal Docker network (`supabase_network_gokind`).

### Storage & Images
When a user uploads a photo, it is uploaded to the Supabase `quest-photos` bucket. The app converts the internal Docker hostname to a relative proxy URL (`/supabase/storage/v1/object/public/...`) before saving it to the database, ensuring images load correctly locally and across the internet.

### Row Level Security (RLS)
The database is secured by default. 
- *Anyone* can view public `quests`.
- *Only Authenticated users* can insert a new quest.
- *Any Authenticated user* can update an `open` quest's status to `active` to claim it.
- *Users* exclusively own and manage their read/unread states in `user_notifications`.

---

## 📂 Project Structure

```text
gokind/
├── docker-compose.yml       # Frontend container config & network joining
├── dockerfile               # Multi-stage resilient Next.js production build
├── next.config.ts           # Standalone config and /supabase proxy rewrite
├── src/
│   ├── app/                 # Next.js App Router Pages
│   │   ├── (main)/          # PWA Core (Browse, Map, Profile, Post)
│   │   └── login/           # Auth flow
│   ├── components/          # React components
│   │   ├── cards/           # Swipeable Tinder Cards
│   │   ├── layout/          # Navigation, Headers & DB Notifications
│   │   └── map/             # Leaflet Kindness Pulse map
│   └── utils/
│       └── supabase/        # Supabase SSR clients (Client / Server / Middleware)
└── supabase/
    ├── config.toml          # Local Supabase settings (Auth rates, SMTP)
    └── migrations/          # PostgreSQL schemas, Tables, Storage, Triggers, RLS
```

---

<div align="center">
  <p>Built with 🩵 for local communities.</p>
</div>
