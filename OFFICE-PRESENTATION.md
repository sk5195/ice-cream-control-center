# Office Presentation Guide

Use this when presenting on your **office laptop** (not your personal laptop).

## Before you go to office (on your personal laptop)

1. Copy the entire `ice-cream-control-center` folder to a **USB drive** or **Google Drive/OneDrive**
2. Make sure the folder includes everything (client, server, START-PRESENTATION.bat)

## On office laptop (5 minutes setup)

### Step 1: Install Node.js (one-time only)

If Node.js is not installed on the office laptop:

1. Go to https://nodejs.org
2. Download **LTS** version
3. Install with default options
4. Restart the laptop

### Step 2: Copy project folder

Copy `ice-cream-control-center` from USB/cloud to the office laptop (e.g. Desktop)

### Step 3: Start the presentation

**Double-click:** `START-PRESENTATION.bat`

Wait 1-2 minutes on first run (downloads packages + builds website).

You will see:

```
==================================================
  ICE CREAM CONTROL CENTER - READY
==================================================
  On this laptop:     http://localhost:5000
  Share with office:  http://192.168.x.x:5000
  Login: admin@icecream.com / admin123
==================================================
```

## One link to share with everyone

| Who | Link to use |
|-----|-------------|
| **You (presenter)** | `http://localhost:5000` |
| **Colleagues on same office WiFi** | `http://192.168.x.x:5000` (the "Share with office" link from the black window) |

Everyone opens the **same link** in Chrome or Edge. No separate frontend/backend URLs.

### Demo login (share with audience)

- **Email:** `admin@icecream.com`
- **Password:** `admin123`

## Important during presentation

1. **Keep the black command window open** — closing it stops the website
2. **Use office WiFi** — colleagues need to be on the same network to use the share link
3. **Allow firewall** if Windows asks — click "Allow access" so others can connect
4. **First start takes longer** — run `START-PRESENTATION.bat` 10 minutes before the meeting to test

## If colleagues cannot open the link

1. Make sure they use the **Share with office** link (not localhost)
2. Check both laptops are on the **same WiFi**
3. When Windows Firewall pops up, click **Allow access**
4. Try opening the link on your office laptop first to confirm it works

## Alternative: command line start

```bash
cd ice-cream-control-center
npm run present
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Node.js is not installed" | Install from nodejs.org (LTS) |
| Page not loading | Wait for "READY" message in the black window |
| Colleagues can't connect | Use network IP link, allow firewall, same WiFi |
| Slow first start | Normal — memory database downloads on first run |

## What runs?

- **One server** on port 5000 serves both the website and API
- **No MongoDB install needed** — uses built-in demo database
- **Sample data** loads automatically (sellers, sales, maps, charts)
