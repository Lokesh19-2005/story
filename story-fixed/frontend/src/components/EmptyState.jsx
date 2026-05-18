// src/components/EmptyState.jsx
export default function EmptyState({ icon = '◫', title, subtitle, action, onAction }) {
  return (
    <div style={{ textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:'48px', opacity:.15, marginBottom:20 }}>{icon}</div>
      <div style={{ fontFamily:'var(--fm)', fontSize:'11px', letterSpacing:'.2em', marginBottom:10 }}>{title}</div>
      {subtitle && <div style={{ fontFamily:'var(--fm)', fontSize:'8.5px', letterSpacing:'.08em', color:'var(--warm)', marginBottom:24 }}>{subtitle}</div>}
      {action && <button className="btn btn-k" onClick={onAction}>{action}</button>}
    </div>
  );
}
