# Ice Cream Distribution Control Center

AI-powered command center for managing youth ice cream sellers distributing via cycle refrigerators.

## Features

- **Admin Authentication** — JWT-based login with role-based access (super_admin, admin, manager)
- **Real-Time Dashboard** — Live KPIs: sellers, sales, revenue, inventory, wastage, alerts
- **Live Seller Tracking** — Interactive map with real-time GPS positions and status colors
- **Sales Analytics** — Revenue trends, area performance, peak hours, seller comparison
- **AI Flavor Intelligence** — Area-wise flavor popularity and stock recommendations
- **Inventory Management** — Products, flavors, stock assignment, low-stock alerts
- **Refrigerator Monitoring** — Digital verification with AI image analysis
- **Area Demand Heatmap** — Hot/normal/cold zone visualization
- **AI Predictions** — Tomorrow's demand, inventory needs, routes, revenue forecasts
- **Reports** — PDF/Excel export for sales, sellers, inventory, wastage, areas

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Leaflet |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB + Mongoose |
| Maps | OpenStreetMap via Leaflet (no API key required) |
| AI | Statistical ML engine for predictions & recommendations |

## Deploy Online (Public Link for Everyone)

**Get a live URL anyone can open from anywhere.**

### Fastest path (5 minutes after GitHub push)

1. Push this project to GitHub (see `DEPLOY.md`)
2. Double-click **`DEPLOY-ONLINE.bat`** or go to [Render Blueprint](https://dashboard.render.com/select-repo?type=blueprint)
3. Connect your GitHub repo → Click **Apply**
4. Wait 5–8 minutes → open your live URL

**Login:** `admin@icecream.com` / `admin123`

Full instructions: **[DEPLOY.md](./DEPLOY.md)**

## Office Presentation (One Link)

**Best for presenting at office on any laptop.**

1. Copy the project folder to the office laptop (USB / cloud)
2. Install Node.js LTS from https://nodejs.org (one-time)
3. **Double-click `START-PRESENTATION.bat`**
4. Share the link shown in the window:

| Audience | URL |
|----------|-----|
| You (on same laptop) | `http://localhost:5000` |
| Colleagues (same office WiFi) | `http://YOUR-LAPTOP-IP:5000` |

Login: `admin@icecream.com` / `admin123`

See **[OFFICE-PRESENTATION.md](./OFFICE-PRESENTATION.md)** for full step-by-step guide.

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- MongoDB (local or Docker)

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB URI and JWT secret.

**No MongoDB installed?** Use in-memory mode for quick local demo:

```bash
cd server
npm run dev:memory
```

This auto-seeds sample data on first start.

### 3. Seed sample data

```bash
npm run seed
```

### 4. Start development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Demo Login

| Email | Password | Role |
|-------|----------|------|
| admin@icecream.com | admin123 | super_admin |
| manager@icecream.com | manager123 | manager |

## Docker Deployment

```bash
docker-compose up -d
```

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Admin login |
| `GET /api/dashboard/stats` | Dashboard KPIs |
| `GET /api/sellers` | All sellers with GPS |
| `GET /api/sales/analytics` | Sales charts data |
| `GET /api/ai/flavor-intelligence` | AI flavor analysis |
| `GET /api/ai/predictions` | Demand predictions |
| `GET /api/inventory` | Product inventory |
| `GET /api/refrigerator` | Cooling reports |
| `GET /api/reports/:type` | Generate reports |
| `GET /api/reports/:type/download/:format` | PDF/Excel download (`format` = `pdf` or `excel`) |

## Project Structure

```
ice-cream-control-center/
├── client/          # React frontend
├── server/          # Express backend
├── docker-compose.yml
└── README.md
```

## License

MIT
