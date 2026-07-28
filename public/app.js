import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- FIREBASE CONFIGURATION ---
// IMPORTANT: Replace with your actual Firebase Project config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB-YOUR-API-KEY",
  authDomain: "sentinel-gpt-demo.firebaseapp.com",
  projectId: "sentinel-gpt-demo",
  storageBucket: "sentinel-gpt-demo.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- UI ELEMENTS ---
const loader = document.getElementById('loader');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userEmailDisplay = document.getElementById('user-email');
const threatTableBody = document.getElementById('threat-table-body');
const riskScoreDisplay = document.getElementById('risk-score-display');
const riskFill = document.getElementById('risk-fill');
const riskLevelLabel = document.getElementById('risk-level');
const simulateBtn = document.getElementById('simulate-threat');
const exportBtn = document.getElementById('export-csv');

let threatChart;
let chartData = {
    labels: [],
    datasets: [{
        label: 'Threat Probability',
        data: [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
    }]
};

// --- AUTHENTICATION ---
onAuthStateChanged(auth, (user) => {
    loader.classList.add('hidden');
    if (user) {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userEmailDisplay.innerText = user.email;
        initDashboard();
    } else {
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Authentication Failed: " + error.message);
    }
});

logoutBtn.addEventListener('click', () => signOut(auth));

// --- DASHBOARD LOGIC ---
function initDashboard() {
    initChart();
    listenToThreats();
}

function initChart() {
    const ctx = document.getElementById('threatChart').getContext('2d');
    threatChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function listenToThreats() {
    const q = query(collection(db, "threats"), orderBy("timestamp", "desc"), limit(10));
    
    onSnapshot(q, (snapshot) => {
        threatTableBody.innerHTML = '';
        const rawData = [];
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            rawData.push(data);
            renderThreatRow(data);
        });

        if (rawData.length > 0) {
            updateRiskScore(rawData[0].riskScore); // Use latest threat score
            updateChart(rawData.reverse());
        }
    });
}

function renderThreatRow(data) {
    const row = document.createElement('tr');
    const date = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleTimeString() : 'Just now';
    
    let riskClass = 'risk-low';
    if (data.riskScore > 80) riskClass = 'risk-critical';
    else if (data.riskScore > 60) riskClass = 'risk-high';
    else if (data.riskScore > 30) riskClass = 'risk-medium';

    row.innerHTML = `
        <td>${date}</td>
        <td><span class="vector-name">${data.type}</span></td>
        <td><code>${data.ip}</code></td>
        <td><span class="${riskClass}">${data.riskScore}%</span></td>
        <td><span class="action-tag">${data.action}</span></td>
    `;
    threatTableBody.appendChild(row);
}

function updateRiskScore(score) {
    riskScoreDisplay.innerText = score;
    riskFill.style.width = score + '%';
    
    if (score > 80) {
        riskLevelLabel.innerText = "CRITICAL";
        riskLevelLabel.style.color = "var(--danger)";
        riskFill.style.background = "var(--danger)";
    } else if (score > 60) {
        riskLevelLabel.innerText = "HIGH";
        riskLevelLabel.style.color = "#f97316";
        riskFill.style.background = "#f97316";
    } else if (score > 30) {
        riskLevelLabel.innerText = "MEDIUM";
        riskLevelLabel.style.color = "var(--warning)";
        riskFill.style.background = "var(--warning)";
    } else {
        riskLevelLabel.innerText = "SAFE";
        riskLevelLabel.style.color = "var(--success)";
        riskFill.style.background = "var(--success)";
    }
}

function updateChart(threats) {
    threatChart.data.labels = threats.map(t => t.timestamp?.toDate ? t.timestamp.toDate().toLocaleTimeString() : '');
    threatChart.data.datasets[0].data = threats.map(t => t.riskScore);
    threatChart.update();
}

// --- SIMULATION ---
const threatTypes = [
    { type: "DDoS Volumetric Attack", action: "Null-Route Applied" },
    { type: "SQL Injection Payload", action: "WAF Filtered" },
    { type: "Brute Force Attempt", action: "IP Blacklisted" },
    { type: "Phishing Redirect", action: "Domain Blocked" },
    { type: "Malware Beaconing", action: "Socket Terminated" }
];

simulateBtn.addEventListener('click', async () => {
    const randomThreat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const score = Math.floor(Math.random() * 100);
    const mockIp = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;

    try {
        await addDoc(collection(db, "threats"), {
            type: randomThreat.type,
            action: randomThreat.action,
            riskScore: score,
            ip: mockIp,
            timestamp: serverTimestamp()
        });
    } catch (e) {
        console.error("Simulation failed. Check Firestore rules.", e);
        // Fallback for local testing if Firestore is not accessible yet
        renderThreatRow({ type: randomThreat.type, action: randomThreat.action, riskScore: score, ip: mockIp });
        updateRiskScore(score);
    }
});

// --- EXPORT ---
exportBtn.addEventListener('click', async () => {
    const querySnapshot = await getDocs(collection(db, "threats"));
    let csvContent = "data:text/csv;charset=utf-8,Timestamp,Type,IP,RiskScore,Action\n";
    
    querySnapshot.forEach((doc) => {
        const d = doc.data();
        const time = d.timestamp?.toDate ? d.timestamp.toDate().toISOString() : 'N/A';
        csvContent += `${time},${d.type},${d.ip},${d.riskScore},${d.action}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sentinel_threat_report.csv");
    document.body.appendChild(link);
    link.click();
});
