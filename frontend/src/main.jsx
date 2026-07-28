import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * SYSTEM BOOTSTRAP
 * Standard mounting sequence with basic environment validation.
 */
const boot = () => {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
        console.error("Critical: Initialization target 'root' missing.");
        return;
    }

    try {
        const root = createRoot(rootElement);
        root.render(
            <StrictMode>
                <App />
            </StrictMode>,
        );
    } catch (err) {
        console.error("Frontend Boot Failure:", err);
    }
};

boot();
