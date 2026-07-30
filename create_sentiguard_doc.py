import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"c:\Users\User\pravallika sentinel"
IMG_DIR = os.path.join(BASE_DIR, "docs", "images")
DESKTOP_DIR = r"C:\Users\User\OneDrive\Desktop" if os.path.exists(r"C:\Users\User\OneDrive\Desktop") else r"C:\Users\User\Desktop"

os.makedirs(IMG_DIR, exist_ok=True)

# ------------------------------------------------------------------------------
# 1. GENERATE DIAGRAM IMAGES WITH PIL
# ------------------------------------------------------------------------------
def generate_architecture_diagram():
    width, height = 900, 750
    img = Image.new('RGB', (width, height), color='#ffffff')
    draw = ImageDraw.Draw(img)

    # Try loading font, fallback to default
    try:
        font_title = ImageFont.truetype("arial.ttf", 18)
        font_box = ImageFont.truetype("arial.ttf", 14)
        font_sub = ImageFont.truetype("arial.ttf", 11)
    except Exception:
        font_title = font_box = font_sub = ImageFont.load_default()

    def draw_box(x1, y1, x2, y2, bg_color, border_color, text, subtext=""):
        draw.rectangle([x1, y1, x2, y2], fill=bg_color, outline=border_color, width=2)
        tx = (x1 + x2) // 2
        ty = y1 + 10 if subtext else (y1 + y2) // 2 - 8
        draw.text((tx, ty), text, fill="#000000", font=font_box, anchor="mm")
        if subtext:
            draw.text((tx, ty + 18), subtext, fill="#444444", font=font_sub, anchor="mm")

    def draw_arrow(x1, y1, x2, y2):
        draw.line([x1, y1, x2, y2], fill="#003366", width=3)
        # arrowhead
        draw.polygon([(x2, y2), (x2-6, y2-10), (x2+6, y2-10)], fill="#003366")

    # Title Box
    draw_box(250, 20, 650, 65, "#f0f4f8", "#003366", "SECURITY OPERATOR / ADMINISTRATOR", "(Authentication & Dashboard Control)")
    draw_arrow(450, 65, 450, 95)

    # Frontend Box
    draw_box(150, 95, 750, 160, "#e6f2ff", "#005580", "FRONTEND INTERFACE (React 19 + Vite 5.4 SPA)", "Login | Dashboard | Real-Time Telemetry Feed | Quarantine Control | AI Chat")
    draw_arrow(450, 160, 450, 190)

    # Backend Controller Box
    draw_box(150, 190, 750, 255, "#e6ffe6", "#008040", "FASTAPI BACKEND CONTROLLER (main.py / index.py)", "REST API Router | Session Auth | CORS Middleware | WebSocket Engine")
    draw_arrow(450, 255, 450, 285)

    # Split to Agents
    draw.line([300, 285, 600, 285], fill="#003366", width=3)
    draw_arrow(300, 285, 300, 315)
    draw_arrow(600, 285, 600, 315)

    # Generation & Validation Agents
    draw_box(120, 315, 480, 420, "#fff2e6", "#d97706", "TELEMETRY MONITOR & THREAT AGENT", "Anomaly Scoring & Heuristic Detection")
    draw_box(520, 315, 880, 420, "#f3e8ff", "#7e22ce", "AUTONOMOUS QUARANTINE & TRIAGE AGENT", "High-Risk IP Quarantine & Triage Engine")

    # Merge to DB Layer
    draw.line([300, 420, 300, 445], fill="#003366", width=2)
    draw.line([700, 420, 700, 445], fill="#003366", width=2)
    draw.line([300, 445, 700, 445], fill="#003366", width=2)
    draw_arrow(500, 445, 500, 475)

    # Database Box
    draw_box(180, 475, 820, 545, "#f0fdf4", "#15803d", "SQLALCHEMY ORM DATABASE LAYER", "Admin Table (Users) | SOC Incident Table | Blocked IP Quarantine Table | Logs")
    draw_arrow(500, 545, 500, 575)

    # Output / Cloud Box
    draw_box(150, 575, 850, 655, "#f1f5f9", "#334155", "OUTPUT & CLOUD DEPLOYMENT LAYER", "SQLite Local DB / Vercel Serverless Production Deployment\nLive SOC Dashboard Output | JSON Incident Export | Swagger API Docs")

    arch_img_path = os.path.join(IMG_DIR, "architecture_diagram.png")
    img.save(arch_img_path)
    print(f"Architecture diagram saved to {arch_img_path}")
    return arch_img_path

