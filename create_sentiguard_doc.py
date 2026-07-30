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

    try:
        font_box = ImageFont.truetype("arial.ttf", 14)
        font_sub = ImageFont.truetype("arial.ttf", 11)
    except Exception:
        font_box = font_sub = ImageFont.load_default()

    def draw_box(x1, y1, x2, y2, bg_color, border_color, text, subtext=""):
        draw.rectangle([x1, y1, x2, y2], fill=bg_color, outline=border_color, width=2)
        tx = (x1 + x2) // 2
        ty = y1 + 10 if subtext else (y1 + y2) // 2 - 8
        draw.text((tx, ty), text, fill="#000000", font=font_box, anchor="mm")
        if subtext:
            draw.text((tx, ty + 18), subtext, fill="#444444", font=font_sub, anchor="mm")

    def draw_arrow(x1, y1, x2, y2):
        draw.line([x1, y1, x2, y2], fill="#003366", width=3)
        draw.polygon([(x2, y2), (x2-6, y2-10), (x2+6, y2-10)], fill="#003366")

    draw_box(250, 20, 650, 65, "#f0f4f8", "#003366", "SECURITY OPERATOR / ADMINISTRATOR", "(Authentication & Dashboard Control)")
    draw_arrow(450, 65, 450, 95)

    draw_box(150, 95, 750, 160, "#e6f2ff", "#005580", "FRONTEND INTERFACE (React 19 + Vite 5.4 SPA)", "Login | Dashboard | Real-Time Telemetry Feed | Quarantine Control | AI Chat")
    draw_arrow(450, 160, 450, 190)

    draw_box(150, 190, 750, 255, "#e6ffe6", "#008040", "FASTAPI BACKEND CONTROLLER (main.py / index.py)", "REST API Router | Session Auth | CORS Middleware | WebSocket Engine")
    draw_arrow(450, 255, 450, 285)

    draw.line([300, 285, 600, 285], fill="#003366", width=3)
    draw_arrow(300, 285, 300, 315)
    draw_arrow(600, 285, 600, 315)

    draw_box(120, 315, 480, 420, "#fff2e6", "#d97706", "TELEMETRY MONITOR & THREAT AGENT", "Anomaly Scoring & Heuristic Detection")
    draw_box(520, 315, 880, 420, "#f3e8ff", "#7e22ce", "AUTONOMOUS QUARANTINE & TRIAGE AGENT", "High-Risk IP Quarantine & Triage Engine")

    draw.line([300, 420, 300, 445], fill="#003366", width=2)
    draw.line([700, 420, 700, 445], fill="#003366", width=2)
    draw.line([300, 445, 700, 445], fill="#003366", width=2)
    draw_arrow(500, 445, 500, 475)

    draw_box(180, 475, 820, 545, "#f0fdf4", "#15803d", "SQLALCHEMY ORM DATABASE LAYER", "Admin Table (Users) | SOC Incident Table | Blocked IP Quarantine Table | Logs")
    draw_arrow(500, 545, 500, 575)

    draw_box(150, 575, 850, 655, "#f1f5f9", "#334155", "OUTPUT & CLOUD DEPLOYMENT LAYER", "SQLite Local DB / Vercel Serverless Production Deployment\nLive SOC Dashboard Output | JSON Incident Export | Swagger API Docs")

    arch_img_path = os.path.join(IMG_DIR, "architecture_diagram.png")
    img.save(arch_img_path)
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

    draw_box(200, 20, 650, 75, "#e6f2ff", "#005580", "NETWORK TRAFFIC & SECURITY TELEMETRY FEED", "(Inbound Logs, IP Probes, HTTP Requests)")
    draw_arrow(425, 75, 425, 105)

    draw_box(150, 105, 700, 175, "#f0f4f8", "#003366", "FRONTEND DASHBOARD & ALERTS FEED", "Captures Network Packets, Displays Live Metrics & Operator Controls")
    draw_arrow(425, 175, 425, 205)

    draw_box(120, 205, 730, 290, "#fff2e6", "#d97706", "TELEMETRY MONITOR & THREAT DETECTION AGENT", "- Analyzes IP Velocity and Payload Signatures\n- Calculates Risk Score (0 - 100) & Assigns MITRE ATT&CK Tactic")
    draw_arrow(425, 290, 425, 320)

    draw_box(120, 320, 730, 405, "#f3e8ff", "#7e22ce", "AUTONOMOUS QUARANTINE & VALIDATION AGENT", "- Evaluates Risk Score Threshold (Score >= 75 -> Auto Quarantine)\n- Prevents False Positives & Checks Revoke Credentials")
    draw_arrow(425, 405, 425, 435)

    draw_box(220, 435, 630, 505, "#f0fdf4", "#15803d", "DATABASE STORAGE LAYER", "Stores SOC Incidents, Blocked IPs, & User Accounts")
    draw_arrow(425, 505, 425, 535)

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

    draw_arrow(425, 625, 425, 650)
    draw_box(180, 650, 670, 705, "#f1f5f9", "#003366", "OUTPUT: SENTIGUARD AI LIVE DASHBOARD DEPLOYMENT")

    workflow_img_path = os.path.join(IMG_DIR, "agent_workflow_diagram.png")
    img.save(workflow_img_path)
    return workflow_img_path

