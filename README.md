<<<<<<< HEAD
# SentinelGPT - Autonomous Cyber Defense Platform ⚔️

**A fault-tolerant, real-time cybersecurity monitoring platform built with FastAPI, React, and SQLAlchemy — fully configured for single-click Vercel Serverless deployment.**

SentinelGPT is a resilient security visualization system designed to ingest network traffic metadata, identify anomalous threat patterns using adaptive heuristics, and automate perimeter response via an integrated firewall blacklist.

---

## 🎬 Live Dashboard Recording

> Real-time demo of SentinelGPT in action — threat detection, live telemetry stream, security quarantine, and autonomous heuristics running live.

![SentinelGPT Live Dashboard Demo](assets/demo.gif)

**Dashboard features shown:**
- 🔴 **Real-time Threat Feed** — Live `NEXUS_WEBSOCKET` streaming with auto-updating threat telemetry
- 📊 **Threat Flow Velocity Chart** and **Sector Risk Map** tabs
- 🛡️ **Security Quarantine** — IP blocking with `Revoke` controls
- ⚡ **Inject Threat** — Manual threat injection for testing
- 🔄 **Sync** — Instant data refresh
- 📈 **Live Metrics** — PERIMETER_INCIDENTS, LEVEL_CRITICAL, TOTAL_TRAFFIC_LOGS counters updating in real time

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
=======
# 🛡️ SentinelGPT — Autonomous Cyber Defense Dashboard

<div align="center">

