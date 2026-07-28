const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const axios = require('axios'); // For VirusTotal/AbuseIPDB
// const OpenAI = require('openai');

admin.initializeApp();
const db = admin.firestore();

// --- 1. SCHEDULED MONITORING (Runs every 10 mins) ---
// This simulates continuous fetching from APIs like VirusTotal or AbuseIPDB
exports.continuousThreatMonitor = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {
    const mockThreats = [
        { type: "Tor exit node traffic", ip: "45.12.33.109", baseRisk: 40 },
        { type: "Credential Stuffing", ip: "185.220.101.5", baseRisk: 85 },
        { type: "Port Scanner detected", ip: "8.8.8.8", baseRisk: 15 }
    ];

    const threat = mockThreats[Math.floor(Math.random() * mockThreats.length)];
    const riskScore = threat.baseRisk + Math.floor(Math.random() * 15);
    
    await db.collection('threats').add({
        type: threat.type,
        ip: threat.ip,
        riskScore: riskScore,
        action: riskScore > 60 ? "Blocked by AI" : "Logged for Review",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Monitored and detected: ${threat.type}`);
    return null;
});

// --- 2. AI THREAT CLASSIFICATION (On New Threat) ---
// This function triggers when a new threat is logged to analyze it with AI
exports.aiThreatAnalysis = functions.firestore
    .document('threats/{threatId}')
    .onCreate(async (snap, context) => {
        const threat = snap.data();
        
        // --- OpenAI Integration Placeholder ---
        /*
        const openai = new OpenAI({ apiKey: functions.config().openai.key });
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: `Analyze this cyber threat: ${JSON.stringify(threat)}` }]
        });
        const aiSummary = response.choices[0].message.content;
        */
        
        const aiSummary = `AI Analysis: IP ${threat.ip} shows patterns of ${threat.type}. Cross-referenced with global threat intelligence. Recommend maintaining active block.`;

        // Store AI insights in alerts collection
        if (threat.riskScore > 60) {
            await db.collection('alerts').add({
                threatId: context.params.threatId,
                title: "High Risk Incident",
                message: aiSummary,
                severity: "High",
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            
            // --- SendGrid / Email Alert Placeholder ---
            // console.log("EMAILING ADMIN: Critical threat detected!");
        }

        return null;
    });

// --- 3. RISK SCORE AGGREGATOR ---
// Keeps the overall system risk score updated
exports.updateSystemRisk = functions.firestore
    .document('threats/{threatId}')
    .onCreate(async (snap, context) => {
        const threatsSnapshot = await db.collection('threats')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        let totalScore = 0;
        threatsSnapshot.forEach(doc => {
            totalScore += doc.data().riskScore || 0;
        });

        const avgScore = Math.floor(totalScore / threatsSnapshot.size);

        await db.collection('risk_scores').add({
            score: avgScore,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return null;
    });
