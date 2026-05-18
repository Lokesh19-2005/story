// src/pages/AuthPage.jsx — Login, Register, Forgot/Reset Password
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../services/api.js';

export default function AuthPage({ setPage, reloadAfterLogin, initialMode, toast }) {
  const [mode, setMode]   = useState(initialMode || 'login');
  const [form, setForm]   = useState({ name: '', email: '', password: '', phone: '' });
  const [resetToken, setResetToken] = useState('');
  const [newPw, setNewPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useAuth();
  const t = toast || (() => {});

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (mode === 'forgot') {
      if (!form.email) { setError('Email required'); return; }
      setLoading(true);
      try {
        const d = await authAPI.forgotPassword({ email: form.email });
        setSuccess(d.message + (d.dev_token ? ` (Dev token: ${d.dev_token})` : ''));
        t('Reset link sent to your email', 'success');
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
      return;
    }
    if (mode === 'reset') {
      if (!resetToken || !newPw) { setError('Token and new password required'); return; }
      setLoading(true);
      try {
        await authAPI.resetPassword({ token: resetToken, newPassword: newPw });
        setSuccess('Password reset! You can now sign in.');
        t('Password reset successfully', 'success');
        setTimeout(() => { setMode('login'); setSuccess(''); }, 2000);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
      return;
    }
    if (!form.email || !form.password) { setError('Email and password required'); return; }
    if (mode === 'register' && !form.name) { setError('Name is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        t('Welcome back!', 'success');
      } else {
        await register(form.name, form.email, form.password, form.phone || undefined);
        t('Account created! Welcome to STORY™', 'success');
      }
      if (reloadAfterLogin) reloadAfterLogin();
      setPage('home');
    } catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const switchMode = (m) => { setMode(m); setError(''); setSuccess(''); };

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', border: 'var(--bd)', padding: '48px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--fs)', fontSize: '28px', fontWeight: 300, letterSpacing: '.1em', cursor: 'pointer', marginBottom: 8 }} onClick={() => setPage('home')}>STORY™</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: '8px', letterSpacing: '.2em', color: 'var(--warm)' }}>
            {mode === 'forgot' ? 'RESET YOUR PASSWORD' : mode === 'reset' ? 'CREATE NEW PASSWORD' : 'YOUR STYLE, YOUR STORY'}
          </div>
        </div>

        {(mode === 'login' || mode === 'register') && (
          <div style={{ display: 'flex', borderBottom: 'var(--bd)', marginBottom: 32 }}>
            {[['login','SIGN IN'],['register','CREATE ACCOUNT']].map(([val, label]) => (
              <button key={val} className={`auth-tab${mode === val ? ' active' : ''}`} onClick={() => switchMode(val)}>{label}</button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div><label className="fl2">FULL NAME</label><input className="fi2" placeholder="Rohit Sharma" value={form.name} onChange={set('name')} onKeyDown={e => e.key==='Enter'&&handleSubmit()} /></div>
          )}
          {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
            <div><label className="fl2">EMAIL ADDRESS</label><input className="fi2" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} onKeyDown={e => e.key==='Enter'&&handleSubmit()} /></div>
          )}
          {(mode === 'login' || mode === 'register') && (
            <div><label className="fl2">PASSWORD</label><input className="fi2" type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} onKeyDown={e => e.key==='Enter'&&handleSubmit()} /></div>
          )}
          {mode === 'register' && (
            <div><label className="fl2">PHONE <span style={{ opacity:.4 }}>(optional)</span></label><input className="fi2" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} /></div>
          )}
          {mode === 'reset' && (<>
            <div><label className="fl2">RESET TOKEN</label><input className="fi2" placeholder="Paste your reset token" value={resetToken} onChange={e => setResetToken(e.target.value)} /></div>
            <div><label className="fl2">NEW PASSWORD</label><input className="fi2" type="password" placeholder="Min 6 characters" value={newPw} onChange={e => setNewPw(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleSubmit()} /></div>
          </>)}

          {error   && <div style={{ padding:'10px 14px', background:'#fee2e2', fontFamily:'var(--fm)', fontSize:'8px', color:'#991b1b' }}>{error}</div>}
          {success && <div style={{ padding:'10px 14px', background:'#dcfce7', fontFamily:'var(--fm)', fontSize:'8px', color:'#166534' }}>{success}</div>}

          <button className="btn btn-k" style={{ width:'100%', marginTop: 8 }} onClick={handleSubmit} disabled={loading}>
            {loading ? 'PLEASE WAIT...' : mode==='login' ? 'SIGN IN →' : mode==='register' ? 'CREATE ACCOUNT →' : mode==='forgot' ? 'SEND RESET LINK →' : 'RESET PASSWORD →'}
          </button>

          {mode === 'login' && (
            <div style={{ textAlign:'right' }}>
              <span style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'var(--warm)', cursor:'pointer', textDecoration:'underline' }} onClick={() => switchMode('forgot')}>Forgot password?</span>
            </div>
          )}

          <div style={{ textAlign:'center', fontFamily:'var(--fm)', fontSize:'8.5px', color:'var(--warm)' }}>
            {mode==='login'    && <><span>New to STORY™? </span><span style={{ color:'#111', cursor:'pointer', textDecoration:'underline' }} onClick={() => switchMode('register')}>Create account</span></>}
            {mode==='register' && <><span>Already have an account? </span><span style={{ color:'#111', cursor:'pointer', textDecoration:'underline' }} onClick={() => switchMode('login')}>Sign in</span></>}
            {(mode==='forgot'||mode==='reset') && <><span>Remember it? </span><span style={{ color:'#111', cursor:'pointer', textDecoration:'underline' }} onClick={() => switchMode('login')}>Sign in</span></>}
          </div>
          <div style={{ textAlign:'center' }}>
            <span style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'var(--warm)', cursor:'pointer' }} onClick={() => setPage('home')}>← Continue as guest</span>
          </div>
        </div>
      </div>
    </div>
  );
}
