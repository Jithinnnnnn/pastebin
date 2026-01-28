# Pastebin

A modern, secure paste sharing service built with Next.js 14 and MongoDB Atlas.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## ✨ Features

- **Create Pastes** — Share text, code, or secrets instantly
- **Expiration Timer** — Auto-delete after a set time (hours/minutes/seconds)
- **View Limits** — Self-destruct after N views
- **Live Countdown** — Real-time expiry countdown on paste view
- **Terminate Paste** — Manually delete pastes anytime
- **Copy to Clipboard** — One-click copy functionality
- **Modern UI** — Glassmorphism design with animated background
- **Azure Ready** — Built for Azure App Service deployment

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB Atlas (Mongoose) |
| Language | JavaScript (ES6+) |
| Styling | CSS (Glassmorphism) |
| Deployment | Azure App Service |

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or 20
- MongoDB Atlas account (free tier works)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pastebin

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Configuration

Edit `.env.local` with your settings:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pastebin?retryWrites=true&w=majority
NEXT_PUBLIC_BASE_URL=http://localhost:3000
TEST_MODE=0
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📡 API Reference

### Health Check
```http
GET /api/healthz
```
**Response:** `{ "ok": true }`

---

### Create Paste
```http
POST /api/pastes
Content-Type: application/json
```

**Body:**
```json
{
  "content": "Your paste content",
  "ttl_seconds": 3600,
  "max_views": 10
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | ✅ | The paste content |
| `ttl_seconds` | integer | ❌ | Expires after N seconds |
| `max_views` | integer | ❌ | Max number of views |

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "url": "https://your-domain.com/p/507f1f77bcf86cd799439011"
}
```

---

### Get Paste
```http
GET /api/pastes/:id
```

**Response (200):**
```json
{
  "content": "Your paste content",
  "remaining_views": 9,
  "expires_at": "2024-01-28T12:00:00.000Z"
}
```

---

### Delete Paste
```http
DELETE /api/pastes/:id
```

**Response (200):**
```json
{
  "message": "Paste terminated successfully"
}
```

## ☁️ Azure Deployment

### Step 1: Create App Service

1. Log in to [Azure Portal](https://portal.azure.com)
2. Create a new **App Service**
   - Runtime: **Node 20 LTS**
   - OS: **Linux**
   - Plan: B1 or higher

### Step 2: Configure Environment Variables

Go to **Configuration** → **Application settings**:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.azurewebsites.net` |
| `TEST_MODE` | `0` |

> ⚠️ No trailing slash in `NEXT_PUBLIC_BASE_URL`

### Step 3: Set Startup Command

In **Configuration** → **General settings**:

```
npm run build && npm start
```

### Step 4: Deploy

**Option A: GitHub Actions** (Recommended)
- Go to **Deployment Center** → Select **GitHub**
- Azure auto-creates the workflow

**Option B: Azure CLI**
```bash
az login
az webapp up --name <app-name> --resource-group <rg-name> --runtime "NODE:20-lts"
```

### Step 5: Verify

Visit `https://your-app.azurewebsites.net/api/healthz` → Should return `{"ok":true}`

## 🗃️ MongoDB Atlas Setup

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user with read/write access
3. Whitelist IPs: `0.0.0.0/0` (for Azure)
4. Get connection string → Add `/pastebin` database name

## 📁 Project Structure

```
pastebin/
├── app/
│   ├── api/
│   │   ├── healthz/route.js      # Health check
│   │   └── pastes/
│   │       ├── route.js          # POST: Create paste
│   │       └── [id]/route.js     # GET & DELETE paste
│   ├── p/[id]/page.js            # View paste page
│   ├── globals.css               # Glassmorphism styles
│   ├── layout.js                 # Root layout + MetaMask blocker
│   └── page.js                   # Home page (create form)
├── lib/mongodb.js                # DB connection singleton
├── models/Paste.js               # Mongoose schema
├── .env.example                  # Environment template
├── next.config.mjs               # Next.js config (standalone)
└── package.json
```

## 🧪 Testing Mode (Time Travel)

For automated testing, enable deterministic time control:

```bash
# Set TEST_MODE=1 in .env.local
```

Then use the `x-test-now-ms` header:

```bash
# Create paste with 10s TTL
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","ttl_seconds":10}'

# Fetch with future timestamp (paste expired)
curl http://localhost:3000/api/pastes/<id> \
  -H "x-test-now-ms: 9999999999999"
# Returns 404
```

## 📄 License

MIT © 2024
