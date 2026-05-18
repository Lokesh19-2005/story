// src/components/ErrorBoundary.jsx — Global error boundary
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', padding: 40,
        background: '#fafaf8', fontFamily: 'var(--fm)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 24 }}>◎</div>
        <div style={{ fontSize: '10px', letterSpacing: '.3em', marginBottom: 16 }}>SOMETHING WENT WRONG</div>
        <div style={{ fontSize: '8.5px', color: 'var(--warm)', marginBottom: 32, textAlign: 'center', maxWidth: 420, lineHeight: 1.8 }}>
          An unexpected error occurred. Please refresh the page. If the problem persists, contact support.
        </div>
        {import.meta.env.DEV && this.state.error && (
          <pre style={{ fontSize: 10, background: '#fee2e2', padding: 16, borderRadius: 4, maxWidth: 600, overflow: 'auto', marginBottom: 24, color: '#991b1b' }}>
            {this.state.error.toString()}
          </pre>
        )}
        <button
          className="btn btn-k"
          onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
          style={{ fontSize: '8px' }}>
          RELOAD PAGE
        </button>
      </div>
    );
  }
}
