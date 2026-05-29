// src/components/Toast.jsx — Toast notification system
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 2800) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastItem({ toast }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const bg = {
    success: '#111',
    error:   '#dc2626',
    warning: '#d97706',
    info:    '#1e40af',
  }[toast.type] || '#111';

  const icon = {
    success: '✓',
    error:   '✕',
    warning: '⚠',
    info:    'ℹ',
  }[toast.type] || '●';

  return (
    <div style={{
      background: bg,
      color: '#fff',
      fontFamily: 'var(--fm)',
      fontSize: '8.5px',
      letterSpacing: '.1em',
      padding: '12px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 240,
      maxWidth: 340,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.3s ease, opacity 0.3s ease',
      pointerEvents: 'auto',
    }}>
      <span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [message]);
  return <div className="toast">{message}</div>;
}
