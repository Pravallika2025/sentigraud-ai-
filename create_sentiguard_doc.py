import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

from PIL import Image, ImageDraw, ImageFont

BASE_DIR = r"c:\Users\User\pravallika sentinel"
IMG_DIR = os.path.join(BASE_DIR, "docs", "images")
DESKTOP_DIR = r"C:\Users\User\OneDrive\Desktop" if os.path.exists(r"C:\Users\User\OneDrive\Desktop") else r"C:\Users\User\Desktop"
os.makedirs(IMG_DIR, exist_ok=True)

# ------------------------------------------------------------------------------
# 1. GENERATE CLEAN DIAGRAM IMAGES WITH PERFECT CENTERING
# ------------------------------------------------------------------------------
def generate_sample_style_arch_diagram():
    width, height = 720, 500
    img = Image.new('RGB', (width, height), color='#ffffff')
    draw = ImageDraw.Draw(img)

    try:
        font_bold = ImageFont.truetype("timesbd.ttf", 13)
        font_sub = ImageFont.truetype("times.ttf", 11)
    except Exception:
        font_bold = font_sub = ImageFont.load_default()

    def draw_box(x1, y1, x2, y2, text, subtext=""):
        draw.rectangle([x1, y1, x2, y2], fill="#ffffff", outline="#000000", width=1)
        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2 - 8 if subtext else (y1 + y2) // 2
        draw.text((cx, cy), text, fill="#000000", font=font_bold, anchor="mm")
        if subtext:
            draw.text((cx, cy + 16), subtext, fill="#333333", font=font_sub, anchor="mm")

    def draw_arrow(x1, y1, x2, y2):
        draw.line([x1, y1, x2, y2], fill="#000000", width=1)
        draw.polygon([(x2, y2), (x2-5, y2-8), (x2+5, y2-8)], fill="#000000")

    draw_box(230, 15, 490, 55, "ADMINISTRATOR", "(Login & Telemetry Setup)")
    draw_arrow(360, 55, 360, 80)

    draw_box(100, 80, 620, 125, "FRONTEND INTERFACE (HTML5 / CSS3 / React 19 / JS)", "Login | Dashboard | Real-Time Feed | AI Chat | File Scanner")
    draw_arrow(360, 125, 360, 150)

    draw_box(120, 150, 600, 195, "FASTAPI APPLICATION (main.py / index.py)", "Authentication | Routing | Session | Request Handling")
    draw_arrow(360, 195, 360, 220)

    draw.line([210, 220, 510, 220], fill="#000000", width=1)
    draw_arrow(210, 220, 210, 245)
    draw_arrow(510, 220, 510, 245)

    draw_box(60, 245, 360, 320, "TELEMETRY MONITOR AGENT", "• Risk Scoring (0-100)\n• MITRE ATT&CK Mapping\n• Velocity Anomaly Analysis")
    draw_box(380, 245, 680, 320, "AUTONOMOUS QUARANTINE AGENT", "• High-Risk IP Quarantine (>= 75)\n• AI Remediation Advice\n• Manual Revoke Validation")

    draw.line([210, 320, 210, 340], fill="#000000", width=1)
    draw.line([510, 320, 510, 340], fill="#000000", width=1)
    draw.line([210, 340, 510, 340], fill="#000000", width=1)
    draw_arrow(360, 340, 360, 365)

    draw_box(130, 365, 590, 420, "SQLALCHEMY DATABASE LAYER", "Admin Table | SOC Incident Table | Blocked IP Table | Perimeter Logs")
    draw_arrow(360, 420, 360, 445)

    draw_box(90, 445, 630, 490, "DASHBOARD | REAL-TIME TELEMETRY | QUARANTINE | JSON EXPORT", "SQLite (Local) / Vercel Serverless (Production)")

    path = os.path.join(IMG_DIR, "sample_arch_diagram.png")
    img.save(path)
    return path