# ------------------------------------------------------------------------------
# 2. CREATE WORD DOCUMENT
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

    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = RGBColor(0, 0, 0)

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(120)
        p.paragraph_format.space_after = Pt(20)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(24)
        run.font.bold = True
        return p

    def add_student_info(name, reg_no, year):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p.paragraph_format.space_before = Pt(140)
        p.paragraph_format.line_spacing = 1.5
        
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
        return p

    def add_subheading(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        return p

    def add_paragraph(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Times New Roman'
            r_bold.font.bold = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        return p

    def add_image_centered(img_path, width_inches=6.0):
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(12)
            p.add_run().add_picture(img_path, width=Inches(width_inches))

    # ==========================================================================
    # PAGE 1: TITLE PAGE
    # ==========================================================================
    add_title("SentinelGPT: An AI-Powered Large Language Model Framework for Advanced Cyber Threat Detection and Analysis")
    add_student_info("Pravallika Kalangi", "24VV1F0044", "MCA 2nd year")
    doc.add_page_break()

    # ==========================================================================
    # PAGE 2: PROBLEM STATEMENT
    # ==========================================================================
    add_heading("Problem statement")
    add_paragraph(
        "Modern cybersecurity operations face severe challenges in managing the overwhelming volume of "
        "network telemetry and security alerts generated by enterprise IT infrastructure. Every day, security "
        "information and event management (SIEM) systems process millions of event logs, network probes, and "
        "API requests across complex cloud environments. In many organizations, security operations centers (SOC) "
        "still rely heavily on manual log inspection, static firewall rules, and fragmented monitoring tools. "
        "This traditional approach creates significant operational bottlenecks, leads to severe analyst alert fatigue, "
        "and drastically increases incident response time, allowing malicious cyber threats to propagate unchecked."
    )
    add_paragraph(
        "One of the major challenges in contemporary cyber defense is identifying sophisticated multi-stage attacks "
        "such as credential stuffing, distributed denial of service (DDoS) vectors, SQL injection payloads, and "
        "brute-force authentication spikes. Traditional rule-based intrusion detection systems often generate high "
        "rates of false positives while failing to correlate anomalous network behavior with recognized attack "
        "frameworks like MITRE ATT&CK. Furthermore, when a critical threat is detected, manual quarantine "
        "procedures require administrators to manually update firewall rules and isolate compromised IP addresses, "
        "a delayed process that exposes internal networks to lateral movement and unauthorized data exfiltration."
    )
    add_paragraph(
        "Existing security dashboards also lack transparent decision-making explanations, intelligent payload "
        "analysis, and real-time visualization capabilities. Security operators are frequently left without instant "
        "remediation guidance, making it difficult to understand why a specific threat score was assigned or what "
        "immediate countermeasures should be executed."
    )
    add_paragraph(
        "To address these critical challenges, this project proposes SentinelGPT: An AI-Powered Large Language "
        "Model Framework for Advanced Cyber Threat Detection and Analysis. The system utilizes intelligent software "
        "agents to automatically monitor network telemetry, calculate risk scores using heuristic anomaly algorithms, "
        "dynamically map threats to MITRE ATT&CK techniques, and autonomously quarantine high-risk IP addresses. "
        "Featuring a responsive dashboard, real-time streaming, interactive analytics, an AI triage assistant, and "
        "static payload scanning, SentinelGPT minimizes manual effort, eliminates response latency, and provides a "
        "scalable, reliable solution for modern enterprise cyber defense."
    )
    doc.add_page_break()

    # ==========================================================================
    # PAGE 3: DIFFERENCE TABLE
    # ==========================================================================
    add_heading("Difference Between Traditional Security Operations and the Proposed System")
    add_paragraph(
        "Traditional security operations rely on manual log review, static rules, and delayed human response. "
        "The proposed SentinelGPT System automates threat detection, anomaly scoring, MITRE ATT&CK mapping, "
        "and firewall quarantine using intelligent software agents. The table below highlights the major differences "
        "between traditional security management and the proposed AI-based system:"
    )

    diff_table = doc.add_table(rows=10, cols=2)
    diff_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    hdr = diff_table.rows[0].cells
    hdr[0].paragraphs[0].add_run("Traditional Security Operations System").bold = True
    hdr[1].paragraphs[0].add_run("Proposed SentinelGPT System").bold = True

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
        r_cells[0].paragraphs[0].text = trad
        r_cells[1].paragraphs[0].text = prop

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
    # PAGE 4: PROPOSED SYSTEM
    # ==========================================================================
    add_heading("Proposed System")
    add_paragraph(
        "The proposed SentinelGPT system is an intelligent web-based cyber defense application "
        "developed to automate threat detection, security monitoring, and incident mitigation. Designed to overcome "
        "the limitations of traditional security management, the system utilizes intelligent software agents that "
        "continuously evaluate network telemetry against heuristic scoring models and security policies."
    )
    add_paragraph(
        "The application features a modern dashboard built with React 19 and Vite 5.4, connected to a "
        "high-performance FastAPI Python backend controller. When telemetry data arrives, the Telemetry Monitor Agent "
        "analyzes packet rates, IP origins, and request patterns to calculate a risk score (0 to 100). Incidents "
        "exceeding risk thresholds are immediately mapped to MITRE ATT&CK techniques (e.g., T1078 Valid Accounts, "
        "T1498 Network DoS, T1190 Exploit Public App) and formatted with AI-driven remediation guidance."
    )
    add_paragraph(
        "Simultaneously, the Autonomous Quarantine Agent monitors incident severity. If an anomaly score reaches "
        "or exceeds 75 (Critical/High threat), the agent automatically adds the offending IP address to the active "
        "quarantine database table, blocking further unauthorized access. Administrators retain full visibility and "
        "control through interactive dashboard toggles, enabling manual threat simulation, log clearing, and "
        "instant quarantine revocation."
    )
    add_paragraph(
        "By integrating real-time telemetry streaming, autonomous quarantine execution, interactive chart analytics, "
        "a conversational AI triage assistant, and static payload scanning into a unified serverless environment, "
        "SentinelGPT offers a highly reliable, efficient, and scalable solution for modern enterprise cybersecurity operations."
    )
    doc.add_page_break()

    # ==========================================================================
    # PAGE 5: SYSTEM ARCHITECTURE
    # ==========================================================================
    add_heading("System Architecture")
    add_paragraph(
        "SentinelGPT follows a modular, decoupled architecture where each component performs a specialized task. "
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

    add_image_centered(arch_img, width_inches=6.0)
    doc.add_page_break()

    # ==========================================================================
    # PAGE 6: TECHNOLOGIES USED (FRONTEND & BACKEND)
    # ==========================================================================
    add_heading("Technologies Used")
    add_paragraph(
        "SentinelGPT is developed using a powerful combination of modern frontend, backend, database, "
        "and AI technologies. These technologies collaborate to automate threat monitoring, ensure "
        "real-time data streaming, and deliver an intuitive security operations dashboard."
    )

    add_subheading("1. Frontend Technologies")
    add_paragraph(" Modern UI library for building dynamic component trees and managing real-time state updates. It allows for efficient rendering of complex dashboards.", bold_prefix="• React 19: ")
    add_paragraph(" Next-generation frontend build tool providing fast Hot Module Replacement (HMR) and optimized production bundles.", bold_prefix="• Vite 5.4: ")
    add_paragraph(" A composability library used to render live threat velocity charts, risk gauges, and severity donuts.", bold_prefix="• Recharts: ")
    add_paragraph(" Provides the foundation for the visual structure and responsive layouts.", bold_prefix="• HTML5 & CSS3: ")
    add_paragraph(" The core scripting language handling client-side logic, API calls, and state management.", bold_prefix="• JavaScript: ")

    add_subheading("2. Backend Technologies")
    add_paragraph(" Primary language for implementing threat algorithms, agent workflows, and database models.", bold_prefix="• Python 3.11+: ")
    add_paragraph(" Asynchronous, high-performance web framework for handling RESTful APIs, WebSockets, and generating OpenAPI documentation automatically.", bold_prefix="• FastAPI: ")
    add_paragraph(" High-speed ASGI server powering local development execution and serverless request routing.", bold_prefix="• Uvicorn: ")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 7: TECHNOLOGIES USED (DATABASE, DEPLOYMENT, ALGORITHMS)
    # ==========================================================================
    add_subheading("3. Database & Storage Technologies")
    add_paragraph(" Python Object-Relational Mapping (ORM) library that allows secure and efficient database interactions without writing raw SQL queries.", bold_prefix="• SQLAlchemy ORM: ")
    add_paragraph(" Lightweight, zero-configuration relational database used for local testing and Vercel ephemeral storage.", bold_prefix="• SQLite: ")

    add_subheading("4. Deployment Technologies")
    add_paragraph(" Cloud serverless deployment platform hosting the static React build and executing Python API functions on the edge.", bold_prefix="• Vercel: ")
    add_paragraph(" Used for version control and automated deployment pipelines.", bold_prefix="• Git & GitHub: ")

    add_heading("Algorithms Used")
    add_paragraph(" Evaluates incoming request velocity, payload anomaly patterns, and IP reputation to generate a normalized risk score ranging from 0 to 100. This heuristic approach identifies unknown threats without relying solely on static signatures.", bold_prefix="1. Heuristic Threat Scoring Algorithm: ")
    add_paragraph(" Categorizes risk scores into distinct priority tiers: Critical (>=75), High (60-74), Medium (40-59), and Low (<40). This matrix drives the automated response logic.", bold_prefix="2. Severity Matrix Classifier: ")
    add_paragraph(" Monitors burst traffic spikes per IP address over sliding time windows to detect active Distributed Denial of Service (DDoS) attempts or port scan sweeps.", bold_prefix="3. Velocity Rate Anomaly Detector: ")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 8: ARCHITECTURE FLOW & TECHNOLOGY LAYERS
    # ==========================================================================
    add_heading("Architecture Flow & Technology Layers")
    add_paragraph(
        "The diagram below summarizes the technology stack layers and workflow, starting from the network traffic "
        "telemetry feed down to the Database and Output Report Generation layers:"
    )

    add_image_centered(workflow_img, width_inches=6.5)
    doc.add_page_break()

    # ==========================================================================
    # PAGE 9: AGENTS USED
    # ==========================================================================
    add_heading("Agents Used")
    add_paragraph(
        "SentinelGPT utilizes intelligent software agents to automate the security monitoring workflow. "
        "Each agent operates independently to evaluate telemetry, classify risks, and execute response actions, "
        "significantly reducing the manual workload on human analysts."
    )

    add_subheading("1. Telemetry Monitor & Threat Detection Agent")
    add_paragraph(
        "The Telemetry Monitor Agent continuously inspects incoming network log events, extracts IP details, "
        "calculates risk scores using heuristic algorithms, and dynamically assigns MITRE ATT&CK tactic and "
        "technique metadata based on the observed behavior."
    )
    add_paragraph("Reads network telemetry logs; Calculates priority risk scores; Maps threats to specific MITRE ATT&CK techniques; Generates structured incident payloads for the dashboard.", bold_prefix="• Responsibilities: ")

    add_subheading("2. Autonomous Quarantine & Validation Agent")
    add_paragraph(
        "The Autonomous Quarantine Agent evaluates detected incidents against defined safety policies. If an incident "
        "risk score reaches or exceeds the threshold of 75, the agent automatically isolates the offending IP address "
        "into the quarantine database, effectively blocking it. It also provides security operators with manual revoke "
        "controls and AI-driven remediation advice."
    )
    add_paragraph("Validates threat severity; Enforces automated IP quarantine rules; Prevents false-positive lockouts through validation checks; Generates contextual AI remediation advice.", bold_prefix="• Responsibilities: ")
    doc.add_page_break()

    # ==========================================================================
    # PAGE 10: IMPLEMENTATION (PHASES 1-4)
    # ==========================================================================
    add_heading("Implementation")
    add_paragraph(
        "The development of the SentinelGPT system was executed in structured phases to ensure "
        "robustness, security, scalability, and high performance:"
    )

    add_subheading("Phase 1: Requirement Analysis & Threat Modeling")
    add_paragraph(
        "The initial phase involved identifying the pain points in traditional Security Operations Centers (SOC). "
        "Requirements for real-time monitoring, automated quarantine, and intelligent triage were gathered. "
        "Threat scoring metrics were defined, and a mapping strategy for MITRE ATT&CK techniques was established."
    )

    add_subheading("Phase 2: System Design & Architecture")
    add_paragraph(
        "In this phase, the overall system architecture was designed. The decoupled approach utilizing a React "
        "Single Page Application (SPA) for the frontend and a FastAPI serverless backend was planned. API routing "
        "and agent workflows were also finalized."
    )

    add_subheading("Phase 3: Database & Schema Design")
    add_paragraph(
        "The database was designed using SQLAlchemy ORM to ensure secure and efficient data handling. "
        "Tables were created for Users (authentication), SOC Incidents (threat logs), Perimeter Logs (traffic), "
        "and Blocked IPs (quarantine list)."
    )

    add_subheading("Phase 4: Frontend Component Development")
    add_paragraph(
        "The user interface was constructed using React and Tailwind CSS principles. Glassmorphic components "
        "were developed to provide a modern aesthetic. Key components like the ThreatChart, RiskGaugeChart, "
        "BlockedIPs manager, and Login portal were implemented."
    )
    doc.add_page_break()

    # ==========================================================================
    # PAGE 11: IMPLEMENTATION (PHASES 5-8)
    # ==========================================================================
    add_subheading("Phase 5: Backend API & Heuristics Implementation")
    add_paragraph(
        "The backend logic was implemented using Python and FastAPI. RESTful routes such as `/api/snapshot`, "
        "`/api/block_ip`, and `/api/sim_threat` were developed. Secure authentication using JSON Web Tokens (JWT) "
        "was integrated to protect endpoints."
    )

    add_subheading("Phase 6: Agentic AI Development")
    add_paragraph(
        "The intelligent software agents were programmed. The Telemetry Monitor Agent was built to calculate "
        "risk scores and assign MITRE ATT&CK tags. The Autonomous Quarantine Agent was developed to enforce "
        "firewall rules based on the severity thresholds."
    )

    add_subheading("Phase 7: Real-Time Telemetry & Alert Testing")
    add_paragraph(
        "The integrated system underwent rigorous testing. Simulated threat data was injected to verify the "
        "telemetry ingestion rate, the accuracy of the heuristic scoring, and the reliability of the automatic "
        "firewall IP quarantine and manual override controls."
    )

    add_subheading("Phase 8: Cloud Deployment")
    add_paragraph(
        "The final phase involved preparing the application for production. The full-stack application was deployed "
        "to the Vercel Serverless platform. Environment variables were configured, and production OpenAPI documentation "
        "was generated and verified."
    )
    doc.add_page_break()

    # ==========================================================================
    # PAGE 12: APPLICATIONS
    # ==========================================================================
    add_heading("Applications")
    add_paragraph(
        "SentinelGPT is highly versatile, scalable, and can be deployed across various domain environments "
        "to enhance cybersecurity posture:"
    )

    add_paragraph(" Provides continuous network perimeter monitoring, real-time threat triage, and automated response capabilities for dedicated security teams.", bold_prefix="1. Enterprise SOC Operations: ")
    add_paragraph(" Protects online banking portals and transaction gateways against credential stuffing, brute-force attacks, and fraud attempts.", bold_prefix="2. Financial Institutions: ")
    add_paragraph(" Safeguards serverless APIs, microservices, and cloud infrastructure from unauthorized probes and exploitation attempts.", bold_prefix="3. Cloud Service Providers: ")
    add_paragraph(" Secures critical patient data endpoints and hospital networks against ransomware and malware payload injection.", bold_prefix="4. Healthcare Networks: ")
    add_paragraph(" Prevents Distributed Denial of Service (DDoS) disruption and unauthorized SQL injection attacks during high-traffic sales events.", bold_prefix="5. E-Commerce Platforms: ")
    add_paragraph(" Monitors vast university campus networks, preventing faculty and student account hijacking and unauthorized access to academic records.", bold_prefix="6. Academic Institutions: ")
    doc.add_page_break()

    # ==========================================================================
    # PAGE 13: UI SCREENSHOTS (1 & 2)
    # ==========================================================================
    add_heading("User Interface Screenshots")

    add_image_centered(os.path.join(IMG_DIR, "dashboard.png"), width_inches=6.0)
    add_paragraph("Figure 1: SentinelGPT Real-Time SOC Dashboard & Telemetry Feed", bold_prefix="")

    add_image_centered(os.path.join(IMG_DIR, "login_page.png"), width_inches=5.8)
    add_paragraph("Figure 2: Operator Authentication Portal with Quick Demo Access", bold_prefix="")
    doc.add_page_break()

    # ==========================================================================
    # PAGE 14: UI SCREENSHOTS (3 & 4)
    # ==========================================================================
    add_image_centered(os.path.join(IMG_DIR, "ai_chat.png"), width_inches=5.8)
    add_paragraph("Figure 3: Conversational AI Threat Triage Assistant Interface", bold_prefix="")

    add_image_centered(os.path.join(IMG_DIR, "file_scanner.png"), width_inches=5.8)
    add_paragraph("Figure 4: Heuristic Payload File & Log Scanner Interface", bold_prefix="")
    doc.add_page_break()

    # ==========================================================================
    # PAGE 15: CONCLUSION, REFERENCES, LINKS
    # ==========================================================================
    add_heading("Conclusion")
    add_paragraph(
        "The SentinelGPT AI-Powered Cyber Defense Framework provides an efficient, intelligent, and scalable "
        "solution for modern cybersecurity operations. By replacing manual log review with autonomous software agents, "
        "the system drastically reduces alert fatigue, minimizes incident response latency, and ensures continuous "
        "network perimeter protection. Built using robust technologies including React 19, FastAPI, and SQLAlchemy, "
        "the platform demonstrates an effective and modern paradigm for automated cyber defense."
    )

    add_heading("References")
    add_paragraph("1. FastAPI Documentation. FastAPI Framework. Available at: https://fastapi.tiangolo.com/")
    add_paragraph("2. React Documentation. React 19 User Interface Library. Available at: https://react.dev/")
    add_paragraph("3. MITRE ATT&CK Framework. Enterprise Tactics & Techniques. Available at: https://attack.mitre.org/")
    add_paragraph("4. SQLAlchemy Documentation. Object Relational Mapper for Python. Available at: https://docs.sqlalchemy.org/")
    add_paragraph("5. Vercel Serverless Documentation. Deploying Web Applications. Available at: https://vercel.com/docs")
    add_paragraph("6. Russell, S., & Norvig, P. (2021). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.")

    add_heading("Live Website & GitHub Links")
    add_paragraph(
        "The SentinelGPT project is fully cloud-deployed and accessible online. Evaluators can access the live "
        "working dashboard, API documentation, and complete source code using the links below:"
    )
    add_paragraph("https://sentinelgpt-ai.vercel.app", bold_prefix="• Single Live Dashboard Deployment Link: ")
    add_paragraph("https://github.com/Pravallika2025/sentigraud-ai-.git", bold_prefix="• Official Project GitHub Repository: ")

    for save_path in save_paths:
        doc.save(save_path)

if __name__ == "__main__":
    target_doc_paths = [
        os.path.join(BASE_DIR, "docs", "SentinelGPT_Project_Report.docx"),
        os.path.join(DESKTOP_DIR, "SentinelGPT_Project_Report.docx")
    ]
    build_sentiguard_word_document(target_doc_paths)
