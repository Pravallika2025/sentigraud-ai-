// Initialize Icons
lucide.createIcons();

// Header Scroll Effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(10, 10, 15, 0.95)';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
    } else {
        header.style.background = 'rgba(10, 10, 15, 0.8)';
        header.style.boxShadow = 'none';
    }
});

// Intersection Observer for Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up').forEach(element => {
    observer.observe(element);
});

// Simulate Live Threat Feed in Hero Section
const heroFeed = document.getElementById('hero-feed');
const threatTypes = ['DDoS Attempt', 'SQL Injection', 'Port Scan', 'Unauthorized Access', 'Malware Payload'];
const actions = ['BLOCKED', 'QUARANTINED', 'DROPPED'];

function generateIP() {
    return `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
}

function addFeedLine() {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
    const ip = generateIP();
    const threat = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    const line = document.createElement('div');
    line.className = 'feed-line';
    line.innerHTML = `<span class="time">[${time}]</span> <span class="ip">${ip}</span> - ${threat} <span class="action">${action}</span>`;
    
    heroFeed.appendChild(line);
    
    // Keep only last 5 lines
    if (heroFeed.children.length > 5) {
        heroFeed.removeChild(heroFeed.firstChild);
    }
}

// Initial populate
for(let i=0; i<4; i++) {
    addFeedLine();
}

// Update feed periodically
setInterval(addFeedLine, 2500);

// Number Counter Animation
const packetCounter = document.getElementById('packet-counter');
let currentPackets = 4892103;

setInterval(() => {
    const increment = Math.floor(Math.random() * 50) + 10;
    currentPackets += increment;
    packetCounter.innerText = currentPackets.toLocaleString();
}, 1000);