![SentinelGPT](https://img.icons8.com/color/96/shield.png)

**Real-time AI-powered cybersecurity monitoring, threat detection, and autonomous defense platform**

[![Vercel Deploy](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://sentinelgpt-ai.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Pravallika2025/CyberSecurity-SentinelGPT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org)

</div>

---

## 📖 Project Overview

**SentinelGPT** is a full-stack autonomous cybersecurity operations center (SOC) dashboard built for real-time threat detection, incident management, and AI-assisted remediation. It combines a React frontend with a FastAPI Python backend deployed serverlessly on Vercel.

The platform monitors network threats in real-time, maps them to MITRE ATT&CK techniques, provides AI-generated remediation recommendations, and automatically quarantines malicious IPs — all from a sleek, dark-mode operations dashboard.

---

## ✨ Features

### 🔐 Authentication
- JWT-based login system
- Operator account registration
- Secure session management via localStorage
- Quick demo bypass for testing

### 📊 Dashboard
- **7 Real-time Metric Cards**: Total Threats, Critical, High, Medium, Low, Avg Risk Score, Blocked IPs
- **Risk Gauge Chart**: Visual average risk score display dial (0–100)
- **Severity Donut Chart**: Critical / High / Medium / Low severity distribution
- **Threat Type Breakdown Chart**: Bar chart of attack categories
- **Risk Score Timeline**: Real-time time-series risk graph
- **Perimeter Heatmap Matrix**: Node grid of threat perimeters
- **Attack Chrono Timeline**: Vertical sequence list of threat events
- **Live Alerts Feed**: Auto-updating threat stream with Ack & Quarantine
- **AI Remediation**: Dynamically displays containment protocols for active threats
- **Quick Action Core**: Inject Test Threat, Purge Threat Logs, and Download Reports

### 🔍 Threat History
- **Full Threat Table**: All logged incidents with timestamps
- **Live Search**: Filter by IP, threat type, description, event ID
- **Advanced Filters**: Severity (Critical/High/Medium/Low) + Threat Type
- **Active Quarantines**: View and manage blocked IPs
- **Download Report**: Export full JSON threat report

### 🎯 IP Threat Analyzer
- Full AI-powered threat intelligence lookup per IP
- MITRE ATT&CK technique mapping (e.g., T1110, T1498, T1190)
- Geo-location, ISP, and open port detection
- AI remediation recommendation with severity classification
- One-click quarantine button for malicious IPs

### 🤖 AI Security Assistant
- Conversational AI interface for threat triage
- Context-aware responses about your live threat data
- MITRE ATT&CK tactic recommendations
- DDoS mitigation guidance
- Brute-force and credential attack playbooks
- Quick-prompt shortcuts

### 📁 File Scanner
- Upload files for static AI heuristic analysis
- Verdict: MALICIOUS / SUSPICIOUS / CLEAN
- Detailed indicator of compromise (IoC) list with offsets
- Supports .pcap, .log, .exe, .dll, .pdf, .docx

### 🚨 Attack Detection & Alarm
- Real-time attack defection banner with red pulsing alert
- Web Audio API emergency alarm sound (toggleable)
- Automatic IP quarantine on detected attacks
- MITRE ATT&CK mapping displayed in real-time
- AI remediation shown immediately on detection

### 💾 Data Persistence
- All threat data saved to localStorage — never lost on refresh
- Optimistic UI updates with backend sync
- Fallback data if API is unreachable

---

## 🛠️ Technologies Used

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.0 | UI Framework |
| Vite | 5.4 | Build Tool |
| Recharts | 2.13 | Data Visualization |
| Lucide React | 0.454 | Icon System |
| Tailwind CSS | via CDN classes | Utility Styling |
| Web Audio API | Native | Alarm Sound |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | 0.100+ | REST API Framework |
| SQLAlchemy | 2.0+ | ORM / Database |
| SQLite | 3.x | Database (Vercel /tmp) |
| PyJWT | 2.8+ | JWT Authentication |
| Pydantic | 2.0+ | Data Validation |
| Uvicorn | 0.22+ | ASGI Server |

### Infrastructure
| Technology | Purpose |
|---|---|
| Vercel | Serverless Deployment |
| GitHub Actions | CI/CD Pipeline |
| Vercel Python Runtime | FastAPI Serverless Functions |
| Vercel Static Build | React SPA Hosting |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                   │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │   React SPA Frontend │  │  FastAPI Python Backend  │ │
│  │  (Static Build /dist)│  │  (Serverless Function)   │ │
│  │                      │  │                          │ │
│  │  • Dashboard         │  │  • /api/login            │ │
│  │  • Login/Register    │  │  • /api/snapshot         │ │
│  │  • Threat History    │  │  • /api/block_ip         │ │
│  │  • IP Analyzer       │  │  • /api/unblock_ip       │ │
│  │  • AI Assistant      │  │  • /api/sim_threat       │ │
│  │  • File Scanner      │  │  • /api/clear_logs       │ │
│  └──────────┬───────────┘  └──────────┬───────────────┘ │
│             │                         │                  │
│             └─────────┬───────────────┘                  │
│                       │                                  │
│               ┌───────▼────────┐                         │
│               │  SQLite DB     │                         │
│               │  (/tmp/senti-  │                         │
│               │   nel.db)      │                         │
│               └────────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
```
Browser → Vercel Edge → Route Match:
  /api/*  → FastAPI Serverless (Python)
  /*      → React SPA (index.html)
           → JS/CSS served from /assets/
```

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Pravallika2025/CyberSecurity-SentinelGPT.git
cd CyberSecurity-SentinelGPT
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Backend Setup
```bash
# From project root
pip install -r requirements.txt

# Run FastAPI locally
uvicorn api.index:app --reload --port 8000
# API available at http://localhost:8000
```

### 4. Environment Variables (Optional)
Create `.env` in the project root:
```env
SECRET_KEY=your_jwt_secret_key_here
ADMIN_PASSWORD=your_admin_password
```

### 5. Login Credentials
- **Default Login**: `admin` / `admin123`
- **Register**: Create your own operator account via the Register tab
- **Quick Demo**: Click "Quick Demo Access (Bypass)" to skip login

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/login` | Operator authentication, returns JWT | ❌ |
| GET | `/api/snapshot` | Full SOC data snapshot (logs + blocked IPs + metrics) | ✅ |
| POST | `/api/block_ip` | Add IP to quarantine list | ✅ |
| POST | `/api/unblock_ip` | Remove IP from quarantine | ✅ |
| POST | `/api/sim_threat` | Inject simulated threat event | ✅ |
| POST | `/api/clear_logs` | Clear all threat logs | ✅ |
| GET | `/api/docs` | FastAPI Swagger documentation | ❌ |

### Example API Call
```bash
# Login
curl -X POST https://sentinelgpt-ai.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Get snapshot (with token)
curl https://sentinelgpt-ai.vercel.app/api/snapshot \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 Folder Structure

```
CyberSecurity-SentinelGPT/
│
├── 📁 frontend/                 # React SPA
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── Dashboard.jsx       # Main SOC dashboard
│   │   │   ├── Login.jsx           # Auth (login + register)
│   │   │   ├── BlockedIPs.jsx      # Quarantine list
│   │   │   ├── ThreatTable.jsx     # Historical threat table
│   │   │   ├── LiveAlertsFeed.jsx  # Real-time alerts
│   │   │   ├── RiskGaugeChart.jsx  # Gauge chart
│   │   │   ├── SeverityDonutChart.jsx  # Donut chart
│   │   │   ├── ThreatBreakdownChart.jsx # Bar chart
│   │   │   ├── RiskTimelineChart.jsx   # Timeline chart
│   │   │   ├── MetricsCard.jsx     # Metric card
│   │   │   └── ErrorBoundary.jsx   # Error handling
│   │   ├── App.jsx                 # Root component + routing
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite configuration
│   ├── package.json                # Dependencies
│   └── eslint.config.js            # Linting rules
│
├── 📁 api/
│   └── index.py                    # FastAPI serverless backend
│
├── 📁 backend/
│   └── main.py                     # Extended backend (local dev)
│
├── 📁 .github/
│   └── workflows/deploy.yml        # GitHub Actions CI/CD
│
├── vercel.json                     # Vercel deployment config
├── requirements.txt                # Python dependencies
└── README.md                       # This file
```

---

## 🔒 Security Features

- **JWT Authentication**: 8-hour expiring tokens with HS256 signing
- **CORS Protection**: Configured FastAPI CORS middleware
- **Secrets via Env Vars**: `SECRET_KEY` and `ADMIN_PASSWORD` from environment
- **Input Validation**: Pydantic models validate all API inputs
- **Optimistic UI**: Frontend never blocks on failed API calls
- **Session Management**: Tokens stored and validated per request

---

## 🗺️ MITRE ATT&CK Coverage

| Threat Type | Technique | Tactic |
|---|---|---|
| Credential Stuffing | T1078 | Initial Access |
| DDoS Attempt | T1498 | Impact |
| SQL Injection | T1190 | Initial Access |
| Port Scan | T1046 | Discovery |
| Brute Force | T1110 | Credential Access |
| Malware Payload | T1204 | Execution |
| Unauthorized Access | T1021 | Lateral Movement |
| Phishing | T1566 | Initial Access |

---

## 🔮 Future Improvements

- [ ] **Real ML Model**: Integrate scikit-learn threat severity classifier
- [ ] **CVE Lookup**: Link threats to known CVEs via NVD API
- [ ] **Webhook Alerts**: Email/Slack/Discord notifications on critical threats
- [ ] **Role-Based Access**: Admin / Analyst / Read-Only roles
- [ ] **Multi-Tenant**: Separate dashboards per organization
- [ ] **Packet Capture**: Real .pcap file parsing with Scapy
- [ ] **Geo Map**: World map visualization of attack origins
- [ ] **Attack Graph**: Kill-chain relationship visualization
- [ ] **SIEM Integration**: Forward events to Splunk / Elastic
- [ ] **Rate Limiting**: API request throttling per operator
- [ ] **Audit Logs**: Full action history per operator session
- [ ] **Dark/Light Mode**: User-controlled theme switching
- [ ] **Export PDF**: Formal incident report PDF generation

---

## 📸 Screenshots & Operations Walkthrough

### 📊 Global SOC Dashboard
![SOC Dashboard Preview](docs/images/dashboard.png)

### 🔐 Cyberpunk Login Interface
![Login Interface Preview](docs/images/login_page.png)

### 📝 Operator Registration Interface
![Registration Interface Preview](docs/images/registration_page.png)

### 🤖 AI Security Conversational Assistant
![AI Chat Interface Preview](docs/images/ai_chat.png)

### 📁 Heuristic Payload File Scanner
![File Scanner Interface Preview](docs/images/file_scanner.png)

---

## 🎯 Live Deployment & Walkthrough

**Live Deployed Platform**: [https://sentinelgpt-ai.vercel.app](https://sentinelgpt-ai.vercel.app)

**🎥 Operations Walkthrough Video**: [Watch Deployed Walkthrough Video](https://github.com/Pravallika2025/sentigraud-ai-/blob/main/docs/walkthrough_demo.md)

### 🔑 Test Operator Credentials
We have seeded three default roles to support instant assessment:
1. **Security Administrator**
   - Email: `admin@sentinel.ai`
   - Password: `Admin@123`
   - Role: `Administrator`
2. **Security Analyst**
   - Email: `analyst@sentinel.ai`
   - Password: `Analyst@123`
   - Role: `Security Analyst`
3. **Demo User**
   - Email: `demo@sentinel.ai`
   - Password: `Demo@123`
   - Role: `Demo Observer`

Or use the **Quick Demo Access (Bypass)** link on the login screen.

---

## 👩‍💻 Author

**Pravallika**  
GitHub: [@Pravallika2025](https://github.com/Pravallika2025)

---

## 📄 License

MIT License — Free to use for educational and portfolio purposes.
>>>>>>> b14c3a6d116677458df651f45a076b68ee997c05