def generate_sample_style_flow_diagram():
    width, height = 720, 480
    img = Image.new('RGB', (width, height), color='#ffffff')
    draw = ImageDraw.Draw(img)

    try:
        font_bold = ImageFont.truetype("timesbd.ttf", 13)
        font_sub = ImageFont.truetype("times.ttf", 11)
    except Exception:
        font_bold = font_sub = ImageFont.load_default()

    def draw_box(x1, y1, x2, y2, text, subtext=""):
        draw.rectangle([x1, y1, x2, y2], fill="#ffffff", outline="#000000", width=1)
        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2 - 6 if subtext else (y1 + y2) // 2
        draw.text((cx, cy), text, fill="#000000", font=font_bold, anchor="mm")
        if subtext:
            draw.text((cx, cy + 15), subtext, fill="#333333", font=font_sub, anchor="mm")

    def draw_arrow(x1, y1, x2, y2):
        draw.line([x1, y1, x2, y2], fill="#000000", width=1)
        draw.polygon([(x2, y2), (x2-5, y2-8), (x2+5, y2-8)], fill="#000000")

    draw_box(190, 10, 530, 48, "ADMINISTRATOR", "Login and Telemetry Setup")
    draw_arrow(360, 48, 360, 70)

    draw_box(170, 70, 550, 108, "WEB BROWSER", "React 19 Glassmorphism Single Page Application")
    draw_arrow(360, 108, 360, 130)

    draw_box(130, 130, 590, 175, "FRONTEND TECHNOLOGIES", "HTML5 | CSS3 | JavaScript | Vite 5.4 SPA")
    draw_arrow(360, 175, 360, 198)

    draw_box(130, 198, 590, 248, "BACKEND TECHNOLOGIES", "Python | FastAPI | Uvicorn | Agentic AI Engine\n(Telemetry Monitor Agent & Autonomous Quarantine Agent)")
    draw_arrow(360, 248, 360, 270)

    draw_box(130, 270, 590, 328, "DATABASE TECHNOLOGIES", "SQLAlchemy ORM\nSQLite (Local) | PostgreSQL / Vercel Storage (Production)")
    draw_arrow(360, 328, 360, 350)

    draw_box(130, 350, 590, 398, "OUTPUT & REPORT GENERATION", "JSON Log Export | Interactive Charts | Live SOC Dashboard")
    draw_arrow(360, 398, 360, 420)

    draw_box(170, 420, 550, 460, "LIVE DEPLOYMENT", "https://sentinelgpt-ai.vercel.app")

    path = os.path.join(IMG_DIR, "sample_flow_diagram.png")
    img.save(path)
    return path

