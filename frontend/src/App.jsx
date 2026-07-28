import React, { useState, Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Login = lazy(() => import('./components/Login'));

function App() {
  const [token, setToken] = useState(localStorage.getItem('sentinel_token') || 'bypass_token');

  const logoutUser = () => {
    localStorage.removeItem('sentinel_token');
    setToken(null);
  };

  return (
    <ErrorBoundary>
      <div className="App" style={{ minHeight: '100vh', backgroundColor: '#050510' }}>
        <Suspense fallback={
          <div style={{ color: '#00f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'monospace' }}>
            RECOVERING_DASHBOARD_ENVIRONMENT...
          </div>
        }>
          {!token ? (
            <Login setToken={(t) => {
              localStorage.setItem('sentinel_token', t);
              setToken(t);
            }} />
          ) : (
            <Dashboard token={token} logout={logoutUser} />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
