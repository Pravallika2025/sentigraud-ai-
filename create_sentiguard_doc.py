import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
from PIL import Image, ImageDraw, ImageFont

BASE_DIR    = r"c:\Users\User\pravallika sentinel"
IMG_DIR     = os.path.join(BASE_DIR, "docs", "images")
DESKTOP_DIR = (r"C:\Users\User\OneDrive\Desktop"
               if os.path.exists(r"C:\Users\User\OneDrive\Desktop")
               else r"C:\Users\User\Desktop")
os.makedirs(IMG_DIR, exist_ok=True)

IMG_DASHBOARD = os.path.join(IMG_DIR, "dashboard.png")
IMG_LOGIN     = os.path.join(IMG_DIR, "login_page.png")
IMG_REGISTER  = os.path.join(IMG_DIR, "registration_page.png")
IMG_CHAT      = os.path.join(IMG_DIR, "ai_chat.png")
IMG_SCANNER   = os.path.join(IMG_DIR, "file_scanner.png")

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: try to load a font, fallback gracefully
# ─────────────────────────────────────────────────────────────────────────────
def _font(size):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        return ImageFont.load_default()

def _box(draw, x1, y1, x2, y2, bg, border, lines, fnt):
    draw.rectangle([x1,y1,x2,y2], fill=bg, outline=border, width=2)
    cx = (x1+x2)//2
    if isinstance(lines, str):
        lines = [lines]
    step = 18
    total_h = len(lines) * step
    ty_start = (y1+y2)//2 - total_h//2 + step//2
    for i, ln in enumerate(lines):
        draw.text((cx, ty_start + i*step), ln, fill="#111111", font=fnt, anchor="mm")

def _arrow(draw, x1, y1, x2, y2):
    draw.line([x1,y1,x2,y2], fill="#003366", width=2)
    draw.polygon([(x2,y2),(x2-5,y2-9),(x2+5,y2-9)], fill="#003366")

# ─────────────────────────────────────────────────────────────────────────────
# GENERATE ARCHITECTURE DIAGRAM
# ─────────────────────────────────────────────────────────────────────────────
def make_arch_diagram():
    img = Image.new("RGB", (860, 600), "#ffffff")
    d   = ImageDraw.Draw(img)
    f12 = _font(12); f11 = _font(11)

    _box(d,240,10,620,52,"#E6F2FF","#003366",["SECURITY OPERATOR / ADMINISTRATOR"],f12)
    _arrow(d,430,52,430,76)
    _box(d,60,76,800,126,"#EBF5FB","#005580",
         ["FRONTEND  —  React 19 + Vite 5.4 SPA",
          "Login · Dashboard · Telemetry Feed · Quarantine Control · AI Chat · File Scanner"],f11)
    _arrow(d,430,126,430,152)
    _box(d,60,152,800,202,"#E9F7EF","#008040",
         ["FASTAPI BACKEND CONTROLLER  (index.py / main.py)",
          "REST Router · JWT Auth · CORS Middleware · WebSocket Engine"],f11)
    _arrow(d,430,202,430,228)

    d.line([200,228,660,228], fill="#003366", width=2)
    _arrow(d,200,228,200,255); _arrow(d,660,228,660,255)

    _box(d,30,255,390,345,"#FEF9E7","#D97706",
         ["TELEMETRY MONITOR AGENT",
          "Heuristic Anomaly Scoring (0-100)",
          "MITRE ATT&CK Technique Mapping"],f11)
    _box(d,470,255,830,345,"#F4ECF7","#7E22CE",
         ["AUTONOMOUS QUARANTINE AGENT",
          "Auto-Block Score >= 75",
          "AI Remediation · Manual Revoke"],f11)

    d.line([200,345,200,368], fill="#003366", width=2)
    d.line([660,345,660,368], fill="#003366", width=2)
    d.line([200,368,660,368], fill="#003366", width=2)
    _arrow(d,430,368,430,392)

    _box(d,130,392,730,442,"#EAFAF1","#15803D",
         ["SQLALCHEMY ORM  ·  SQLITE DATABASE",
          "Users  |  SOC Incidents  |  Blocked IPs  |  Perimeter Logs"],f11)
    _arrow(d,430,442,430,468)
    _box(d,100,468,760,518,"#F2F3F4","#334155",
         ["VERCEL SERVERLESS CLOUD DEPLOYMENT",
          "Live SOC Dashboard  |  JSON Export  |  Swagger API Docs"],f11)

    path = os.path.join(IMG_DIR, "arch_diagram.png")
    img.save(path)
    return path

