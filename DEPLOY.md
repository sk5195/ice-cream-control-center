# Deploy Online (One Public Link)

Get a **single public URL** like `https://icecream-control-center.onrender.com` that anyone can open from anywhere.

## Option A: Deploy to Render (Free, Recommended)

### Step 1: Push code to GitHub

```bash
cd ice-cream-control-center
git init
git add .
git commit -m "Ice cream control center"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ice-cream-control-center.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://dashboard.render.com
2. Sign up / log in (free)
3. Click **New +** → **Blueprint**
4. Connect your GitHub repo
5. Render reads `render.yaml` automatically
6. Click **Apply** — deploy starts (takes 5–8 minutes first time)

### Step 3: Open your live site

Render gives you a URL like:

```
https://icecream-control-center.onrender.com
```

**Login:** `admin@icecream.com` / `admin123`

---

## Option B: Office laptop (no cloud)

Double-click **`START-PRESENTATION.bat`** — see `OFFICE-PRESENTATION.md`

---

## What runs in production?

| Component | How |
|-----------|-----|
| Frontend | Built React app served by Express |
| Backend | Express API on same URL |
| Database | In-memory (auto-seeds demo data) |
| Maps / Charts | Work out of the box |
| Live tracking | Socket.io on same server |

---

## Environment variables (Render)

Already set in `render.yaml`:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | production |
| `USE_MEMORY_DB` | true |
| `JWT_SECRET` | auto-generated |
| `HOST` | 0.0.0.0 |

### Optional: MongoDB Atlas (persistent data)

For data that survives restarts:

1. Create free cluster at https://www.mongodb.com/atlas
2. Get connection string
3. In Render dashboard → Environment:
   - `MONGODB_URI` = your Atlas URI
   - `USE_MEMORY_DB` = false

---

## Verify deployment

After deploy, test:

- `https://YOUR-URL.onrender.com` — login page loads
- `https://YOUR-URL.onrender.com/api/health` — returns `{"status":"ok"}`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | Check Render logs; ensure Node 18+ |
| 502 on first visit | Free tier wakes up in ~30s — wait and refresh |
| Login fails | Wait for seed to finish (check logs for "Seed completed") |
| Maps not loading | Needs internet for OpenStreetMap tiles |
