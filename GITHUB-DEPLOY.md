# Deploy Live Website (GitHub Only)

Your code is on GitHub: **https://github.com/sk5195/ice-cream-control-center**

Deploy the live link using **Render connected to GitHub** (no Railway, no other tools).

## Step 1 — GitHub (already done)

Repo: https://github.com/sk5195/ice-cream-control-center

## Step 2 — Deploy from GitHub on Render

1. Open: **https://dashboard.render.com/select-repo?type=blueprint**
2. Sign in with **GitHub** (same account: `sk5195`)
3. Select repo: **`ice-cream-control-center`**
4. Render reads `render.yaml` automatically
5. Click **Apply** → wait 5–8 minutes

## Step 3 — Your live link

Render shows a URL like:

```
https://icecream-control-center.onrender.com
```

**Login:** `admin@icecream.com` / `admin123`

---

## One-click deploy button

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/sk5195/ice-cream-control-center)

---

## Re-authorize GitHub (if needed)

If GitHub asks for a code during login, run in terminal:

```bash
gh auth login --hostname github.com --git-protocol https --web
```

Copy the **one-time code** shown in the terminal and enter it at:
**https://github.com/login/device**

---

## What gets deployed from GitHub?

| From repo | Deployed as |
|-----------|-------------|
| `client/` | Built React frontend |
| `server/` | Express API + Socket.io |
| `render.yaml` | Auto config |
| Sample data | Auto-seeds on first start |

Everything runs on **one URL** from your GitHub repo.