# ─────────────────────────────────────────────────────────────────────────────
# GENERATE WORKFLOW DIAGRAM
# ─────────────────────────────────────────────────────────────────────────────
def make_workflow_diagram():
    img = Image.new("RGB", (860, 520), "#ffffff")
    d   = ImageDraw.Draw(img)
    f11 = _font(11)

    steps = [
        (70,10,790,58,"#EBF5FB","#005580",
         ["NETWORK TRAFFIC & SECURITY TELEMETRY FEED",
          "Inbound Logs · IP Probes · HTTP Requests"]),
        (70,82,790,132,"#F2F3F4","#003366",
         ["FRONTEND DASHBOARD & ALERTS FEED",
          "Displays Live Metrics · Captures Operator Controls"]),
        (70,156,790,226,"#FEF9E7","#D97706",
         ["TELEMETRY MONITOR & THREAT DETECTION AGENT",
          "Analyzes IP Velocity & Payload · Calculates Risk Score (0-100)",
          "Maps Incident to MITRE ATT&CK Technique"]),
        (70,250,790,320,"#F4ECF7","#7E22CE",
         ["AUTONOMOUS QUARANTINE & VALIDATION AGENT",
          "Evaluates Risk Threshold (Score >= 75 = Auto Quarantine)",
          "AI Remediation Guidance · False Positive Prevention"]),
        (160,344,700,394,"#EAFAF1","#15803D",
         ["DATABASE STORAGE  —  SOC Incidents · Blocked IPs · User Accounts"]),
    ]
    prev_bottom = None
    for (x1,y1,x2,y2,bg,border,lines) in steps:
        _box(d,x1,y1,x2,y2,bg,border,lines,f11)
        if prev_bottom:
            _arrow(d,430,prev_bottom,430,y1)
        prev_bottom = y2

    _arrow(d,430,394,430,418)
    d.line([60,418,800,418], fill="#003366", width=2)
    labels = ["DASHBOARD","CHARTS","QUARANTINE","AI CHAT","SCANNER","EXPORT"]
    xs = [80,210,340,470,600,730]
    for lbl,cx in zip(labels,xs):
        _arrow(d,cx,418,cx,428)
        _box(d,cx-52,428,cx+52,474,"#E2E8F0","#475569",[lbl],f11)

    path = os.path.join(IMG_DIR, "workflow_diagram.png")
    img.save(path)
    return path

