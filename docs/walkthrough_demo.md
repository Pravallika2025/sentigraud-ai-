# 🎥 Deployed SOC Dashboard Operations Walkthrough

This document hosts the official operations walkthrough demonstration video of the deployed SentinelGPT platform.

## 📺 Live Video Demonstration
Below is the animated walkthrough showing the complete security operator workflow (Landing → Registering Operator → Logging in → Navigating tabs → Threat Heatmap & Charts → Threat Simulation & Sound Alarm → AI Conversational Triage → Malicious File Scanner → Historical Log → Terminating Access):

![SentinelGPT Operations Walkthrough](images/walkthrough_demo.webp)

---

## ⚙️ Core Workflow Breakdown

### 1. Unified Authentication Gateway
- Operators land on a modern cyberpunk neon login screen.
- Registered operators are stored in the SQLite database with fallback persistence to local cache if the backend is offline.
- Three default test credentials are automatically seeded on startup:
  - **Administrator**: `admin@sentinel.ai` / `Admin@123`
  - **Security Analyst**: `analyst@sentinel.ai` / `Analyst@123`
  - **Demo Observer**: `demo@sentinel.ai` / `Demo@123`

### 2. Glassmorphism Operations Matrix
- Features **7 KPI cards** displaying real-time metrics including severity slices (Critical, High, Medium, Low) and Avg Risk Score.
- Displays responsive **semi-circle gauge**, **severity donut**, and **threat breakdown charts** using Recharts.
- Dynamically integrates a **Perimeter Heatmap Matrix** of network node perimeters and a vertical **Attack Chrono Timeline**.

### 3. Incident History & Blocklists
- Searchable and filterable database containing all historical threat alerts.
- Fully supports manual IP quarantine blocking and unblocking.

### 4. Interactive AI & Threat Analyzer
- Operators can enter any active IP to retrieve its MITRE ATT&CK technique mapping and localized AI remediation guidelines.
- The Conversational AI Assistant enables real-time triage queries and playbooks.

### 5. Static Heuristics Scanner
- Drop logs or payloads to audit threat signatures and obtain instant vulnerability verdicts.
