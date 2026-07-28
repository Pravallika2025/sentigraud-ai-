# SentinelGPT - Autonomous Cyber Defense Platform ⚔️

**A fault-tolerant, real-time cybersecurity monitoring platform built with FastAPI, React, and SQLAlchemy — fully configured for single-click Vercel Serverless deployment.**

SentinelGPT is a resilient security visualization system designed to ingest network traffic metadata, identify anomalous threat patterns using adaptive heuristics, and automate perimeter response via an integrated firewall blacklist.

---

## 🏗️ Technical Architecture & Vercel Readiness

### 1. Vercel Serverless API Core (`api/index.py`)
- **Stateless & Scalable Execution:** Native FastAPI ASGI backend running as Vercel Serverless Functions.
- **Auto-Initializing Storage:** Built-in SQLite database auto-seeded with dynamic threat telemetry upon cold start.
- **Normalized REST API:**
  - `POST /api/login` - Identity authentication & JWT token generation.
  - `GET /api/snapshot` - Live SOC metrics, threat logs, risk distribution map, and quarantine list.
  - `POST /api/block_ip` - Quarantine high-risk IP addresses.
  - `POST /api/unblock_ip` - Revoke quarantine for IP addresses.
  - `POST /api/sim_threat` - Inject synthetic threat vector for testing.
  - `POST /api/clear_logs` - Clear threat matrix logs.
  - `GET /api/export` - Export security incident history.

### 2. Resilient Frontend (`frontend/`)
- **Dual Real-Time Engine:** Connects via WebSockets (`/ws`) when available (local server) and gracefully falls back to low-latency serverless polling (3s) on Vercel.
- **Dynamic Visualization:** Live threat flow velocity charts and sector risk maps rendered with Recharts.
- **Interactive Controls:** Instant manual IP blocking/unblocking, test threat injection, and session eject controls.

---

## 🚀 Deployment & Installation

### Option A: Deploying directly to Vercel

1. **Push to GitHub**:
   Push this project to your GitHub repository (`SentinelGPT`).

2. **Deploy on Vercel**:
   - Import the project repository into your [Vercel Dashboard](https://vercel.com).
   - Vercel automatically detects `vercel.json`, `package.json`, and `api/index.py`.
   - Click **Deploy**.

All routes (`/api/*`, `/login`, `/snapshot`) and static dashboard assets are automatically configured!

---

### Option B: Running Locally

```bash
# 1. Install root dependencies & build frontend
npm install
npm run build

# 2. Start Python Backend (Terminal 1)
python backend/main.py

# 3. Start Frontend Dev Server (Terminal 2)
npm run dev
```

### Accessing the Dashboard
- **Default Credentials:** Username `admin` | Password `admin123`
- Or click **Quick Demo Access (Bypass)** on the login screen.

---

## 📊 Core Functionality
- **Autonomous Monitoring:** Real-time threat detection and logging without manual intervention.
- **Interactive Perimeter Firewall:** Block and unblock IP addresses with live UI state synchronization.
- **Telemetry Visuals:** Real-time metrics for total incidents, level critical interceptions, and total traffic volume.
