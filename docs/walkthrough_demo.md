# 🎥 SentinelGPT — Complete Operations Walkthrough

This document provides a detailed step-by-step walkthrough of the deployed SentinelGPT platform, covering every operator workflow from login to logout.

---

## 📺 Live Video Demonstration

Below is the animated walkthrough showing the complete security operator workflow:

![SentinelGPT Operations Walkthrough](images/walkthrough_demo.webp)

---

## ⚙️ Complete Walkthrough

### 1. 🔐 Login

Operators access the platform through a cyberpunk-styled authentication gateway.

![Login Interface](images/login_page.png)

**Login Options:**
- **Admin Login**: Enter `admin` / `admin123` for full administrator access
- **Email Login**: Use seeded credentials like `admin@sentinel.ai` / `Admin@123`
- **Quick Demo**: Click **"Quick Demo Access (Bypass)"** to skip authentication
- **Register**: Create a new operator account via the Register tab

**What happens:**
- Credentials are validated against the FastAPI backend via `POST /api/login`
- On success, a JWT token (HS256, 8-hour expiry) is returned and stored in `localStorage`
- The dashboard loads automatically after authentication

---

### 2. 📊 Dashboard

The main SOC (Security Operations Center) dashboard displays real-time threat intelligence.

![SOC Dashboard](images/dashboard.png)

**Visible Components:**
- **7 KPI Metric Cards**: Total Threats, Critical, High, Medium, Low, Avg Risk Score, Blocked IPs
- **Risk Gauge Chart**: Semi-circle gauge showing average risk score (0–100)
- **Severity Donut Chart**: Visual distribution of Critical/High/Medium/Low threats
- **Threat Breakdown Chart**: Bar chart of attack categories
- **Risk Timeline**: Time-series graph of risk scores over time
- **Perimeter Heatmap**: Node grid showing threat distribution across network sectors
- **Attack Chronology**: Vertical timeline of recent threat events
- **Live Alerts Feed**: Auto-updating stream with Acknowledge & Quarantine actions
- **AI Remediation Panel**: MITRE ATT&CK mapping and containment recommendations

---

### 3. 🔴 Threat Detection

SentinelGPT continuously monitors for threats using adaptive heuristics.

**How it works:**
- The backend generates synthetic threat telemetry at regular intervals (every ~6 seconds in local mode)
- Each threat is scored on a 0–100 risk scale
- Threats above score 75 are classified as **Critical** (🔴)
- Threats between 60–74 are **High** (🟠)
- Threats between 40–59 are **Medium** (🟡)
- Threats below 40 are **Low** (🟢)

**Real-time updates:**
- **WebSocket** (`/ws`) provides instant push notifications in local development
- **Auto-refresh polling** (60-second intervals) ensures data freshness on Vercel deployment
- Attack detection triggers a red pulsing banner and optional alarm sound

---

### 4. 💉 Inject Threat

Operators can manually inject test threats for validation.

**Steps:**
1. Click the **"⚡ Inject Threat"** button in the Quick Action panel
2. A random threat type is selected (Credential Stuffing, DDoS, SQL Injection, Port Scan, etc.)
3. The threat is sent to the backend via `POST /api/sim_threat`
4. The dashboard updates immediately with the new threat entry
5. AI remediation recommendations appear for the injected threat type

---

### 5. 🔄 Sync

Force an immediate data refresh from the backend.

**Steps:**
1. Click the **"🔄 Sync"** button
2. A `GET /api/snapshot` request is sent to the backend
3. All metrics, logs, and quarantine data are refreshed
4. The "Last Updated" timestamp reflects the sync time

---

### 6. 🗑️ Clear Logs

Purge all threat logs from the database.

**Steps:**
1. Click the **"🗑️ Purge Logs"** button
2. A `POST /api/clear_logs` request is sent to the backend
3. All SOC incidents and perimeter logs are deleted
4. Metric cards reset to zero
5. Charts clear and await new data

---

### 7. 🔒 Quarantine

Isolate malicious IP addresses through the interactive quarantine system.

**Block an IP:**
1. In the Live Alerts Feed or Threat Table, click **"Quarantine"** next to a threat
2. The IP is sent to `POST /api/block_ip`
3. The IP appears in the **Security Quarantine** panel
4. The "Blocked IPs" metric card increments

**Unblock an IP:**
1. In the Security Quarantine panel, click **"Revoke"** next to a blocked IP
2. The IP is sent to `POST /api/unblock_ip`
3. The IP is removed from the quarantine list

---

### 8. 📈 Charts

SentinelGPT provides multiple visualization tabs:

| Chart | Type | Shows |
|---|---|---|
| **Risk Gauge** | Semi-circle gauge | Average risk score across all threats |
| **Severity Donut** | Donut chart | Distribution of Critical/High/Medium/Low |
| **Threat Breakdown** | Bar chart | Count per attack category |
| **Risk Timeline** | Time-series line | Risk score progression over time |
| **Perimeter Heatmap** | Node grid | Threat density across network sectors |
| **Attack Timeline** | Vertical sequence | Chronological list of recent attacks |

All charts update in real-time as new threats are detected.

---

### 9. 📡 Telemetry

The system status panel shows real-time telemetry:

- **System Integrity**: NOMINAL / DEGRADED status
- **Detection Mode**: AUTONOMOUS_HEURISTICS
- **Active Quarantines**: Count of blocked IPs
- **Stream Health**: WEBSOCKET LIVE / AUTO-REFRESH ON
- **Last Updated**: Timestamp of most recent data sync

---

### 10. 🚪 Logout

Terminate the operator session.

**Steps:**
1. Click the **"🚪 Logout"** button in the sidebar
2. The JWT token is removed from `localStorage`
3. The operator is redirected to the Login screen
4. All session data is cleared

---

## 🤖 Additional Features

### AI Security Assistant

![AI Chat Interface](images/ai_chat.png)

- Conversational AI interface for threat triage
- Context-aware responses about live threat data
- MITRE ATT&CK tactic recommendations
- Quick-prompt shortcuts for common queries

### File Scanner

![File Scanner Interface](images/file_scanner.png)

- Upload files for static AI heuristic analysis
- Verdict: MALICIOUS / SUSPICIOUS / CLEAN
- Supports .pcap, .log, .exe, .dll, .pdf, .docx

---

## 🔑 Test Operator Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@sentinel.ai` | `Admin@123` |
| **Security Analyst** | `analyst@sentinel.ai` | `Analyst@123` |
| **Demo Observer** | `demo@sentinel.ai` | `Demo@123` |

Or use **Quick Demo Access (Bypass)** on the login screen.
