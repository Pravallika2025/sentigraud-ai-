import os
import docx
from docx.shared import Inches, Pt, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"c:\Users\User\pravallika sentinel"
IMG_DIR = os.path.join(BASE_DIR, "docs", "images")
DESKTOP_DIR = (r"C:\Users\User\OneDrive\Desktop"
               if os.path.exists(r"C:\Users\User\OneDrive\Desktop")
               else r"C:\Users\User\Desktop")
os.makedirs(IMG_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────
# 1.  DIAGRAM HELPERS
# ─────────────────────────────────────────────────────────────
def _make_font(size):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        return ImageFont.load_default()

def _box(draw, x1, y1, x2, y2, bg, border, lines, font):
    draw.rectangle([x1, y1, x2, y2], fill=bg, outline=border, width=2)
    cx = (x1 + x2) // 2
    if isinstance(lines, str):
        lines = [lines]
    total_h = len(lines) * (font.size if hasattr(font, 'size') else 14) + (len(lines)-1)*4
    ty = (y1 + y2)//2 - total_h//2
    for i, ln in enumerate(lines):
        draw.text((cx, ty + i*18), ln, fill="#111111", font=font, anchor="mm")

def _arrow(draw, x1, y1, x2, y2):
    draw.line([x1, y1, x2, y2], fill="#003366", width=2)
    draw.polygon([(x2, y2),(x2-5, y2-8),(x2+5, y2-8)], fill="#003366")

def generate_architecture_diagram():
    W, H = 860, 620
    img = Image.new('RGB', (W, H), "#ffffff")
    d   = ImageDraw.Draw(img)
    f14 = _make_font(14); f11 = _make_font(11)

    # Operator
    _box(d, 250,10,610,50,"#E6F2FF","#003366",["SECURITY OPERATOR / ADMINISTRATOR"],f14)
    _arrow(d,430,50,430,75)

    # Frontend
    _box(d,80,75,780,125,"#E6F2FF","#005580",
         ["FRONTEND  (React 19 + Vite 5.4 SPA)",
          "Login · Dashboard · Telemetry Feed · Quarantine Control · AI Chat"],f11)
    _arrow(d,430,125,430,150)

    # Backend
    _box(d,80,150,780,200,"#E6FFE6","#008040",
         ["FASTAPI BACKEND CONTROLLER  (index.py / main.py)",
          "REST Router · JWT Auth · CORS Middleware · WebSocket Engine"],f11)
    _arrow(d,430,200,430,225)

    # Split
    d.line([200,225,660,225],fill="#003366",width=2)
    _arrow(d,200,225,200,255); _arrow(d,660,225,660,255)

    # Agent boxes
    _box(d,30,255,390,345,"#FFF7ED","#D97706",
         ["TELEMETRY MONITOR AGENT",
          "Anomaly Scoring · Risk Score 0–100",
          "MITRE ATT&CK Technique Mapping"],f11)
    _box(d,470,255,830,345,"#F5F3FF","#7E22CE",
         ["AUTONOMOUS QUARANTINE AGENT",
          "Auto-Block Score ≥ 75",
          "AI Remediation · Revoke Control"],f11)

    # Merge to DB
    d.line([200,345,200,370],fill="#003366",width=2)
    d.line([660,345,660,370],fill="#003366",width=2)
    d.line([200,370,660,370],fill="#003366",width=2)
    _arrow(d,430,370,430,395)

    # DB
    _box(d,130,395,730,445,"#F0FDF4","#15803D",
         ["SQLALCHEMY ORM  ·  SQLITE DATABASE",
          "Users  |  SOC Incidents  |  Blocked IPs  |  Perimeter Logs"],f11)
    _arrow(d,430,445,430,470)

    # Output
    _box(d,100,470,760,520,"#F1F5F9","#334155",
         ["VERCEL SERVERLESS CLOUD DEPLOYMENT",
          "Live SOC Dashboard  |  JSON Export  |  Swagger API Docs"],f11)

    path = os.path.join(IMG_DIR,"architecture_diagram.png")
    img.save(path); return path

def generate_workflow_diagram():
    W, H = 860, 540
    img = Image.new('RGB',(W,H),"#ffffff")
    d   = ImageDraw.Draw(img)
    f13 = _make_font(13); f11 = _make_font(11)

    steps = [
        (80,15,780,65, "#E6F2FF","#005580",
         ["NETWORK TRAFFIC & TELEMETRY FEED",
          "Inbound Logs · IP Probes · HTTP Requests"]),
        (80,95,780,150,"#F0F4F8","#003366",
         ["FRONTEND DASHBOARD & ALERTS FEED",
          "Displays Live Metrics · Captures Operator Controls"]),
        (80,180,780,245,"#FFF7ED","#D97706",
         ["TELEMETRY MONITOR & THREAT DETECTION AGENT",
          "Analyzes IP Velocity & Payload · Calculates Risk Score (0–100)",
          "Maps to MITRE ATT&CK Technique"]),
        (80,275,780,340,"#F5F3FF","#7E22CE",
         ["AUTONOMOUS QUARANTINE & VALIDATION AGENT",
          "Evaluates Risk Threshold (≥75 → Auto Quarantine)",
          "Prevents False Positives · AI Remediation Advice"]),
        (160,370,700,420,"#F0FDF4","#15803D",
         ["DATABASE STORAGE LAYER",
          "SOC Incidents · Blocked IPs · User Accounts"]),
    ]
    for (x1,y1,x2,y2,bg,border,lines) in steps:
        _box(d,x1,y1,x2,y2,bg,border,lines,f11)

    # arrows between steps
    pairs = [(430,65,430,95),(430,150,430,180),(430,245,430,275),(430,340,430,370)]
    for (x1,y1,x2,y2) in pairs:
        _arrow(d,x1,y1,x2,y2)
    _arrow(d,430,420,430,445)

    # Output row
    outs = [("DASHBOARD",60,450),("CHARTS",200,450),("QUARANTINE",340,450),
            ("AI CHAT",480,450),("SCANNER",620,450),("EXPORT",760,450)]
    d.line([60,445,760,445],fill="#003366",width=2)
    for (txt,cx,_) in outs:
        _arrow(d,cx,445,cx,455)
        _box(d,cx-55,455,cx+55,505,"#E2E8F0","#475569",[txt],f11)

    _arrow(d,430,505,430,525)
    _box(d,200,525,660,545,"#F1F5F9","#003366",["SENTINELGPT LIVE SOC DASHBOARD"],f13)

    path = os.path.join(IMG_DIR,"agent_workflow_diagram.png")
    img.save(path); return path

# ─────────────────────────────────────────────────────────────
# 2.  DOCUMENT BUILDER
# ─────────────────────────────────────────────────────────────
def build_doc(save_paths):
    arch_img     = generate_architecture_diagram()
    workflow_img = generate_workflow_diagram()

    doc = docx.Document()
    sec = doc.sections[0]
    sec.top_margin    = Inches(0.9)
    sec.bottom_margin = Inches(0.9)
    sec.left_margin   = Inches(1.0)
    sec.right_margin  = Inches(1.0)

    # Global default
    doc.styles['Normal'].font.name = 'Times New Roman'
    doc.styles['Normal'].font.size = Pt(11)

    # ── helpers ────────────────────────────────────────────────
    def h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after  = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name  = 'Times New Roman'
        run.font.size  = Pt(14)
        run.font.bold  = True
        run.font.color.rgb = RGBColor(0x00,0x33,0x66)

    def h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after  = Pt(2)
        run = p.add_run(text)
        run.font.name  = 'Times New Roman'
        run.font.size  = Pt(12)
        run.font.bold  = True
        run.font.color.rgb = RGBColor(0x1A,0x4A,0x7A)

    def para(text, bold_label=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_label:
            r = p.add_run(bold_label)
            r.font.name = 'Times New Roman'
            r.font.bold = True
            r.font.size = Pt(11)
        r2 = p.add_run(text)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)

    def bullet(label, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after  = Pt(2)
        p.paragraph_format.left_indent  = Inches(0.25)
        p.paragraph_format.line_spacing = 1.1
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r1 = p.add_run(label)
        r1.font.name = 'Times New Roman'
        r1.font.bold = True
        r1.font.size = Pt(11)
        r2 = p.add_run(text)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)

    def img_center(path, w=5.8, caption=None):
        if not os.path.exists(path):
            return
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after  = Pt(2)
        p.add_run().add_picture(path, width=Inches(w))
        if caption:
            c = doc.add_paragraph()
            c.alignment = WD_ALIGN_PARAGRAPH.CENTER
            c.paragraph_format.space_after = Pt(6)
            r = c.add_run(caption)
            r.font.name   = 'Times New Roman'
            r.font.size   = Pt(10)
            r.font.italic = True

    def table_border(tbl):
        for row in tbl.rows:
            for cell in row.cells:
                tcp = cell._tc.get_or_add_tcPr()
                tcp.append(parse_xml(
                    r'<w:tcBorders %s>'
                    r'<w:top    w:val="single" w:sz="4" w:color="AAAAAA"/>'
                    r'<w:bottom w:val="single" w:sz="4" w:color="AAAAAA"/>'
                    r'<w:left   w:val="single" w:sz="4" w:color="AAAAAA"/>'
                    r'<w:right  w:val="single" w:sz="4" w:color="AAAAAA"/>'
                    r'</w:tcBorders>' % nsdecls('w')
                ))

    # ══════════════════════════════════════════════════════════
    # COVER PAGE
    # ══════════════════════════════════════════════════════════
    cover = doc.add_paragraph()
    cover.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cover.paragraph_format.space_before = Pt(60)
    cover.paragraph_format.space_after  = Pt(16)
    r = cover.add_run("SentinelGPT: An AI-Powered Large Language Model\nFramework for Advanced Cyber Threat Detection\nand Analysis")
    r.font.name = 'Times New Roman'; r.font.size = Pt(20); r.font.bold = True

    sub = doc.add_paragraph()
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub.paragraph_format.space_after = Pt(100)
    sr = sub.add_run("A Project Report Submitted for the Partial Fulfillment\nof the Requirements for the Award of the Degree of\nMaster of Computer Applications (MCA)")
    sr.font.name = 'Times New Roman'; sr.font.size = Pt(13)

    info = doc.add_paragraph()
    info.alignment = WD_ALIGN_PARAGRAPH.CENTER
    info.paragraph_format.space_after = Pt(4)
    for line, bold, size in [
        ("Submitted by\n", False, 12),
        ("Pravallika Kalangi\n", True,  15),
        ("Roll No: 24VV1F0044\n", False, 13),
        ("MCA 2nd Year", False, 13),
    ]:
        rr = info.add_run(line)
        rr.font.name = 'Times New Roman'; rr.font.size = Pt(size); rr.font.bold = bold

    doc.add_page_break()

    # ══════════════════════════════════════════════════════════
    # 1. PROBLEM STATEMENT
    # ══════════════════════════════════════════════════════════
    h1("1.  Problem Statement")
    para(
        "Modern cybersecurity operations face severe challenges managing the overwhelming volume of "
        "network telemetry and security alerts generated by enterprise IT infrastructure. Security "
        "information and event management (SIEM) systems process millions of event logs, network probes, "
        "and API requests daily. Many organizations still rely on manual log inspection, static firewall "
        "rules, and fragmented monitoring tools — creating operational bottlenecks, analyst alert fatigue, "
        "and dangerously slow incident response times."
    )
    para(
        "A key challenge is identifying sophisticated multi-stage attacks such as credential stuffing, "
        "DDoS vectors, SQL injection payloads, and brute-force authentication spikes. Traditional "
        "rule-based intrusion detection systems generate high false-positive rates while failing to "
        "correlate anomalous behavior with the MITRE ATT&CK framework. Manual quarantine procedures "
        "further delay response, exposing networks to lateral movement and data exfiltration."
    )
    para(
        "To address these challenges, this project proposes SentinelGPT: an AI-Powered LLM Framework "
        "for Advanced Cyber Threat Detection and Analysis. It uses intelligent software agents to "
        "automatically monitor telemetry, calculate risk scores using heuristic anomaly algorithms, "
        "map threats to MITRE ATT&CK, and autonomously quarantine high-risk IP addresses — significantly "
        "reducing manual effort and incident response latency."
    )

    # ── Difference Table ───────────────────────────────────────
    h1("2.  Difference: Traditional System vs. Proposed SentinelGPT")
    diff_table = doc.add_table(rows=9, cols=2)
    diff_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    diff_table.style = 'Table Grid'

    hdr = diff_table.rows[0].cells
    for cell, txt in zip(hdr, ["Traditional Security System", "Proposed SentinelGPT System"]):
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(txt); r.bold = True; r.font.size = Pt(11)
        cell._tc.get_or_add_tcPr().append(
            parse_xml(r'<w:shd %s w:val="clear" w:color="auto" w:fill="D0E4F7"/>' % nsdecls('w'))
        )

    rows_data = [
        ("Manual log inspection and static firewall rules.",
         "Autonomous agents monitor telemetry 24/7 with no manual input."),
        ("High alert fatigue and delayed incident detection.",
         "Real-time heuristic scoring (0–100) eliminates fatigue and detects threats instantly."),
        ("IP blocking requires manual admin intervention.",
         "Autonomous Quarantine Agent auto-isolates IPs with score ≥ 75 in real time."),
        ("Lacks attack-framework-aligned threat classification.",
         "All incidents are automatically mapped to MITRE ATT&CK tactics and techniques."),
        ("Triage requires extensive manual security research.",
         "Integrated AI Triage Assistant provides instant remediation guidance."),
        ("No real-time visualization of threat velocity.",
         "Glassmorphic dashboard with live telemetry charts and perimeter heatmaps."),
        ("Payload analysis done manually with external tools.",
         "Built-in Payload Scanner analyzes files with automatic verdict reports."),
        ("Scaling across cloud environments is complex.",
         "Serverless architecture (FastAPI + Vercel) provides seamless scalability."),
    ]
    for i, (l, r) in enumerate(rows_data):
        cells = diff_table.rows[i+1].cells
        cells[0].paragraphs[0].add_run(l).font.size = Pt(10)
        cells[1].paragraphs[0].add_run(r).font.size = Pt(10)

    doc.add_page_break()

    # ══════════════════════════════════════════════════════════
    # 3. PROPOSED SOLUTION
    # ══════════════════════════════════════════════════════════
    h1("3.  Proposed Solution")
    para(
        "SentinelGPT is an intelligent full-stack web-based cyber defense platform that automates "
        "threat detection, security monitoring, and incident mitigation. The system uses intelligent "
        "software agents that continuously evaluate network telemetry against heuristic scoring models "
        "and security policies, replacing slow manual workflows with instant automated decisions."
    )
    para(
        "The Telemetry Monitor Agent analyzes packet rates, IP origins, and request patterns to compute "
        "a risk score from 0 to 100. Each incident is mapped to a MITRE ATT&CK technique (e.g., T1078 "
        "Valid Accounts, T1498 Network DoS) with AI-driven remediation guidance. When a score reaches or "
        "exceeds 75, the Autonomous Quarantine Agent immediately isolates the offending IP in the database. "
        "Administrators retain full manual override control for revocation and simulated threat injection."
    )

    h1("4.  System Architecture")
    para("The diagram below shows the complete end-to-end architecture of SentinelGPT:")
    img_center(arch_img, w=6.0, caption="Fig 1: SentinelGPT System Architecture")

    # ══════════════════════════════════════════════════════════
    # 5. TECHNOLOGIES
    # ══════════════════════════════════════════════════════════
    h1("5.  Technologies Used")

    h2("Frontend")
    for label, desc in [
        ("React 19: ", "Modern UI library for dynamic component trees and real-time state management."),
        ("Vite 5.4: ", "Next-gen build tool providing fast HMR and optimized production bundles."),
        ("Recharts: ", "Renders live threat velocity charts, risk gauges, and severity donut graphs."),
        ("CSS3 / Glassmorphism: ", "Cyberpunk dark-mode aesthetic with backdrop-blur and neon accents."),
    ]:
        bullet(label, desc)

    h2("Backend")
    for label, desc in [
        ("Python 3.11+: ", "Primary language for agent logic, threat algorithms, and database models."),
        ("FastAPI: ", "Async, high-performance framework for RESTful APIs, WebSockets, and OpenAPI docs."),
        ("Uvicorn: ", "High-speed ASGI server for both local dev and Vercel serverless execution."),
        ("PyJWT: ", "HS256 JSON Web Token generation and validation for secure 8-hour sessions."),
    ]:
        bullet(label, desc)

    h2("Database & Deployment")
    for label, desc in [
        ("SQLAlchemy ORM: ", "Safe, type-annotated Python ORM for all database interactions."),
        ("SQLite: ", "Zero-config relational DB for incident logs, blocked IPs, and user accounts."),
        ("Vercel Serverless: ", "Production cloud host serving the React build and Python API functions."),
        ("GitHub Actions CI/CD: ", "Automated build and deployment pipeline on every push to main."),
    ]:
        bullet(label, desc)

    doc.add_page_break()

    # ══════════════════════════════════════════════════════════
    # 6. ARCHITECTURE FLOW / AGENTS
    # ══════════════════════════════════════════════════════════
    h1("6.  Architecture Flow & Agents Used")
    img_center(workflow_img, w=6.2, caption="Fig 2: SentinelGPT Agent Workflow & Data Flow")

    h2("Agent 1 — Telemetry Monitor & Threat Detection Agent")
    para(
        "Continuously inspects incoming network log events, extracts IP details, computes a heuristic "
        "risk score (0–100), and assigns a MITRE ATT&CK tactic/technique tag. Produces a structured "
        "incident payload that is persisted to the SOC Incidents database table and streamed to the "
        "frontend dashboard in real time."
    )

    h2("Agent 2 — Autonomous Quarantine & Validation Agent")
    para(
        "Evaluates every incident against the severity threshold. Incidents scoring ≥ 75 are "
        "automatically written to the Blocked IPs table, effectively quarantining the offending IP. "
        "The agent also validates revoke requests and generates AI-driven remediation advice, preventing "
        "false-positive lockouts through secondary validation checks."
    )

    h1("7.  Algorithms Used")
    for label, desc in [
        ("Heuristic Threat Scoring: ",
         "Evaluates request velocity, payload anomaly patterns, and IP reputation to produce a normalized 0–100 risk score."),
        ("Severity Matrix Classifier: ",
         "Maps scores to Critical (≥75), High (60–74), Medium (40–59), and Low (<40) priority tiers — driving automated responses."),
        ("Velocity Rate Anomaly Detector: ",
         "Monitors burst traffic spikes per IP over sliding time windows to detect DDoS and port-scan sweeps."),
    ]:
        bullet(label, desc)

    doc.add_page_break()

    # ══════════════════════════════════════════════════════════
    # 8. IMPLEMENTATION PHASES
    # ══════════════════════════════════════════════════════════
    h1("8.  Implementation Phases")

    phases = [
        ("Phase 1 — Requirement Analysis: ",
         "Identified SOC pain points; defined threat scoring metrics; mapped MITRE ATT&CK coverage."),
        ("Phase 2 — System Design: ",
         "Architected decoupled React SPA + FastAPI serverless backend; finalized API contracts."),
        ("Phase 3 — Database Schema: ",
         "Designed SQLAlchemy ORM models — Users, SOC Incidents, Perimeter Logs, Blocked IPs."),
        ("Phase 4 — Frontend Development: ",
         "Built glassmorphic components — ThreatChart, RiskGaugeChart, BlockedIPs, Login, Dashboard."),
        ("Phase 5 — Backend & JWT Auth: ",
         "Implemented REST routes (/api/snapshot, /api/block_ip, /api/sim_threat) with HS256 JWT auth."),
        ("Phase 6 — Agentic AI Development: ",
         "Programmed the Telemetry Monitor Agent and Autonomous Quarantine Agent workflows."),
        ("Phase 7 — Integration & Testing: ",
         "Injected simulated threats to verify heuristic accuracy, quarantine triggers, and revoke controls."),
        ("Phase 8 — Cloud Deployment: ",
         "Deployed full-stack to Vercel Serverless; configured env vars; verified Swagger docs in production."),
    ]
    for label, desc in phases:
        bullet(label, desc)

    h1("9.  Applications")
    apps = [
        ("Enterprise SOC Operations: ",
         "Continuous perimeter monitoring, real-time threat triage, and automated response for security teams."),
        ("Financial Institutions: ",
         "Protects banking portals from credential stuffing, brute-force, and transaction fraud."),
        ("Cloud Service Providers: ",
         "Safeguards serverless APIs and microservices from unauthorized probes and exploitation."),
        ("Healthcare Networks: ",
         "Secures patient data endpoints against ransomware and malware payload injection."),
        ("E-Commerce Platforms: ",
         "Prevents DDoS disruption and SQL injection attacks during high-traffic periods."),
        ("Academic Institutions: ",
         "Monitors campus networks and prevents faculty/student account hijacking."),
    ]
    for label, desc in apps:
        bullet(label, desc)

    doc.add_page_break()

    # ══════════════════════════════════════════════════════════
    # 9. UI SCREENSHOTS (2-column layout per pair)
    # ══════════════════════════════════════════════════════════
    h1("10.  User Interface Screenshots")

    def two_col_images(path1, cap1, path2, cap2):
        tbl = doc.add_table(rows=2, cols=2)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.style = 'Table Grid'
        for row in tbl.rows:
            for cell in row.cells:
                cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
                tcp = cell._tc.get_or_add_tcPr()
                tcp.append(parse_xml(
                    r'<w:tcBorders %s>'
                    r'<w:top    w:val="none"/><w:bottom w:val="none"/>'
                    r'<w:left   w:val="none"/><w:right  w:val="none"/>'
                    r'</w:tcBorders>' % nsdecls('w')
                ))

        # Row 0 — images
        for cell, img_path in zip(tbl.rows[0].cells, [path1, path2]):
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(2)
            if os.path.exists(img_path):
                p.add_run().add_picture(img_path, width=Inches(3.0))
        # Row 1 — captions
        for cell, cap in zip(tbl.rows[1].cells, [cap1, cap2]):
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(8)
            r = p.add_run(cap); r.font.italic = True; r.font.size = Pt(9.5)

    img1 = os.path.join(IMG_DIR, "dashboard.png")
    img2 = os.path.join(IMG_DIR, "login_page.png")
    img3 = os.path.join(IMG_DIR, "ai_chat.png")
    img4 = os.path.join(IMG_DIR, "file_scanner.png")

    two_col_images(img1, "Fig 3: SOC Operations Dashboard", img2, "Fig 4: Operator Login Portal")
    two_col_images(img3, "Fig 5: AI Threat Triage Assistant", img4, "Fig 6: Heuristic Payload Scanner")

    doc.add_page_break()

    # ══════════════════════════════════════════════════════════
    # 10. CONCLUSION
    # ══════════════════════════════════════════════════════════
    h1("11.  Conclusion")
    para(
        "SentinelGPT demonstrates that integrating Agentic AI with a modern full-stack architecture "
        "(React 19, FastAPI, SQLAlchemy, Vercel) can transform traditional reactive security operations "
        "into a proactive, automated cyber defense system. By replacing manual log review with autonomous "
        "software agents, the platform eliminates alert fatigue, reduces incident response latency to near "
        "zero, and provides continuous 24/7 network perimeter protection — setting a strong foundation for "
        "next-generation AI-powered cybersecurity frameworks."
    )

    h1("12.  References")
    refs = [
        "FastAPI Documentation — https://fastapi.tiangolo.com/",
        "React 19 Docs — https://react.dev/",
        "MITRE ATT&CK Framework — https://attack.mitre.org/",
        "SQLAlchemy ORM — https://docs.sqlalchemy.org/",
        "Vercel Docs — https://vercel.com/docs",
        "Russell, S. & Norvig, P. (2021). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.",
    ]
    for i, ref in enumerate(refs, 1):
        bullet(f"[{i}]  ", ref)

    h1("13.  Live Deployment & GitHub Links")
    bullet("Single Live Dashboard Link:  ", "https://sentinelgpt-ai.vercel.app")
    bullet("Interactive Swagger API Docs: ", "https://sentinelgpt-ai.vercel.app/docs")
    bullet("Official GitHub Repository:   ", "https://github.com/Pravallika2025/sentigraud-ai-.git")

    # ── SAVE ──────────────────────────────────────────────────
    for path in save_paths:
        doc.save(path)
        print(f"Saved -> {path}")

if __name__ == "__main__":
    build_doc([
        os.path.join(BASE_DIR, "docs", "SentinelGPT_Project_Report.docx"),
        os.path.join(DESKTOP_DIR, "SentinelGPT_Project_Report.docx"),
    ])
