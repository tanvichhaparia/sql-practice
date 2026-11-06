import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0f172a', color: '#f1f5f9', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
          <h2 style={{ color: '#f87171' }}>⚠ SQLEdge OA — Render Error</h2>
          <pre style={{ color: '#fca5a5', background: '#1e293b', padding: '1rem', borderRadius: '8px', marginTop: '1rem', overflowX: 'auto' }}>
            {String(this.state.error)}
          </pre>
          <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Open DevTools (F12 → Console) for full stack trace.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