def generate_agent_workflow_diagram():
    width, height = 850, 720
    img = Image.new('RGB', (width, height), color='#ffffff')
    draw = ImageDraw.Draw(img)

    try:
        font_box = ImageFont.truetype("arial.ttf", 14)
        font_sub = ImageFont.truetype("arial.ttf", 11)
    except Exception:
        font_box = font_sub = ImageFont.load_default()

    def draw_box(x1, y1, x2, y2, bg_color, border_color, text, subtext=""):
        draw.rectangle([x1, y1, x2, y2], fill=bg_color, outline=border_color, width=2)
        tx = (x1 + x2) // 2
        ty = y1 + 10 if subtext else (y1 + y2) // 2 - 6
        draw.text((tx, ty), text, fill="#000000", font=font_box, anchor="mm")
        if subtext:
            draw.text((tx, ty + 18), subtext, fill="#444444", font=font_sub, anchor="mm")

    def draw_arrow(x1, y1, x2, y2):
        draw.line([x1, y1, x2, y2], fill="#003366", width=3)
        draw.polygon([(x2, y2), (x2-6, y2-10), (x2+6, y2-10)], fill="#003366")

    # Step 1: Admin / Network Feed
    draw_box(200, 20, 650, 75, "#e6f2ff", "#005580", "NETWORK TRAFFIC & SECURITY TELEMETRY FEED", "(Inbound Logs, IP Probes, HTTP Requests)")
    draw_arrow(425, 75, 425, 105)

    # Step 2: Frontend Setup & Input
    draw_box(150, 105, 700, 175, "#f0f4f8", "#003366", "FRONTEND DASHBOARD & ALERTS FEED", "Captures Network Packets, Displays Live Metrics & Operator Controls")
    draw_arrow(425, 175, 425, 205)

    # Step 3: Threat Engine Agent
    draw_box(120, 205, 730, 290, "#fff2e6", "#d97706", "TELEMETRY MONITOR & THREAT DETECTION AGENT", "- Analyzes IP Velocity and Payload Signatures\n- Calculates Risk Score (0 - 100) & Assigns MITRE ATT&CK Tactic\n- Detects DDoS, SQLi, Brute Force, and Credential Stuffing")
    draw_arrow(425, 290, 425, 320)

    # Step 4: Autonomous Quarantine Agent
    draw_box(120, 320, 730, 405, "#f3e8ff", "#7e22ce", "AUTONOMOUS QUARANTINE & VALIDATION AGENT", "- Evaluates Risk Score Threshold (Score >= 75 -> Auto Quarantine)\n- Prevents False Positives & Checks Revoke Credentials\n- Generates AI Security Remediation Recommendations")
    draw_arrow(425, 405, 425, 435)

    # Step 5: Database Layer
    draw_box(220, 435, 630, 505, "#f0fdf4", "#15803d", "DATABASE STORAGE LAYER", "Stores SOC Incidents, Blocked IPs, & User Accounts")
    draw_arrow(425, 505, 425, 535)

    # Split to Outputs
    draw.line([120, 535, 730, 535], fill="#003366", width=2)
    for x in [120, 240, 360, 480, 600, 720]:
        draw_arrow(x, 535, x, 565)

    outputs = [
        (60, 565, 180, 625, "#e2e8f0", "#475569", "DASHBOARD\nOverview"),
        (190, 565, 300, 625, "#e2e8f0", "#475569", "REAL-TIME\nCharts"),
        (310, 565, 420, 625, "#e2e8f0", "#475569", "QUARANTINE\nControl"),
        (430, 565, 540, 625, "#e2e8f0", "#475569", "AI CHAT\nTriage"),
        (550, 565, 660, 625, "#e2e8f0", "#475569", "FILE\nScanner"),
        (670, 565, 780, 625, "#e2e8f0", "#475569", "JSON LOG\nExport"),
    ]
    for x1, y1, x2, y2, bg, border, txt in outputs:
        draw_box(x1, y1, x2, y2, bg, border, txt)

    # Final Output Arrow & Box
    draw_arrow(425, 625, 425, 650)
    draw_box(180, 650, 670, 705, "#f1f5f9", "#003366", "OUTPUT: SENTIGUARD AI LIVE DASHBOARD DEPLOYMENT")

    workflow_img_path = os.path.join(IMG_DIR, "agent_workflow_diagram.png")
    img.save(workflow_img_path)
    print(f"Agent workflow diagram saved to {workflow_img_path}")
    return workflow_img_path


