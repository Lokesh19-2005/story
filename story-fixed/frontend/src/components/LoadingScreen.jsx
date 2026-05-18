// src/components/LoadingScreen.jsx
export default function LoadingScreen({ message = 'LOADING...' }) {
  return (
    <div style={{ minHeight:'50vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div className="spin" />
      <div style={{ fontFamily:'var(--fm)', fontSize:'8.5px', letterSpacing:'.2em', color:'var(--warm)' }}>{message}</div>
    </div>
  );
}