# ------------------------------------------------------------------------------
# 2. CREATE ADJUSTED WORD DOCUMENT (TABLE POINT REMOVED, PERFECT IMAGE ALIGNMENT)
# ------------------------------------------------------------------------------
def create_exact_reference_word_document(save_paths):
    arch_img = generate_sample_style_arch_diagram()
    flow_img = generate_sample_style_flow_diagram()

    doc = docx.Document()

    # Margins: Standard 1 inch all around
    section = doc.sections[0]
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

    # Base font: Times New Roman 12pt, Black text
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = RGBColor(0, 0, 0)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(10)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_para(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        if bold_prefix:
            r_bold = p.add_run(bold_prefix)
            r_bold.font.name = 'Times New Roman'
            r_bold.font.bold = True
            r_bold.font.color.rgb = RGBColor(0, 0, 0)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    def add_centered_image(img_path, width_inches=5.5):
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(12)
            p.add_run().add_picture(img_path, width=Inches(width_inches))

    # ==========================================================================
    # PAGE 1: TITLE PAGE (Matching Screenshot Page 1)
    # ==========================================================================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(140)
    p_title.paragraph_format.space_after = Pt(20)
    
    r_t1 = p_title.add_run("SentinelGPT: An AI-Powered Large Language Model\nFramework for Advanced Cyber Threat Detection\nand Analysis")
    r_t1.font.name = 'Times New Roman'
    r_t1.font.size = Pt(20)
    r_t1.font.bold = True
    r_t1.font.color.rgb = RGBColor(0, 0, 0)

    p_info = doc.add_paragraph()
    p_info.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_info.paragraph_format.space_before = Pt(160)
    p_info.paragraph_format.line_spacing = 1.5
    
    r_n = p_info.add_run("pravallika kalangi\n")
    r_n.font.name = 'Times New Roman'
    r_n.font.size = Pt(14)
    r_n.font.bold = True

    r_r = p_info.add_run("24VV1F0044\n")
    r_r.font.name = 'Times New Roman'
    r_r.font.size = Pt(14)

    r_y = p_info.add_run("MCA 2nd year\n")
    r_y.font.name = 'Times New Roman'
    r_y.font.size = Pt(14)

    doc.add_page_break()

    # ==========================================================================
    # PAGE 2: PROBLEM STATEMENT (Matching Screenshot Page 2)
    # ==========================================================================
    add_heading_1("Problem statement")
    
    add_para("Preparing and managing enterprise cybersecurity operations is a challenging and time-consuming task for modern organizations. Every day, security administrators must analyze incoming network packets, monitor server logs, track potential vulnerabilities, and isolate malicious IP addresses while ensuring that all operational protocols and data protection constraints are satisfied. In many organizations, this process is still performed manually or using basic logging applications, which often leads to alert fatigue, missed security threats, repeated operational delays, and increased administrative effort. As the number of network nodes, cloud microservices, and connected devices increases, cybersecurity management becomes more complex and difficult to execute efficiently.")

    add_para("One of the major challenges is avoiding delayed incident response and lateral threat movement. A malicious attacker or compromise attempt may target multiple endpoints across different network segments simultaneously, making it difficult for human security analysts to detect correlated attacks in real time. Automated firewall quarantine is another critical issue because threat isolation requires continuous, immediate enforcement and should not be delayed by manual administrative review. In addition, every threat event must receive proper risk scoring according to established cybersecurity frameworks, and security monitoring must maintain uninterrupted 24/7 surveillance without creating security blind spots.")

    add_para("Traditional security management methods also lack flexibility, transparency, and real-time visualization. Even a minor change in network traffic patterns or threat vectors often requires administrators to manually reconfigure rules or re-evaluate historical logs. Identifying and resolving complex security incidents consumes significant time and increases the possibility of human error. Furthermore, many existing systems do not provide clear explanations of security decisions, interactive threat analytics, or dynamic incident remediation recommendations.")

    add_para("To address these challenges, this project proposes SentinelGPT: An AI-Powered Large Language Model Framework for Advanced Cyber Threat Detection and Analysis. The system uses intelligent software agents to automatically generate threat assessments, validate network security posture, calculate risk scores using heuristic algorithms, dynamically map threats to MITRE ATT&CK techniques, and execute autonomous quarantine actions. It also provides a web-based dashboard for threat management, incident analysis, live telemetry visualization, AI triage assistant interaction, and log export. By automating threat detection and response, the proposed system reduces manual effort, minimizes incident response times, improves threat accuracy, and provides an efficient, reliable, and user-friendly solution for enterprise cybersecurity operations.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 3: DIFFERENCE TABLE (Adjusted to 8 Points - Removed Last Point to fit Page 3 perfectly)
    # ==========================================================================
    add_heading_1("Difference Between Traditional Security Operations and the Proposed Agentic AI-Based SentinelGPT System")

    add_para("Traditional security monitoring is done manually using paper records, basic log viewers, or simple firewall management software. It requires more time and effort and may result in response delays and human error. The proposed Agentic AI-Based SentinelGPT System automates threat detection and mitigation using intelligent software agents. It reduces manual work, improves accuracy, and provides features such as real-time telemetry visualization, heuristic anomaly scoring, automated quarantine, AI triage assistance, and log export. The table below shows the comparison between the traditional system and the proposed system. The following table highlights the major differences between the traditional security operations system and the proposed Agentic AI-based system.")

    diff_table = doc.add_table(rows=9, cols=2)
    diff_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    diff_table.style = 'Table Grid'

    hdr_cells = diff_table.rows[0].cells
    hdr_cells[0].paragraphs[0].add_run("Traditional Security Operations System").bold = True
    hdr_cells[1].paragraphs[0].add_run("Proposed Agentic AI Based SentinelGPT System").bold = True

    # 8 Key Points (Last point removed as requested)
    table_data = [
        ("Security alerts are monitored manually using basic log viewers or static firewall software.",
         "Threats are detected and analyzed automatically using intelligent software agents based on heuristic security models."),
        ("Requires significant manual effort and considerable time to evaluate network threats.",
         "Reduces manual effort and analyzes threats efficiently within a fraction of a second."),
        ("Network packet anomalies must be reviewed manually, increasing the risk of security breaches.",
         "Automatically verifies network telemetry and prevents malicious IP addresses from compromising system resources."),
        ("Firewall quarantine rules may be applied in non-continuous intervals or conflict with active rules.",
         "Automatically allocates firewall quarantine rules in real time while maintaining strict security policies."),
        ("Incident priority scores are manually estimated, which may lead to incorrect threat assessments.",
         "Ensures every incident receives an accurate risk score (0-100) through automatic heuristic validation."),
        ("Threat remediation requires manual analysis and repeated verification of security logs.",
         "Supports quick AI-driven triage generation and instant security remediation guidance."),
        ("Security incidents and false positives are difficult to identify and resolve manually.",
         "Uses an Autonomous Quarantine Agent to automatically detect and eliminate high-risk threats before system compromise."),
        ("Provides limited information about how security decisions and threat scores are made.",
         "Maintains detailed agent logs and MITRE ATT&CK mapping that record security activities for better transparency."),
    ]

    for idx, (trad_text, prop_text) in enumerate(table_data, start=1):
        r_cells = diff_table.rows[idx].cells
        r_cells[0].paragraphs[0].add_run(trad_text)
        r_cells[1].paragraphs[0].add_run(prop_text)

    doc.add_page_break()

    # ==========================================================================
    # PAGE 4: PROPOSED SYSTEM (Matching Screenshot Page 4)
    # ==========================================================================
    add_heading_1("Proposed System")

    add_para("The proposed Agentic AI Based SentinelGPT System is an intelligent web-based application developed to automate the process of cyber threat detection, network monitoring, and incident management. The system is designed to reduce the time, effort, and errors involved in manual security operations by using intelligent software agents that analyze telemetry and validate security policies based on predefined cybersecurity constraints.")

    add_para("The system allows the security administrator to monitor parameters such as source IP address, target endpoint, payload signature, attack type (such as DDoS, SQL injection, or brute force), and required risk threshold. Based on these inputs, the Telemetry Monitor Agent automatically creates threat assessments by evaluating network traffic against heuristic models while ensuring that all security rules are followed. It gives priority to critical vulnerability vectors by assigning them immediate risk scores and ensures that anomalous traffic does not cross perimeter boundaries. The system also checks active IP quarantine status across all network nodes to prevent unauthorized access.")

    add_para("After threat assessment generation, the Autonomous Quarantine Agent verifies the detected security events by checking whether each incident has been assigned the correct priority score, firewall isolation rules remain active, security policies are preserved, and no malicious IP is permitted to execute unauthorized requests. If any high-risk violation (score >= 75) is detected, the offending IP is automatically quarantined until administrator review.")

    add_para("The system provides a user-friendly dashboard where administrators can view live telemetry, trigger manual threat simulations, inspect incident histories, manage quarantine lists, interact with an AI triage assistant, and clear logs. All detected incidents are securely stored in the database, allowing easy retrieval and future security audits. The application also maintains detailed agent logs that record every important security decision taken during threat analysis and quarantine, making the process transparent and easy to debug.")

    add_para("Additionally, the system supports structured JSON log export and RESTful API access, enabling security teams to integrate SentinelGPT with external SIEM tools. By combining intelligent threat detection, automated quarantine validation, secure data management, and an interactive web interface, the proposed system provides a reliable, efficient, and scalable solution for enterprise cybersecurity management. It minimizes manual effort, improves detection accuracy, eliminates response delays, and enhances the overall security posture of modern organizations.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 5: SYSTEM ARCHITECTURE (Matching Screenshot Page 5)
    # ==========================================================================
    add_heading_1("System Architecture")

    add_para("The Agentic AI Based SentinelGPT System follows a modular architecture in which each component performs a specific security task. The system starts when the administrator logs in using a valid username and password. After successful authentication, the administrator accesses the security operations dashboard to monitor live telemetry, inspect network anomalies, and review risk metrics.")

    add_para("The entered information and network requests are sent to the FastAPI backend, which acts as the central controller of the system. It receives user requests, processes API calls, manages authentication tokens, and coordinates communication between different security modules of the application.")

    add_para("The backend first sends telemetry data to the Telemetry Monitor Agent, which automatically evaluates the security events. It gives priority to high-risk attack vectors by calculating heuristic anomaly scores (0-100) and ensures that threat classifications dynamically map to recognized MITRE ATT&CK techniques. After evaluating network traffic, it assigns risk categories (Critical, High, Medium, Low) while checking IP reputation and avoiding security conflicts across different network segments.")

    add_para("Once threat assessments are generated, they are passed to the Autonomous Quarantine Agent. This agent verifies that all security rules are satisfied. It checks whether each incident has an accurate risk score, confirms that quarantine thresholds remain enforced, ensures continuous perimeter protection, and verifies that high-risk malicious IPs are blocked immediately from executing further API calls.")

    add_para("After successful validation, security incidents and quarantine status are stored in the database. The database contains four main ORM tables: the Users table for administrator credentials and roles, the SOC Incidents table for storing threat configurations and risk scores, the Perimeter Logs table for network traffic metrics, and the Blocked IPs table for recording active quarantine lists enforced by the intelligent agents.")

    add_para("Finally, stored security data is displayed on the interactive dashboard, where administrators can view live threat velocity, inspect charts, execute manual IP blocks or unblocks, trigger test threats, or clear logs whenever necessary. The system also allows incident reports to be exported as structured JSON data for security compliance.")

    add_para("The modular design of the system improves reliability, reduces manual effort, eliminates response latency, and provides an efficient solution for enterprise cybersecurity operations.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 6: ARCHITECTURE DIAGRAM & TECHNOLOGIES (Matching Screenshot Page 6)
    # ==========================================================================
    add_centered_image(arch_img, width_inches=5.5)

    add_heading_1("Technologies Used")
    add_para("The Agentic AI Based SentinelGPT System is developed using a combination of modern frontend, backend, database, and AI technologies. These technologies work together to automate threat monitoring, manage security schedules efficiently, and provide a secure and user-friendly web application. The technology stack used in this project is described below.")

    add_heading_2("1. Frontend Technologies")
    add_para("The frontend provides an interactive and user-friendly interface through which administrators can access all system features such as login, dashboard monitoring, threat inspection, firewall quarantine control, AI triage assistant chat, and log export.")

    add_subheading = lambda t: add_para("", bold_prefix=f"{t}\n")
    
    add_subheading("HTML5")
    add_para("HTML5 is used to create the structure of all web pages, including the login page, operations dashboard, threat management views, AI assistant panel, and report export templates.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 7: FRONTEND & BACKEND TECHNOLOGIES (Matching Screenshot Page 7)
    # ==========================================================================
    add_subheading("CSS3 & Glassmorphism")
    add_para("CSS3 is used to design an attractive and responsive user interface. It styles forms, buttons, cards, dashboard charts, navigation menus, and cyberpunk glassmorphic layouts to improve the user experience.")

    add_subheading("JavaScript & React 19")
    add_para("JavaScript and React 19 are used to provide client-side interactivity, handle user actions, validate form inputs, and dynamically update webpage content without refreshing the entire page. React 19 manages state updates efficiently.")

    add_subheading("Vite 5.4")
    add_para("Vite 5.4 is the build tool and development server used to serve the single-page application (SPA). It provides ultra-fast Hot Module Replacement (HMR) and packages production builds into static bundles.")

    add_heading_2("2. Backend Technologies")
    add_para("The backend contains the core business logic of the application. It processes administrator requests, manages threat scoring, validates security policies, and communicates with the database.")

    add_subheading("Python 3.11+")
    add_para("Python is the primary programming language used to implement the application logic, threat scoring algorithms, validation rules, database ORM operations, and overall system functionality.")

    add_subheading("FastAPI")
    add_para("FastAPI is the backend framework used to develop the web application. It handles routing, JWT authentication, session management, API requests, threat processing, and communication between the frontend and database.")

    add_subheading("Uvicorn")
    add_para("Uvicorn is the ASGI server used to run the FastAPI application. It processes client requests efficiently and delivers fast responses to users.")

    add_heading_2("3. Agentic AI Technologies")
    add_para("The intelligent functionality of the system is implemented using custom software agents.")

    add_subheading("Telemetry Monitor Agent")
    add_para("The Telemetry Monitor Agent automatically analyzes threat events by calculating heuristic risk scores (0-100) while considering packet velocity, IP reputation, attack signatures, and MITRE ATT&CK technique mapping.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 8: AGENTS, DATABASE, TOOLS (Matching Screenshot Page 8)
    # ==========================================================================
    add_subheading("Autonomous Quarantine Agent")
    add_para("The Autonomous Quarantine Agent verifies generated security events by checking risk score thresholds (score >= 75), enforcing active firewall IP quarantine, validating manual revoke requests, and generating AI remediation advice before finalizing incident status.")

    add_heading_2("4. Database Technologies")
    add_para("The database stores all application data securely and allows efficient retrieval of security incident information.")

    add_subheading("SQLAlchemy ORM")
    add_para("SQLAlchemy acts as the Object Relational Mapper (ORM), allowing Python programs to interact with database tables without writing raw SQL queries manually.")

    add_subheading("SQLite")
    add_para("SQLite is used as the local development database. It stores administrator details, SOC incidents, perimeter logs, and blocked IP quarantine records during development and testing.")

    add_subheading("PostgreSQL / Vercel Storage")
    add_para("PostgreSQL hosted on cloud infrastructure is used as the production database after deployment. It securely stores application data in the cloud and supports multi-user access.")

    add_heading_2("5. Export & API Documentation Technologies")

    add_subheading("Swagger / OpenAPI")
    add_para("FastAPI automatically generates interactive OpenAPI Swagger documentation at `/docs`, enabling administrators to inspect and execute API endpoints directly from the browser.")

    add_heading_2("6. Development Tools")
    add_para("The following tools were used during the development of the project:")
    add_para("Visual Studio Code (VS Code) – Used as the primary code editor.")
    add_para("Git & GitHub – Used for version control and source code management.")
    add_para("Python Virtual Environment (venv) – Used to manage project dependencies.")
    add_para("Requirements.txt – Maintains the list of Python packages required by the application.")

    add_heading_2("7. Deployment Technologies")
    add_para("The application is designed for both local execution and cloud deployment.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 9: DEPLOYMENT & STACK FLOW DIAGRAM (Matching Screenshot Page 9)
    # ==========================================================================
    add_para("SQLite is used during local development.")
    add_para("PostgreSQL / Vercel Storage is used as the production database.")
    add_para("Vercel Cloud Platform is used to deploy the full-stack FastAPI and React application online.")
    add_para("Environment variables are managed using the .env configuration file.")

    add_centered_image(flow_img, width_inches=5.5)

    doc.add_page_break()

    # ==========================================================================
    # PAGE 10: AGENTS USED & RESPONSIBILITIES (Matching Screenshot Page 10)
    # ==========================================================================
    add_heading_1("Agents Used")
    add_para("The Agentic AI Based SentinelGPT System uses two intelligent software agents to automate the threat detection and response process. Each agent performs a specific task independently, making the system more accurate, efficient, and reliable. The Telemetry Monitor Agent is responsible for analyzing security events and calculating risk scores, while the Autonomous Quarantine Agent verifies that generated threat assessments satisfy all security rules before quarantine is finalized. These agents work together to produce a zero-latency defense workflow with minimal human intervention.")

    add_heading_2("1. Telemetry Monitor Agent")
    add_para("The Telemetry Monitor Agent is responsible for automatically evaluating threat telemetry based on network inputs provided by system monitoring feeds. It receives inputs such as source IP address, target URL, payload signature, request frequency, and attack type. The agent intelligently calculates risk scores (0-100) and maps threats to MITRE ATT&CK techniques while following predefined security policies.")

    add_heading_2("Responsibilities")
    add_para("Reads network telemetry and security log events.")
    add_para("Calculates heuristic anomaly risk scores (0-100).")
    add_para("Gives priority to critical vulnerability vectors.")
    add_para("Maps threat behaviors to MITRE ATT&CK tactics.")
    add_para("Prevents duplicate log processing.")
    add_para("Generates complete SOC incident payloads automatically.")

    add_heading_2("2. Autonomous Quarantine Agent")
    add_para("The Autonomous Quarantine Agent verifies threat assessments generated by the Telemetry Monitor Agent. It checks whether all security constraints have been satisfied before an IP quarantine is finalized. If any high-risk threat (score >= 75) is detected, the agent automatically isolates the IP into the quarantine table.")

    add_heading_2("Responsibilities")
    add_para("Validates priority scores for each security incident.")
    add_para("Enforces automated IP firewall quarantine.")
    add_para("Verifies quarantine revocation requests.")
    add_para("Validates user authorization and JWT tokens.")
    add_para("Approves quarantine actions only after successful validation.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 11: WORKING OF AGENTS & WORKFLOW (Matching Screenshot Page 11)
    # ==========================================================================
    add_heading_1("Working of Agents")
    add_para("The system ingests network telemetry through web API endpoints or monitoring scripts. The Telemetry Monitor Agent creates threat assessments automatically based on heuristic rules. After generation, the Autonomous Quarantine Agent verifies the incident by checking all security constraints. If validation confirms a critical threat (score >= 75), the offending IP is stored in the Blocked IPs table and displayed on the dashboard. Otherwise, the threat status remains monitored until further activity is detected.")

    add_heading_2("Architecture:")

    add_centered_image(flow_img, width_inches=5.5)

    doc.add_page_break()

    # ==========================================================================
    # PAGE 12: IMPLEMENTATION PHASES 1-5 (Matching Screenshot Page 12)
    # ==========================================================================
    add_heading_1("Implementation")
    add_para("The development of the Agentic AI Based SentinelGPT System was carried out in several phases. Each phase focused on a specific part of the system to ensure a structured and efficient development process.")

    add_heading_2("Phases:")

    add_heading_2("Phase 1: Requirement Analysis")
    add_para("The first phase involved identifying the problems in traditional security operations and gathering system requirements. The functional and non-functional requirements were analyzed, including threat detection, risk scoring, MITRE ATT&CK mapping, quarantine enforcement, dashboard management, and JSON log export.")

    add_heading_2("Phase 2: System Design")
    add_para("In this phase, the overall architecture of the system was designed. The frontend React SPA, backend FastAPI controller, database models, agent workflows, and API modules were planned. The database schema, user interface layouts, and security workflows were also finalized.")

    add_heading_2("Phase 3: Database Design")
    add_para("The database was designed using SQLAlchemy ORM. Four tables were created:")
    add_para("Users Table – Stores administrator login credentials and user roles.")
    add_para("SOC Incidents Table – Stores threat configurations, risk scores, and MITRE ATT&CK data.")
    add_para("Perimeter Logs Table – Stores raw network traffic and endpoint request metrics.")
    add_para("Blocked IPs Table – Stores active firewall quarantine records and revocation timestamps.")
    add_para("SQLite was used for local development, while cloud-hosted PostgreSQL was planned for production deployment.")

    add_heading_2("Phase 4: Frontend Development")
    add_para("The user interface was developed using HTML5, CSS3, JavaScript, and React 19. Pages such as Login, Dashboard, Threat History, Blocked IPs, AI Assistant Chat, and File Scanner were created to provide an easy-to-use interface for security operators.")

    add_heading_2("Phase 5: Backend Development")
    add_para("The backend was implemented using Python, FastAPI, and Uvicorn. API routes were developed for administrator authentication, telemetry snapshot retrieval, IP quarantine enforcement, threat simulation, and JSON log export.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 13: IMPLEMENTATION PHASES 6-9 & APPLICATIONS (Matching Screenshot Page 13)
    # ==========================================================================
    add_heading_2("Phase 6: Agent Development")
    add_para("The intelligent software agents were developed during this phase.")
    add_para("The Telemetry Monitor Agent automatically calculates threat scores by evaluating packet rates and attack signatures while avoiding duplicate alerts.")
    add_para("The Autonomous Quarantine Agent verifies generated security events by checking risk thresholds, enforcing firewall isolation, and supporting manual revocation.")

    add_heading_2("Phase 7: Threat Generation and Validation")
    add_para("After evaluating telemetry details, the Telemetry Monitor Agent creates incident records based on security models. The Autonomous Quarantine Agent then verifies the threat to ensure all security rules are satisfied. Only validated threats are processed for automated quarantine.")

    add_heading_2("Phase 8: Testing and Debugging")
    add_para("The system was tested to verify all functionalities, including administrator login, telemetry visualization, manual IP blocking, quarantine revocation, threat simulation, and database operations. Errors and scoring inconsistencies were identified and corrected to improve system reliability.")

    add_heading_2("Phase 9: Deployment")
    add_para("The application was prepared for deployment using Vercel Cloud Platform as the hosting provider. Environment variables were configured, and the system was made accessible online through a web browser.")

    add_heading_1("Applications")
    add_para("The Agentic AI Based SentinelGPT System can be used in various enterprise and institutional environments to simplify and automate cyber threat monitoring. By reducing manual effort and ensuring real-time threat quarantine, the system improves operational efficiency and security accuracy.")

    add_heading_2("Applications")

    add_heading_2("1. Enterprise SOC Centers")
    add_para("The system can be used to monitor enterprise network perimeters, analyze incoming traffic logs, and execute automated IP quarantine without manual analyst delay.")

    add_heading_2("2. Financial Institutions")
    add_para("It helps banks and payment gateways automatically detect credential stuffing and brute-force attacks while maintaining continuous security compliance.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 14: APPLICATIONS 3-7 & CONCLUSION (Matching Screenshot Page 14)
    # ==========================================================================
    add_heading_2("3. Cloud Infrastructure Providers")
    add_para("Cloud hosting platforms can use the system to manage complex security requirements across microservices, ensuring real-time threat detection across distributed servers.")

    add_heading_2("4. Healthcare Networks")
    add_para("Hospitals and healthcare organizations can use the system to secure patient data endpoints, protecting electronic health records from unauthorized malware or ransomware probes.")

    add_heading_2("5. E-Commerce Platforms")
    add_para("Online retailers can use the system to organize threat monitoring during peak sales events, preventing DDoS disruptions and SQL injection attacks.")

    add_heading_2("6. Educational Organizations")
    add_para("Universities and certification centers can use the system to protect student portals and administrative databases from credential theft.")

    add_heading_2("7. Academic Administration")
    add_para("The system assists IT administrators in monitoring, editing, revoking, and exporting threat data through a centralized dashboard, reducing manual work and improving security readiness.")

    add_heading_1("Conclusion")
    add_para("The Agentic AI Based SentinelGPT System provides an efficient and intelligent solution for automating cyber threat detection and security management. By replacing manual log review with autonomous software agents, the system reduces administrative effort, eliminates response latency, and improves the overall accuracy of threat mitigation. The Telemetry Monitor Agent automatically calculates risk scores based on heuristic security models, while the Autonomous Quarantine Agent verifies that all security constraints, including IP isolation, MITRE ATT&CK mapping, and user authorization, are satisfied before incident status is finalized.")

    add_para("The system offers a user-friendly web interface that enables administrators to monitor, analyze, quarantine, and manage security events with ease. It also maintains agent logs for transparency and supports JSON log export for convenient SIEM integration. Built using FastAPI, Python, SQLAlchemy, HTML5, CSS3, JavaScript, React 19, SQLite, and Vercel, the application is scalable, reliable, and suitable for organizations of different sizes. Overall, the project demonstrates how an agent-based approach can simplify cybersecurity operations, reduce human errors, save time, and provide an effective, modern solution for enterprise cyber defense.")

    doc.add_page_break()

    # ==========================================================================
    # PAGE 15: REFERENCES & LIVE WEBSITE (Matching Screenshot Page 15)
    # ==========================================================================
    add_heading_1("References")

    add_para("FastAPI Documentation. FastAPI. Available at: https://fastapi.tiangolo.com/")
    add_para("SQLAlchemy Documentation. SQLAlchemy ORM. Available at: https://docs.sqlalchemy.org/")
    add_para("Python Software Foundation. Python 3 Documentation. Available at: https://docs.python.org/3/")
    add_para("Uvicorn Documentation. The ASGI Server. Available at: https://www.uvicorn.org/")
    add_para("React Documentation. React 19 User Interface Library. Available at: https://react.dev/")
    add_para("Vite Documentation. Vite Next Generation Frontend Tooling. Available at: https://vitejs.dev/")
    add_para("MDN Web Docs. HTML5, CSS3 and JavaScript Documentation. Available at: https://developer.mozilla.org/")
    add_para("MITRE ATT&CK Framework. Enterprise Tactics and Techniques. Available at: https://attack.mitre.org/")
    add_para("SQLite Documentation. SQLite Official Documentation. Available at: https://www.sqlite.org/docs.html")
    add_para("Vercel Documentation. Deploying Serverless Applications. Available at: https://vercel.com/docs")
    add_para("Russell, S., & Norvig, P. (2021). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.")
    add_para("Wooldridge, M. (2009). An Introduction to MultiAgent Systems (2nd ed.). John Wiley & Sons.")

    add_heading_1("Live Website")

    add_para("The application is cloud-ready. To deploy, one sets the DATABASE_URL to a production database instance and ensures the build environment installs all Python dependencies. For example, on Vercel or Cloud platforms, one can configure a Python build and deployment command. The app automatically initializes its database tables on startup and creates a default admin account (prompting to login with secure credentials).")

    add_para("A live instance of this project is available at:")
    add_para("https://sentinelgpt-ai.vercel.app")

    add_para("The official GitHub repository for source code verification is available at:")
    add_para("https://github.com/Pravallika2025/sentigraud-ai-.git")

    # Save Word Doc to both paths
    for save_path in save_paths:
        doc.save(save_path)
        print(f"Sample-matching Word Document saved to: {save_path}")

if __name__ == "__main__":
    target_paths = [
        os.path.join(BASE_DIR, "docs", "SentinelGPT_Project_Report.docx"),
        os.path.join(DESKTOP_DIR, "SentinelGPT_Project_Report.docx")
    ]
    create_exact_reference_word_document(target_paths)
