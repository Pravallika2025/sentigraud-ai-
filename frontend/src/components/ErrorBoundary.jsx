import React from 'react';

/**
 * PRODUCTION-GRADE ERROR BOUNDARY
 * Role: Catch genuine React rendering exceptions (JS errors in render/lifecycle).
 * This component is NO LONGER used to mask data/API issues.
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[RENDER_FAULT]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#050510', color: '#ff0055', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ marginBottom: '10px' }}>UI_RENDER_FAILURE</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>A non-recoverable rendering error occurred in the front-end components.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#ff0055', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            RELOAD_INTERFACE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