# ─────────────────────────────────────────────────────────────────────────────
# BUILD THE WORD DOCUMENT  (original first-doc style restored & improved)
# ─────────────────────────────────────────────────────────────────────────────
def build_doc(save_paths):
    arch_img     = make_arch_diagram()
    workflow_img = make_workflow_diagram()

    doc = docx.Document()

    # ── Page margins ─────────────────────────────────────────────
    sec = doc.sections[0]
    sec.top_margin    = Inches(1.0)
    sec.bottom_margin = Inches(1.0)
    sec.left_margin   = Inches(1.15)
    sec.right_margin  = Inches(1.15)

    # ── Global font (Calibri – matching original) ─────────────────
    ns = doc.styles["Normal"]
    ns.font.name  = "Calibri"
    ns.font.size  = Pt(11)
    ns.font.color.rgb = RGBColor(0x22,0x22,0x22)

    # ════════════════════════════════════════════════════════════════
    # HELPER FUNCTIONS
    # ════════════════════════════════════════════════════════════════
    C_DARK  = RGBColor(0x00,0x27,0x50)   # deep navy
    C_MID   = RGBColor(0x00,0x5F,0x8E)   # medium blue
    C_GRAY  = RGBColor(0x55,0x55,0x55)

    def h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after  = Pt(5)
        r = p.add_run(text)
        r.font.name = "Calibri"; r.font.size = Pt(15)
        r.font.bold = True; r.font.color.rgb = C_DARK
        # bottom rule via paragraph border
        pPr = p._p.get_or_add_pPr()
        pBdr = parse_xml(
            r'<w:pBdr %s><w:bottom w:val="single" w:sz="6" w:space="1" '
            r'w:color="003366"/></w:pBdr>' % nsdecls("w"))
        pPr.append(pBdr)

    def h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after  = Pt(3)
        r = p.add_run(text)
        r.font.name = "Calibri"; r.font.size = Pt(12)
        r.font.bold = True; r.font.color.rgb = C_MID

    def para(text, bold_label=None, justify=True):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(6)
        p.paragraph_format.line_spacing = 1.2
        if justify:
            p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_label:
            r1 = p.add_run(bold_label)
            r1.font.name = "Calibri"; r1.font.bold = True
            r1.font.color.rgb = C_DARK
        r2 = p.add_run(text)
        r2.font.name = "Calibri"

    def bullet(label, text):
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_before  = Pt(0)
        p.paragraph_format.space_after   = Pt(3)
        p.paragraph_format.left_indent   = Inches(0.3)
        p.paragraph_format.line_spacing  = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r1 = p.add_run(label)
        r1.font.name = "Calibri"; r1.font.bold = True
        r1.font.color.rgb = C_DARK
        r2 = p.add_run(text)
        r2.font.name = "Calibri"

    def caption(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(10)
        r = p.add_run(text)
        r.font.name = "Calibri"; r.font.size = Pt(9.5)
        r.font.italic = True; r.font.color.rgb = C_GRAY

    def img_center(path, w=6.0, cap=None):
        if not os.path.exists(path):
            return
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after  = Pt(3)
        p.add_run().add_picture(path, width=Inches(w))
        if cap:
            caption(cap)

    def add_tbl_border(tbl):
        for row in tbl.rows:
            for cell in row.cells:
                tcp = cell._tc.get_or_add_tcPr()
                tcp.append(parse_xml(
                    r'<w:tcBorders %s>'
                    r'<w:top    w:val="single" w:sz="4" w:color="B0C4DE"/>'
                    r'<w:bottom w:val="single" w:sz="4" w:color="B0C4DE"/>'
                    r'<w:left   w:val="single" w:sz="4" w:color="B0C4DE"/>'
                    r'<w:right  w:val="single" w:sz="4" w:color="B0C4DE"/>'
                    r'</w:tcBorders>' % nsdecls("w")
                ))

    # ════════════════════════════════════════════════════════════════
    # COVER PAGE
    # ════════════════════════════════════════════════════════════════
    # Institution label
    inst = doc.add_paragraph()
    inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    inst.paragraph_format.space_before = Pt(0)
    inst.paragraph_format.space_after  = Pt(6)
    ri = inst.add_run("PROJECT TECHNICAL REPORT")
    ri.font.name = "Calibri"; ri.font.size = Pt(13)
    ri.font.color.rgb = C_GRAY; ri.font.bold = True

    # Main title
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(24)
    title_p.paragraph_format.space_after  = Pt(14)
    rt = title_p.add_run(
        "SentinelGPT: An AI-Powered Large Language Model\n"
        "Framework for Advanced Cyber Threat Detection\n"
        "and Analysis"
    )
    rt.font.name = "Calibri"; rt.font.size = Pt(24)
    rt.font.bold = True; rt.font.color.rgb = C_DARK

    # Tagline
    tag = doc.add_paragraph()
    tag.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tag.paragraph_format.space_after = Pt(36)
    rg = tag.add_run(
        "Real-time AI-powered cybersecurity monitoring, autonomous threat detection,\n"
        "and intelligent incident response dashboard"
    )
    rg.font.name = "Calibri"; rg.font.size = Pt(12)
    rg.font.italic = True; rg.font.color.rgb = C_GRAY

    # Horizontal rule via a simple table row
    hr = doc.add_table(rows=1, cols=1)
    hr.style = "Table Grid"
    hr.rows[0].cells[0].paragraphs[0].text = ""
    hr.rows[0].height = Pt(2)
    hr.rows[0].cells[0]._tc.get_or_add_tcPr().append(
        parse_xml(r'<w:shd %s w:val="clear" w:color="auto" w:fill="003366"/>' % nsdecls("w"))
    )

    # Meta info table
    doc.add_paragraph().paragraph_format.space_after = Pt(6)
    meta = doc.add_table(rows=6, cols=2)
    meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_rows = [
        ("Project Title:",    "SentinelGPT: An AI-Powered LLM Framework for Advanced Cyber Threat Detection"),
        ("Submitted by:",     "Pravallika Kalangi"),
        ("Roll Number:",      "24VV1F0044"),
        ("Programme:",        "Master of Computer Applications (MCA) — 2nd Year"),
        ("Live Deployment:",  "https://sentinelgpt-ai.vercel.app"),
        ("GitHub Repository:","https://github.com/Pravallika2025/sentigraud-ai-.git"),
    ]
    for i,(k,v) in enumerate(meta_rows):
        cells = meta.rows[i].cells
        cells[0].paragraphs[0].paragraph_format.space_after = Pt(4)
        cells[1].paragraphs[0].paragraph_format.space_after = Pt(4)
        rb = cells[0].paragraphs[0].add_run(k)
        rb.font.name = "Calibri"; rb.font.bold = True; rb.font.color.rgb = C_DARK
        rv = cells[1].paragraphs[0].add_run(v)
        rv.font.name = "Calibri"; rv.font.size = Pt(11)
    add_tbl_border(meta)

    doc.add_page_break()

    # ════════════════════════════════════════════════════════════════
    # 1. PROBLEM STATEMENT
    # ════════════════════════════════════════════════════════════════
    h1("1.  Problem Statement")
    para(
        "Modern cybersecurity operations face severe challenges managing the overwhelming volume of "
        "network telemetry and security alerts generated by enterprise IT infrastructure. Security "
        "Information and Event Management (SIEM) systems process millions of event logs, network probes, "
        "and API requests daily. Many organizations still rely heavily on manual log inspection, static "
        "firewall rules, and fragmented monitoring tools — creating serious operational bottlenecks, "
        "severe analyst alert fatigue, and dangerously slow incident response times that allow threats "
        "to propagate unchecked through internal networks."
    )
    para(
        "A central challenge is identifying sophisticated multi-stage attacks such as credential stuffing, "
        "Distributed Denial of Service (DDoS) vectors, SQL injection payloads, and brute-force "
        "authentication spikes. Traditional rule-based intrusion detection systems generate high rates of "
        "false positives while failing to correlate anomalous network behavior with recognized attack "
        "frameworks like MITRE ATT&CK. Manual quarantine procedures further delay response, exposing "
        "internal networks to lateral movement and unauthorized data exfiltration."
    )
    para(
        "Existing security dashboards lack transparent decision-making, intelligent payload analysis, and "
        "real-time visualization. Analysts are left without instant remediation guidance, unsure why a "
        "specific threat score was assigned or which immediate countermeasures to execute."
    )
    para(
        "To address these challenges, this project presents SentinelGPT — an AI-Powered Large Language "
        "Model Framework for Advanced Cyber Threat Detection and Analysis. The system uses intelligent "
        "software agents to automatically monitor network telemetry, compute risk scores via heuristic "
        "anomaly algorithms, map threats to MITRE ATT&CK techniques, and autonomously quarantine "
        "high-risk IP addresses — drastically reducing manual effort and incident response latency."
    )

    # ════════════════════════════════════════════════════════════════
    # DIFFERENCE TABLE
    # ════════════════════════════════════════════════════════════════
    h1("2.  Difference: Traditional System vs. Proposed SentinelGPT")
    para(
        "The table below contrasts conventional security operations with the proposed SentinelGPT "
        "AI-powered system across key operational dimensions:"
    )

    dt = doc.add_table(rows=9, cols=2)
    dt.style = "Table Grid"
    dt.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Header row shading
    for cell, txt in zip(dt.rows[0].cells, ["Traditional Security System","Proposed SentinelGPT System"]):
        cell._tc.get_or_add_tcPr().append(
            parse_xml(r'<w:shd %s w:val="clear" w:color="auto" w:fill="003366"/>' % nsdecls("w"))
        )
        pr = cell.paragraphs[0]
        pr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = pr.add_run(txt); r.bold = True
        r.font.color.rgb = RGBColor(0xFF,0xFF,0xFF); r.font.name = "Calibri"; r.font.size = Pt(11)

    rows_data = [
        ("Manual log inspection; static firewall rules; delayed response.",
         "Autonomous agents monitor telemetry 24/7 with zero manual input required."),
        ("High alert fatigue; delayed incident detection.",
         "Heuristic scoring (0–100) eliminates alert fatigue; threats detected instantly."),
        ("IP blocking requires manual admin intervention and rule updates.",
         "Autonomous Quarantine Agent auto-isolates IPs scoring ≥75 in real time."),
        ("Lacks standardized MITRE ATT&CK threat-framework alignment.",
         "All incidents automatically mapped to MITRE ATT&CK tactics and techniques."),
        ("Triage requires lengthy manual research by analysts.",
         "Integrated AI Triage Assistant delivers instant remediation guidance."),
        ("Limited real-time visualization of threat velocity.",
         "Glassmorphic dashboard with live telemetry charts and perimeter heatmaps."),
        ("Payload analysis performed manually with external tools.",
         "Built-in Payload Scanner auto-analyzes files with verdict reports."),
        ("Incident data export requires manual log collection.",
         "Instant JSON incident-log export via REST API (/api/export)."),
    ]
    for i,(l,r) in enumerate(rows_data):
        cells = dt.rows[i+1].cells
        # Alternate row shading
        if i % 2 == 0:
            for c in cells:
                c._tc.get_or_add_tcPr().append(
                    parse_xml(r'<w:shd %s w:val="clear" w:color="auto" w:fill="EEF4FB"/>' % nsdecls("w"))
                )
        cells[0].paragraphs[0].add_run(l).font.name = "Calibri"
        cells[1].paragraphs[0].add_run(r).font.name = "Calibri"
        for c in cells:
            c.paragraphs[0].paragraph_format.space_before = Pt(3)
            c.paragraphs[0].paragraph_format.space_after  = Pt(3)

    doc.add_page_break()

    # ════════════════════════════════════════════════════════════════
    # 3. PROPOSED SYSTEM
    # ════════════════════════════════════════════════════════════════
    h1("3.  Proposed Solution & System Overview")
    para(
        "SentinelGPT is an intelligent, full-stack, cloud-native cyber defense application that automates "
        "threat detection, security monitoring, and incident mitigation. It uses intelligent software agents "
        "that continuously evaluate network telemetry against heuristic scoring models and security policies, "
        "replacing slow manual workflows with instant automated decisions."
    )
    para(
        "The Telemetry Monitor Agent analyzes packet rates, IP origins, and request patterns to compute a "
        "risk score (0–100). Each incident is mapped to a MITRE ATT&CK technique (e.g., T1078 Valid Accounts, "
        "T1498 Network DoS, T1190 Exploit Public App) and enriched with AI-driven remediation guidance. "
        "When a score reaches or exceeds 75, the Autonomous Quarantine Agent immediately isolates the "
        "offending IP in the database — providing administrators full manual override and revocation control."
    )

    # ════════════════════════════════════════════════════════════════
    # 4. SYSTEM ARCHITECTURE
    # ════════════════════════════════════════════════════════════════
    h1("4.  System Architecture")
    para(
        "SentinelGPT follows a modular, decoupled architecture. The operator authenticates via the React "
        "SPA frontend, which connects to the FastAPI backend controller for telemetry snapshots and "
        "WebSocket streaming. Two intelligent agents process telemetry: the Telemetry Monitor Agent "
        "(anomaly scoring + MITRE ATT&CK mapping) and the Autonomous Quarantine Agent (IP isolation + "
        "validation). All incident logs and quarantine data are stored via SQLAlchemy ORM in SQLite."
    )
    img_center(arch_img, w=5.9, cap="Figure 1: SentinelGPT End-to-End System Architecture")

    # ════════════════════════════════════════════════════════════════
    # 5. TECHNOLOGIES USED
    # ════════════════════════════════════════════════════════════════
    h1("5.  Technologies Used")

    h2("Frontend Stack")
    for lbl, desc in [
        ("React 19: ", "UI library for dynamic glassmorphic component trees and real-time state management."),
        ("Vite 5.4: ", "Next-gen build tool — fast Hot Module Replacement and optimized production bundles."),
        ("Recharts: ", "Data visualization library — threat velocity charts, risk gauges, severity donuts."),
        ("Web Audio API: ", "Browser-native alarm system that plays audio alerts on critical threat detection."),
    ]:
        bullet(lbl, desc)

    h2("Backend Stack")
    for lbl, desc in [
        ("Python 3.11+: ", "Core language for agent logic, threat heuristics, and database models."),
        ("FastAPI: ", "Async, high-performance framework — RESTful API, WebSockets, auto Swagger docs."),
        ("Uvicorn: ", "ASGI server for local development and Vercel serverless function routing."),
        ("PyJWT: ", "HS256 JSON Web Token generation and validation — 8-hour expiring sessions."),
    ]:
        bullet(lbl, desc)

    h2("Database & Deployment")
    for lbl, desc in [
        ("SQLAlchemy ORM: ", "Type-safe Python ORM for all database reads and writes."),
        ("SQLite: ", "Lightweight relational DB for incident logs, quarantine data, and user accounts."),
        ("Vercel Serverless: ", "Cloud host serving React static build and Python API functions at the edge."),
        ("GitHub Actions: ", "CI/CD pipeline — automated build and deploy on every push to main."),
    ]:
        bullet(lbl, desc)

    doc.add_page_break()

    # ════════════════════════════════════════════════════════════════
    # 6. ARCHITECTURE FLOW / AGENTS
    # ════════════════════════════════════════════════════════════════
    h1("6.  Architecture Flow & Agents Used")
    img_center(workflow_img, w=6.0, cap="Figure 2: Agent Workflow — From Telemetry Ingestion to SOC Output")

    h2("Agent 1 — Telemetry Monitor & Threat Detection Agent")
    para(
        "Continuously inspects incoming network log events, extracts IP details, computes a heuristic "
        "risk score (0–100), and assigns a MITRE ATT&CK tactic/technique tag. Produces a structured "
        "SOC Incident payload persisted to the database and streamed live to the frontend dashboard."
    )

    h2("Agent 2 — Autonomous Quarantine & Validation Agent")
    para(
        "Evaluates every incident against the severity threshold (≥75 = Critical/High). Qualifying "
        "incidents are automatically written to the Blocked IPs table, quarantining the offending IP. "
        "The agent validates revoke requests and generates AI-driven remediation advice to prevent "
        "false-positive lockouts."
    )

    h1("7.  Algorithms Used")
    for lbl, desc in [
        ("Heuristic Threat Scoring: ",
         "Evaluates request velocity, payload anomaly patterns, and IP reputation to produce a "
         "normalized 0–100 risk score without relying solely on static signatures."),
        ("Severity Matrix Classifier: ",
         "Maps scores to Critical (≥75), High (60–74), Medium (40–59), and Low (<40) priority "
         "tiers — driving the automated quarantine and alerting logic."),
        ("Velocity Rate Anomaly Detector: ",
         "Monitors burst traffic spikes per IP over sliding time windows to detect active DDoS "
         "attacks and port-scan sweeps."),
    ]:
        bullet(lbl, desc)

    # ════════════════════════════════════════════════════════════════
    # 8. IMPLEMENTATION PHASES
    # ════════════════════════════════════════════════════════════════
    h1("8.  Implementation Phases")
    phases = [
        ("Phase 1 — Requirement Analysis:", " Identified SOC pain points, defined scoring metrics, mapped MITRE ATT&CK coverage."),
        ("Phase 2 — System Design:",        " Architected decoupled React SPA + FastAPI serverless backend; finalized API contracts."),
        ("Phase 3 — Database Schema:",      " Designed ORM models — Users, SOC Incidents, Perimeter Logs, Blocked IPs."),
        ("Phase 4 — Frontend Development:", " Built glassmorphic components — ThreatChart, RiskGauge, BlockedIPs, Login, Dashboard."),
        ("Phase 5 — Backend & JWT Auth:",   " Implemented REST routes (/api/snapshot, /api/block_ip, /api/sim_threat) with HS256 JWT."),
        ("Phase 6 — Agentic AI Dev:",       " Programmed Telemetry Monitor Agent and Autonomous Quarantine Agent workflows."),
        ("Phase 7 — Integration Testing:",  " Simulated threat injection to verify scoring accuracy, quarantine triggers, and revocation."),
        ("Phase 8 — Cloud Deployment:",     " Deployed full-stack to Vercel Serverless; verified Swagger docs in production."),
    ]
    for lbl, desc in phases:
        bullet(lbl, desc)

    # ════════════════════════════════════════════════════════════════
    # 9. APPLICATIONS
    # ════════════════════════════════════════════════════════════════
    h1("9.  Applications")
    apps = [
        ("Enterprise SOC Operations:", " Continuous perimeter monitoring and automated response for dedicated security teams."),
        ("Financial Institutions:",    " Protects banking portals from credential stuffing, brute-force, and fraud attempts."),
        ("Cloud Service Providers:",   " Safeguards serverless APIs and microservices from unauthorized probes and exploits."),
        ("Healthcare Networks:",       " Secures patient data endpoints against ransomware and malware payload injection."),
        ("E-Commerce Platforms:",      " Prevents DDoS and SQL injection attacks during high-traffic sales events."),
        ("Academic Institutions:",     " Monitors campus networks and prevents faculty/student account hijacking."),
    ]
    for lbl, desc in apps:
        bullet(lbl, desc)

    doc.add_page_break()

    # ════════════════════════════════════════════════════════════════
    # 10. UI SCREENSHOTS
    # ════════════════════════════════════════════════════════════════
    h1("10.  User Interface Screenshots")
    para("The following figures depict the live operational screens of the SentinelGPT system:", justify=False)

    # 2 × 2 screenshot grid
    def two_col(p1, c1, p2, c2):
        t = doc.add_table(rows=2, cols=2)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        for row in t.rows:
            for cell in row.cells:
                cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
                tcp = cell._tc.get_or_add_tcPr()
                tcp.append(parse_xml(
                    r'<w:tcBorders %s>'
                    r'<w:top w:val="none"/><w:bottom w:val="none"/>'
                    r'<w:left w:val="none"/><w:right w:val="none"/>'
                    r'</w:tcBorders>' % nsdecls("w")
                ))
        for cell, ip in zip(t.rows[0].cells, [p1, p2]):
            pp = cell.paragraphs[0]
            pp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            pp.paragraph_format.space_before = Pt(6)
            pp.paragraph_format.space_after  = Pt(2)
            if os.path.exists(ip):
                pp.add_run().add_picture(ip, width=Inches(2.95))
        for cell, cap in zip(t.rows[1].cells, [c1, c2]):
            pp = cell.paragraphs[0]
            pp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            pp.paragraph_format.space_after = Pt(8)
            r = pp.add_run(cap); r.font.italic = True
            r.font.size = Pt(9.5); r.font.color.rgb = C_GRAY

    two_col(IMG_DASHBOARD, "Fig 3: SentinelGPT SOC Operations Dashboard",
            IMG_LOGIN,     "Fig 4: Operator Authentication Portal")
    two_col(IMG_CHAT,      "Fig 5: AI Threat Triage Assistant",
            IMG_SCANNER,   "Fig 6: Heuristic Payload File Scanner")

    # ════════════════════════════════════════════════════════════════
    # 11. API TABLE
    # ════════════════════════════════════════════════════════════════
    h1("11.  REST API Endpoints")
    para("The backend exposes the following endpoints for telemetry, quarantine control, and authentication:")

    at = doc.add_table(rows=7, cols=3)
    at.style = "Table Grid"
    at.alignment = WD_TABLE_ALIGNMENT.CENTER
    for cell, txt in zip(at.rows[0].cells, ["Endpoint", "Method", "Description"]):
        cell._tc.get_or_add_tcPr().append(
            parse_xml(r'<w:shd %s w:val="clear" w:color="auto" w:fill="003366"/>' % nsdecls("w"))
        )
        r = cell.paragraphs[0].add_run(txt)
        r.bold = True; r.font.color.rgb = RGBColor(0xFF,0xFF,0xFF)
        r.font.name = "Calibri"

    api_data = [
        ("/api/login",      "POST", "Authenticates operator; returns 8-hour JWT token"),
        ("/api/register",   "POST", "Creates new operator account with hashed password"),
        ("/api/snapshot",   "GET",  "Returns telemetry snapshot, incident logs & quarantine list"),
        ("/api/block_ip",   "POST", "Adds target IP address to active firewall quarantine"),
        ("/api/unblock_ip", "POST", "Revokes quarantine for target IP address"),
        ("/api/export",     "GET",  "Downloads full incident history as JSON"),
    ]
    for i,(ep,method,desc) in enumerate(api_data):
        cells = at.rows[i+1].cells
        if i % 2 == 0:
            for c in cells:
                c._tc.get_or_add_tcPr().append(
                    parse_xml(r'<w:shd %s w:val="clear" w:color="auto" w:fill="EEF4FB"/>' % nsdecls("w"))
                )
        for c, t in zip(cells, [ep, method, desc]):
            c.paragraphs[0].add_run(t).font.name = "Calibri"

    # ════════════════════════════════════════════════════════════════
    # 12. CONCLUSION
    # ════════════════════════════════════════════════════════════════
    h1("12.  Conclusion")
    para(
        "SentinelGPT demonstrates that integrating Agentic AI with a modern full-stack serverless "
        "architecture can transform traditional reactive security operations into a proactive, automated "
        "cyber defense system. By replacing manual log review with autonomous software agents, the platform "
        "eliminates alert fatigue, reduces incident response latency to near zero, and provides continuous "
        "24/7 network perimeter protection — establishing a strong foundation for next-generation "
        "AI-powered cybersecurity frameworks."
    )

    h1("13.  References")
    refs = [
        "FastAPI Documentation — https://fastapi.tiangolo.com/",
        "React 19 Docs — https://react.dev/",
        "MITRE ATT&CK Framework — https://attack.mitre.org/",
        "SQLAlchemy ORM — https://docs.sqlalchemy.org/",
        "Vercel Platform Docs — https://vercel.com/docs",
        "Russell, S. & Norvig, P. (2021). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.",
    ]
    for i, ref in enumerate(refs, 1):
        bullet(f"[{i}]  ", ref)

    h1("14.  Live Deployment & GitHub Links")
    bullet("Single Live Dashboard Link:  ", "https://sentinelgpt-ai.vercel.app")
    bullet("Interactive Swagger API Docs: ", "https://sentinelgpt-ai.vercel.app/docs")
    bullet("Official GitHub Repository:   ", "https://github.com/Pravallika2025/sentigraud-ai-.git")

    # ── Save ──────────────────────────────────────────────────────
    for path in save_paths:
        doc.save(path)
        print(f"Saved: {path}")

# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    build_doc([
        os.path.join(BASE_DIR, "docs", "SentinelGPT_Project_Report.docx"),
        os.path.join(DESKTOP_DIR, "SentinelGPT_Project_Report.docx"),
    ])