# ------------------------------------------------------------------------------
# 2. CREATE WORD DOCUMENT EXACTLY MATCHING OUTLINE & SAMPLE DOC
# ------------------------------------------------------------------------------
def build_sentiguard_word_document(save_paths):
    arch_img = generate_architecture_diagram()
    workflow_img = generate_agent_workflow_diagram()

    doc = docx.Document()

    # 1 inch margins
    section = doc.sections[0]
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

    # Normal Style - Times New Roman 12pt (standard academic report font)
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = RGBColor(0, 0, 0)

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(100)
        p.paragraph_format.space_after = Pt(20)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(22)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_student_info(name, reg_no, year):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p.paragraph_format.space_before = Pt(120)
        p.paragraph_format.line_spacing = 1.3
        
        r1 = p.add_run(f"{name}\n")
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.bold = True

        r2 = p.add_run(f"{reg_no}\n")
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

        r3 = p.add_run(f"{year}\n")
        r3.font.name = 'Times New Roman'
        r3.font.size = Pt(14)

    def add_heading(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_subheading(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_paragraph(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Times New Roman'
            r_bold.font.bold = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        return p

    def add_image_centered(img_path, width_inches=5.8):
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(12)
            p.add_run().add_picture(img_path, width=Inches(width_inches))

    # ==========================================================================
    # PAGE 1: TITLE PAGE (Matching Screenshot 1 style)
    # ==========================================================================
    add_title("Sentiguard AI: Agentic AI Based Autonomous Cyber Defense and SOC Monitoring System")
    add_student_info("Pravallika", "24VV1F0025", "MCA 2nd year")
    doc.add_page_break()

    # ==========================================================================
    # PAGE 2: PROBLEM STATEMENT (Exact 300 - 400 words)
    # ==========================================================================
    add_heading("Problem statement")
    
    p_statement_1 = (
        "Modern cybersecurity operations face severe challenges in managing the overwhelming volume of "
        "network telemetry and security alerts generated by enterprise IT infrastructure. Every day, security "
        "information and event management (SIEM) systems process millions of event logs, network probes, and "
        "API requests across complex cloud environments. In many organizations, security operations centers (SOC) "
        "still rely heavily on manual log inspection, static firewall rules, and fragmented monitoring tools. "
        "This traditional approach creates significant operational bottlenecks, leads to severe analyst alert fatigue, "
        "and drastically increases incident response time, allowing malicious cyber threats to propagate unchecked."
    )
    add_paragraph(p_statement_1)

    p_statement_2 = (
        "One of the major challenges in contemporary cyber defense is identifying sophisticated multi-stage attacks "
        "such as credential stuffing, distributed denial of service (DDoS) vectors, SQL injection payloads, and "
        "brute-force authentication spikes. Traditional rule-based intrusion detection systems often generate high "
        "rates of false positives while failing to correlate anomalous network behavior with recognized attack "
        "frameworks like MITRE ATT&CK. Furthermore, when a critical threat is detected, manual quarantine "
        "procedures require administrators to manually update firewall rules and isolate compromised IP addresses, "
        "a delayed process that exposes internal networks to lateral movement and unauthorized data exfiltration."
    )
    add_paragraph(p_statement_2)

    p_statement_3 = (
        "Existing security dashboards also lack transparent decision-making explanations, intelligent payload "
        "analysis, and real-time visualization capabilities. Security operators are frequently left without instant "
        "remediation guidance, making it difficult to understand why a specific threat score was assigned or what "
        "immediate countermeasures should be executed."
    )
    add_paragraph(p_statement_3)

    p_statement_4 = (
        "To address these critical challenges, this project proposes Sentiguard AI (SentinelGPT): an Agentic AI Based "
        "Autonomous Cyber Defense and SOC Monitoring System. The system utilizes intelligent software agents to automatically "
        "monitor network telemetry, calculate risk scores using heuristic anomaly algorithms, dynamically map threats "
        "to MITRE ATT&CK techniques, and autonomously quarantine high-risk IP addresses. Featuring a responsive glassmorphic "
        "dashboard, real-time telemetry streaming, interactive chart analytics, an AI triage assistant, and static payload "
        "file scanning, Sentiguard AI minimizes manual effort, eliminates response latency, and provides a scalable, "
        "reliable, and intelligent solution for modern enterprise cyber defense."
    )
    add_paragraph(p_statement_4)

    # ==========================================================================
    # PAGE 3: DIFFERENCE TABLE (Traditional vs Proposed Agentic AI System)
    # ==========================================================================
    add_heading("Difference Between Traditional Security Operations and the Proposed Agentic AI-Based Sentiguard AI System")

    add_paragraph(
        "Traditional security operations rely on manual log review, static rules, and delayed human response. "
        "The proposed Sentiguard AI System automates threat detection, anomaly scoring, MITRE ATT&CK mapping, "
        "and firewall quarantine using intelligent software agents. The table below highlights the major differences "
        "between traditional security management and the proposed Agentic AI-based system:"
    )

    diff_table = doc.add_table(rows=10, cols=2)
    diff_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Style table header
    hdr = diff_table.rows[0].cells
    hdr[0].paragraphs[0].add_run("Traditional Security Operations System").bold = True
    hdr[1].paragraphs[0].add_run("Proposed Agentic AI Based Sentiguard AI System").bold = True

    comparison_data = [
        ("Security monitoring relies on manual log inspection and static firewall rules.",
         "Threat monitoring is performed automatically using intelligent software agents running 24/7."),
        ("High rate of alert fatigue and delayed incident detection.",
         "Real-time heuristic anomaly scoring (0-100) eliminates alert fatigue and detects threats instantly."),
        ("Firewall IP blocking requires manual administrative intervention and rule updates.",
         "Autonomous Quarantine Agent automatically isolates high-risk IPs (score >= 75) in real time."),
        ("Lacks standardized threat classification and attack framework alignment.",
         "Automatically maps all detected incidents to MITRE ATT&CK tactics and techniques."),
        ("Incident triage requires extensive manual research by security analysts.",
         "Integrated AI Triage Assistant provides instant remediation guidance and remediation steps."),
        ("Limited real-time visualization of network perimeter threat velocity.",
         "Interactive glassmorphic dashboard with live telemetry velocity charts and perimeter heatmaps."),
        ("Payload and log file analysis is performed manually using external tools.",
         "Built-in Payload Scanner analyzes log files and static signatures with automatic verdict reports."),
        ("Data export and incident reporting require manual log gathering.",
         "Supports instant JSON incident log export and RESTful API data access."),
        ("Difficult to scale across distributed cloud and multi-tenant environments.",
         "Serverless cloud architecture (FastAPI + Vercel) provides seamless scalability and high availability.")
    ]

    for idx, (trad, prop) in enumerate(comparison_data, start=1):
        r_cells = diff_table.rows[idx].cells
        r_cells[0].paragraphs[0].add_run(trad)
        r_cells[1].paragraphs[0].add_run(prop)

    # Add light border styling to table cells via XML
    for row in diff_table.rows:
        for cell in row.cells:
            tcPr = cell._tc.get_or_add_tcPr()
            tcBorders = parse_xml(
                r'<w:tcBorders %s><w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
                r'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
                r'<w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>'
                r'<w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/></w:tcBorders>'
                % nsdecls('w')
            )
            tcPr.append(tcBorders)

    doc.add_page_break()

    # ==========================================================================
    # PAGE 4: PROPOSED SYSTEM & OVERALL ARCHITECTURE (approx 300 words)
    # ==========================================================================
    add_heading("Proposed System")
    
    p_prop_1 = (
        "The proposed Sentiguard AI (SentinelGPT) system is an intelligent web-based cyber defense application "
        "developed to automate threat detection, security monitoring, and incident mitigation. Designed to overcome "
        "the limitations of traditional security management, the system utilizes intelligent software agents that "
        "continuously evaluate network telemetry against heuristic scoring models and security policies."
    )
    add_paragraph(p_prop_1)

    p_prop_2 = (
        "The application features a modern glassmorphic dashboard built with React 19 and Vite 5.4, connected to a "
        "high-performance FastAPI Python backend controller. When telemetry data arrives, the Telemetry Monitor Agent "
        "analyzes packet rates, IP origins, and request patterns to calculate a risk score (0 to 100). Incidents "
        "exceeding risk thresholds are immediately mapped to MITRE ATT&CK techniques (e.g., T1078 Valid Accounts, "
        "T1498 Network DoS, T1190 Exploit Public App) and formatted with AI-driven remediation guidance."
    )
    add_paragraph(p_prop_2)

    p_prop_3 = (
        "Simultaneously, the Autonomous Quarantine Agent monitors incident severity. If an anomaly score reaches "
        "or exceeds 75 (Critical/High threat), the agent automatically adds the offending IP address to the active "
        "quarantine database table, blocking further unauthorized access. Administrators retain full visibility and "
        "control through interactive dashboard toggles, enabling manual threat simulation, log clearing, and "
        "instant quarantine revocation."
    )
    add_paragraph(p_prop_3)

    p_prop_4 = (
        "By integrating real-time telemetry streaming, autonomous quarantine execution, interactive chart analytics, "
        "a conversational AI triage assistant, and static payload scanning into a unified serverless environment, "
        "Sentiguard AI offers a highly reliable, efficient, and scalable solution for modern enterprise cybersecurity operations."
    )
    add_paragraph(p_prop_4)

    add_heading("System Architecture")
    add_paragraph(
        "Sentiguard AI follows a modular, decoupled architecture where each component performs a specialized task. "
        "The system starts when an operator authenticates through the React frontend interface. Upon login, the "
        "dashboard establishes communication with the FastAPI backend controller to fetch telemetry snapshots "
        "and establish WebSocket streaming."
    )
    add_paragraph(
        "The FastAPI backend processes inbound telemetry using two intelligent agents: the Telemetry Monitor Agent "
        "(responsible for anomaly scoring and MITRE ATT&CK mapping) and the Autonomous Quarantine Agent (responsible "
        "for automated firewall IP isolation and quarantine validation). All incident logs, user credentials, and "
        "quarantined IPs are securely managed by SQLAlchemy ORM connected to SQLite (or cloud database). "
        "The complete architecture flow is shown in the diagram below:"
    )

    # Insert Architecture Diagram Image
    add_image_centered(arch_img, width_inches=6.0)

    # ==========================================================================
    # TECHNOLOGIES USED & ARCHITECTURE FLOW
    # ==========================================================================
    add_heading("Technologies Used")
    add_paragraph(
        "Sentiguard AI is developed using a powerful combination of modern frontend, backend, database, "
        "and Agentic AI technologies. These technologies collaborate to automate threat monitoring, ensure "
        "real-time data streaming, and deliver an intuitive security operations dashboard."
    )

    add_subheading("1. Frontend Technologies")
    add_paragraph(" Modern UI library for building dynamic component trees and managing real-time state updates.", bold_prefix="• React 19: ")
    add_paragraph(" Next-generation frontend build tool providing fast HMR and optimized production bundles.", bold_prefix="• Vite 5.4: ")
    add_paragraph(" Composability library used to render live threat velocity charts, risk gauges, and severity donuts.", bold_prefix="• Recharts: ")
    add_paragraph(" Cyberpunk dark-mode styling with CSS backdrop-blur glassmorphism effects.", bold_prefix="• CSS3 & Tailwind System: ")

    add_subheading("2. Backend Technologies")
    add_paragraph(" Primary language for implementing threat algorithms, agent workflows, and database models.", bold_prefix="• Python 3.11+: ")
    add_paragraph(" Asynchronous, high-performance web framework for handling RESTful APIs and WebSockets.", bold_prefix="• FastAPI: ")
    add_paragraph(" High-speed ASGI server powering local dev execution and serverless request routing.", bold_prefix="• Uvicorn: ")

    add_subheading("3. Database & Deployment Technologies")
    add_paragraph(" Python Object-Relational Mapping library for safe database interactions.", bold_prefix="• SQLAlchemy ORM: ")
    add_paragraph(" Lightweight, zero-config relational database for local testing and Vercel ephemeral storage.", bold_prefix="• SQLite: ")
    add_paragraph(" Cloud serverless deployment hosting the static React build and Python API functions.", bold_prefix="• Vercel: ")

    add_heading("Architecture Flow & Technology Layers")
    add_paragraph(
        "The diagram below summarizes the technology stack layers from the Administrator Web Browser "
        "down to the Database and Output Report Generation layers:"
    )

    # Insert Technology Stack Flow Image
    add_image_centered(workflow_img, width_inches=6.0)

    add_heading("Algorithms Used")
    add_paragraph(" Evaluates incoming request velocity, payload anomaly patterns, and IP reputation to generate a normalized risk score from 0 to 100.", bold_prefix="1. Heuristic Threat Scoring Algorithm: ")
    add_paragraph(" Categorizes risk scores into Critical (>=75), High (60-74), Medium (40-59), and Low (<40) priority tiers.", bold_prefix="2. Severity Matrix Classifier: ")
    add_paragraph(" Monitors burst traffic spikes per IP address over sliding time windows to detect active DDoS or port scan sweeps.", bold_prefix="3. Velocity Rate Anomaly Detector: ")

    # ==========================================================================
    # AGENTS USED & WORKFLOW
    # ==========================================================================
    add_heading("Agents Used")
    add_paragraph(
        "Sentiguard AI utilizes intelligent software agents to automate the security monitoring workflow. "
        "Each agent operates independently to evaluate telemetry, classify risks, and execute response actions."
    )

    add_subheading("1. Telemetry Monitor & Threat Detection Agent")
    add_paragraph(
        "The Telemetry Monitor Agent continuously inspects incoming network log events, extracts IP details, "
        "calculates risk scores using heuristic algorithms, and dynamically assigns MITRE ATT&CK tactic/technique metadata."
    )
    add_paragraph("Reads network telemetry logs; Calculates priority scores; Maps threats to MITRE ATT&CK techniques; Generates structured incident payloads.", bold_prefix="• Responsibilities: ")

    add_subheading("2. Autonomous Quarantine & Validation Agent")
    add_paragraph(
        "The Autonomous Quarantine Agent evaluates detected incidents against safety policies. If an incident "
        "risk score exceeds 75, the agent automatically isolates the IP address into the quarantine database, "
        "while providing security operators with manual revoke controls and AI remediation advice."
    )
    add_paragraph("Validates threat severity; Enforces automated IP quarantine; Prevents false-positive lockouts; Generates AI remediation advice.", bold_prefix="• Responsibilities: ")

    # ==========================================================================
    # IMPLEMENTATION PHASES
    # ==========================================================================
    add_heading("Implementation")
    add_paragraph(
        "The development of the Sentiguard AI system was executed in structured development phases to ensure "
        "robustness, security, and high performance:"
    )

    add_paragraph(" Identified traditional SOC pain points, defined threat scoring metrics, and mapped MITRE ATT&CK techniques.", bold_prefix="Phase 1: Requirement Analysis & Threat Modeling — ")
    add_paragraph(" Architected the decoupled React SPA and FastAPI backend serverless structure.", bold_prefix="Phase 2: System Design & Architecture — ")
    add_paragraph(" Designed SQLAlchemy ORM models for Users, SOC Incidents, Perimeter Logs, and Blocked IPs.", bold_prefix="Phase 3: Database & Schema Design — ")
    add_paragraph(" Built glassmorphic React components including ThreatChart, RiskGaugeChart, BlockedIPs, and Login.", bold_prefix="Phase 4: Frontend Component Development — ")
    add_paragraph(" Created FastAPI REST routes (`/api/snapshot`, `/api/block_ip`, `/api/sim_threat`) and JWT auth logic.", bold_prefix="Phase 5: Backend API & Heuristics Implementation — ")
    add_paragraph(" Programmed the Telemetry Monitor Agent and Autonomous Quarantine Agent logic.", bold_prefix="Phase 6: Agentic AI Development — ")
    add_paragraph(" Tested telemetry ingestion, automatic firewall IP quarantine, and manual override controls.", bold_prefix="Phase 7: Real-Time Telemetry & Alert Testing — ")
    add_paragraph(" Deployed the full-stack application to Vercel Serverless with production OpenAPI documentation.", bold_prefix="Phase 8: Cloud Deployment — ")

    # ==========================================================================
    # APPLICATIONS & UI SCREENSHOTS
    # ==========================================================================
    add_heading("Applications")
    add_paragraph("Sentiguard AI is versatile and can be deployed across various domain environments:")
    add_paragraph(" Continuous network perimeter monitoring and real-time threat triage.", bold_prefix="1. Enterprise SOC Operations: ")
    add_paragraph(" Protecting online banking portals against credential stuffing and brute-force attacks.", bold_prefix="2. Financial Institutions: ")
    add_paragraph(" Safeguarding serverless APIs and microservices from unauthorized probes.", bold_prefix="3. Cloud Service Providers: ")
    add_paragraph(" Securing patient data endpoints against ransomware and malware payload injection.", bold_prefix="4. Healthcare Networks: ")
    add_paragraph(" Preventing DDoS disruption and unauthorized SQL injection during high-traffic sales.", bold_prefix="5. E-Commerce Platforms: ")
    add_paragraph(" Monitoring university campus networks and preventing faculty/student account hijacking.", bold_prefix="6. Academic Institutions: ")

    add_heading("User Interface Screenshots")
    add_paragraph("The figures below depict the live operational screens of the Sentiguard AI system:")

    add_image_centered(os.path.join(IMG_DIR, "dashboard.png"), width_inches=5.8)
    add_paragraph("Figure 1: Sentiguard AI Real-Time SOC Dashboard & Telemetry Feed", bold_prefix="")

    add_image_centered(os.path.join(IMG_DIR, "login_page.png"), width_inches=5.5)
    add_paragraph("Figure 2: Cyberpunk Operator Authentication Portal with Quick Demo Access", bold_prefix="")

    add_image_centered(os.path.join(IMG_DIR, "ai_chat.png"), width_inches=5.5)
    add_paragraph("Figure 3: Conversational AI Threat Triage Assistant Interface", bold_prefix="")

    add_image_centered(os.path.join(IMG_DIR, "file_scanner.png"), width_inches=5.5)
    add_paragraph("Figure 4: Heuristic Payload File & Log Scanner Interface", bold_prefix="")

    # ==========================================================================
    # CONCLUSION & REFERENCES
    # ==========================================================================
    add_heading("Conclusion")
    add_paragraph(
        "The Sentiguard AI (SentinelGPT) Autonomous Cyber Defense and SOC Monitoring System provides an "
        "efficient, intelligent, and scalable solution for modern cybersecurity operations. By replacing "
        "manual log review with autonomous software agents, the system eliminates alert fatigue, reduces incident "
        "response latency to zero, and ensures continuous network perimeter protection. Built using React 19, Vite 5.4, "
        "FastAPI, Python 3.11, SQLAlchemy, and SQLite on Vercel Serverless, the platform combines cutting-edge AI triage "
        "with robust software engineering, demonstrating an effective, modern paradigm for automated cyber defense."
    )

    add_heading("References")
    add_paragraph("1. FastAPI Documentation. FastAPI Framework. Available at: https://fastapi.tiangolo.com/")
    add_paragraph("2. React Documentation. React 19 User Interface Library. Available at: https://react.dev/")
    add_paragraph("3. MITRE ATT&CK Framework. Enterprise Tactics & Techniques. Available at: https://attack.mitre.org/")
    add_paragraph("4. SQLAlchemy Documentation. Object Relational Mapper for Python. Available at: https://docs.sqlalchemy.org/")
    add_paragraph("5. Python Software Foundation. Python 3 Documentation. Available at: https://docs.python.org/3/")
    add_paragraph("6. Vercel Serverless Documentation. Deploying Web Applications. Available at: https://vercel.com/docs")
    add_paragraph("7. Russell, S., & Norvig, P. (2021). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.")

    # ==========================================================================
    # LIVE WEBSITE & GITHUB LINKS AT LAST
    # ==========================================================================
    add_heading("Live Website & GitHub Links")
    add_paragraph(
        "The Sentiguard AI project is fully cloud-deployed and accessible online. "
        "Evaluators and administrators can access the live working dashboard, API documentation, "
        "and complete source code using the links below:"
    )

    add_paragraph("https://sentinelgpt-ai.vercel.app", bold_prefix="• Single Live Dashboard Deployment Link: ")
    add_paragraph("https://sentinelgpt-ai.vercel.app/docs", bold_prefix="• Live Interactive Swagger API Docs: ")
    add_paragraph("https://github.com/Pravallika2025/sentigraud-ai-.git", bold_prefix="• Official Project GitHub Repository: ")

    # Save Word Doc to target paths
    for save_path in save_paths:
        doc.save(save_path)
        print(f"Sentiguard Word Document successfully saved to: {save_path}")

if __name__ == "__main__":
    target_doc_paths = [
        os.path.join(BASE_DIR, "docs", "Sentiguard_AI_Project_Report.docx"),
        os.path.join(DESKTOP_DIR, "Sentiguard_AI_Project_Report.docx")
    ]
    build_sentiguard_word_document(target_doc_paths)
