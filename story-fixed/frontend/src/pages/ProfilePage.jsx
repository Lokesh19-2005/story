// src/pages/ProfilePage.jsx — Profile + Addresses + Returns
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { addressAPI, returnsAPI, ordersAPI } from '../services/api.js';
import { fp } from '../utils.js';

export default function ProfilePage({ setPage, user }) {
  const { updateProfile, changePassword, logout } = useAuth();
  const [tab, setTab]   = useState('profile');
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'' });
  const [pw, setPw]     = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]   = useState('');
  const [err, setErr]   = useState('');

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label:'Home', name:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'', is_default: false });
  const [addrSaving, setAddrSaving] = useState(false);

  // Returns state
  const [returns, setReturns] = useState([]);
  const [retLoading, setRetLoading] = useState(false);
  const [orders, setOrders]   = useState([]);
  const [retForm, setRetForm] = useState({ order_id:'', reason:'', details:'' });
  const [retSaving, setRetSaving] = useState(false);
  const [showRetForm, setShowRetForm] = useState(false);

  const set    = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setPwF = (k) => (e) => setPw(p => ({ ...p, [k]: e.target.value }));
  const setAF  = (k) => (e) => setAddrForm(p => ({ ...p, [k]: e.target.value }));
  const setRF  = (k) => (e) => setRetForm(p => ({ ...p, [k]: e.target.value }));

  const switchTab = (t) => { setTab(t); setMsg(''); setErr(''); };

  useEffect(() => {
    if (tab === 'addresses') {
      setAddrLoading(true);
      addressAPI.list().then(d => setAddresses(d.addresses||[])).catch(()=>{}).finally(()=>setAddrLoading(false));
    }
    if (tab === 'returns') {
      setRetLoading(true);
      Promise.all([returnsAPI.myList(), ordersAPI.list()])
        .then(([r, o]) => { setReturns(r.returns||[]); setOrders(o.orders||[]); })
        .catch(()=>{}).finally(()=>setRetLoading(false));
    }
  }, [tab]);

  const saveProfile = async () => {
    setSaving(true); setMsg(''); setErr('');
    try { await updateProfile(form); setMsg('Profile updated successfully.'); }
    catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const savePw = async () => {
    if (pw.newPassword !== pw.confirm) { setErr('Passwords do not match.'); return; }
    if (pw.newPassword.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setSaving(true); setMsg(''); setErr('');
    try { await changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }); setMsg('Password changed successfully.'); setPw({ currentPassword:'', newPassword:'', confirm:'' }); }
    catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  const saveAddress = async () => {
    if (!addrForm.name || !addrForm.phone || !addrForm.line1 || !addrForm.city || !addrForm.state || !addrForm.pincode) {
      alert('Please fill all required fields'); return;
    }
    setAddrSaving(true);
    try {
      const d = await addressAPI.add({ ...addrForm, is_default: addrForm.is_default ? 1 : 0 });
      setAddresses(prev => addrForm.is_default ? [d.address, ...prev.map(a => ({...a, is_default: 0}))] : [...prev, d.address]);
      setShowAddrForm(false);
      setAddrForm({ label:'Home', name:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'', is_default: false });
    } catch (e) { alert(e.message); } finally { setAddrSaving(false); }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    await addressAPI.remove(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const submitReturn = async () => {
    if (!retForm.order_id || !retForm.reason) { alert('Select an order and provide a reason'); return; }
    setRetSaving(true);
    try {
      const d = await returnsAPI.request(retForm);
      setReturns(prev => [d.return, ...prev]);
      setShowRetForm(false);
      setRetForm({ order_id:'', reason:'', details:'' });
    } catch (e) { alert(e.message); } finally { setRetSaving(false); }
  };

  const RET_STATUS = { requested:'#d97706', approved:'#2563eb', processing:'#7c3aed', completed:'#16a34a', rejected:'#dc2626' };
  const Field = ({ label, k, ...p }) => (<div><label className="fl2">{label}</label><input className="fi2" value={addrForm[k]} onChange={setAF(k)} {...p} /></div>);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontFamily:'var(--fs)', fontSize:'32px', fontWeight:300, letterSpacing:'.05em', marginBottom:6 }}>My Account</div>
        <div style={{ fontFamily:'var(--fm)', fontSize:'8.5px', letterSpacing:'.1em', color:'var(--warm)' }}>{user?.email}</div>
        {user?.role === 'admin' && <div style={{ display:'inline-block', marginTop:6, padding:'3px 10px', background:'#111', color:'#fff', fontFamily:'var(--fm)', fontSize:'7px', letterSpacing:'.15em' }}>ADMIN</div>}
      </div>

      <div style={{ display:'flex', gap:10, margin:'24px 0 32px', flexWrap:'wrap' }}>
        <button className="btn btn-w" style={{ fontSize:'8px', padding:'10px 20px' }} onClick={() => setPage('orders')}>MY ORDERS →</button>
        {user?.role === 'admin' && <button className="btn btn-r" style={{ fontSize:'8px', padding:'10px 20px', background:'#111', color:'#fff', borderColor:'#111' }} onClick={() => setPage('admin')}>ADMIN PANEL →</button>}
      </div>

      <div style={{ display:'flex', borderBottom:'var(--bd)', marginBottom:28, flexWrap:'wrap' }}>
        {[['profile','PROFILE'],['security','SECURITY'],['addresses','ADDRESSES'],['returns','RETURNS']].map(([val,label]) => (
          <button key={val} className={`auth-tab${tab===val?' active':''}`} onClick={() => switchTab(val)}>{label}</button>
        ))}
      </div>

      {msg && <div style={{ padding:'10px 14px', background:'#dcfce7', fontFamily:'var(--fm)', fontSize:'8px', color:'#166534', marginBottom:16 }}>{msg}</div>}
      {err && <div style={{ padding:'10px 14px', background:'#fee2e2', fontFamily:'var(--fm)', fontSize:'8px', color:'#991b1b', marginBottom:16 }}>{err}</div>}

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="fl2">FULL NAME</label><input className="fi2" value={form.name} onChange={set('name')} placeholder="Your name" /></div>
          <div><label className="fl2">EMAIL (READ ONLY)</label><input className="fi2" value={user?.email||''} readOnly style={{ opacity:.5, cursor:'not-allowed' }} /></div>
          <div><label className="fl2">PHONE</label><input className="fi2" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" /></div>
          <button className="btn btn-k" onClick={saveProfile} disabled={saving} style={{ marginTop:8 }}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
          <button onClick={() => { logout(); setPage('home'); }} style={{ background:'none', border:'none', fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.12em', color:'#b85c38', cursor:'pointer', padding:0, textAlign:'left', marginTop:8 }}>SIGN OUT →</button>
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label className="fl2">CURRENT PASSWORD</label><input className="fi2" type="password" value={pw.currentPassword} onChange={setPwF('currentPassword')} placeholder="••••••••" /></div>
          <div><label className="fl2">NEW PASSWORD</label><input className="fi2" type="password" value={pw.newPassword} onChange={setPwF('newPassword')} placeholder="Min 6 characters" /></div>
          <div><label className="fl2">CONFIRM NEW PASSWORD</label><input className="fi2" type="password" value={pw.confirm} onChange={setPwF('confirm')} placeholder="••••••••" /></div>
          <button className="btn btn-k" onClick={savePw} disabled={saving} style={{ marginTop:8 }}>{saving ? 'UPDATING...' : 'CHANGE PASSWORD'}</button>
        </div>
      )}

      {/* Addresses Tab */}
      {tab === 'addresses' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.1em', color:'var(--warm)' }}>{addresses.length} SAVED ADDRESS{addresses.length!==1?'ES':''}</div>
            <button className="btn btn-k" style={{ fontSize:'7.5px', padding:'8px 16px' }} onClick={() => setShowAddrForm(!showAddrForm)}>{showAddrForm ? 'CANCEL' : '+ ADD ADDRESS'}</button>
          </div>
          {showAddrForm && (
            <div style={{ border:'var(--bd)', padding:20, marginBottom:20, background:'var(--off)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label className="fl2">LABEL</label>
                  <select className="fi2" value={addrForm.label} onChange={setAF('label')}>
                    {['Home','Work','Other'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <Field label="FULL NAME *" k="name" placeholder="Rohit Sharma" />
                <Field label="PHONE *" k="phone" placeholder="9876543210" type="tel" />
                <div style={{ gridColumn:'1/-1' }}><Field label="ADDRESS LINE 1 *" k="line1" placeholder="Flat/House No., Street" /></div>
                <div style={{ gridColumn:'1/-1' }}><Field label="ADDRESS LINE 2" k="line2" placeholder="Area, Landmark (optional)" /></div>
                <Field label="CITY *" k="city" placeholder="Mumbai" />
                <Field label="STATE *" k="state" placeholder="Maharashtra" />
                <Field label="PINCODE *" k="pincode" placeholder="400001" />
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <input type="checkbox" id="def" checked={addrForm.is_default} onChange={e => setAddrForm(p => ({...p, is_default: e.target.checked}))} />
                  <label htmlFor="def" style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.08em', cursor:'pointer' }}>Set as default address</label>
                </div>
              </div>
              <button className="btn btn-k" onClick={saveAddress} disabled={addrSaving} style={{ marginTop:16, fontSize:'8px' }}>{addrSaving ? 'SAVING...' : 'SAVE ADDRESS →'}</button>
            </div>
          )}
          {addrLoading ? <div style={{ fontFamily:'var(--fm)', fontSize:'9px', color:'var(--warm)', padding:20 }}>Loading...</div> : addresses.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', fontFamily:'var(--fm)', fontSize:'9px', color:'var(--warm)' }}>No saved addresses yet.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {addresses.map(a => (
                <div key={a.id} style={{ border: a.is_default ? '1.5px solid #111' : 'var(--bd)', padding:'16px 20px', background:'#fff' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontFamily:'var(--fm)', fontSize:'8px', letterSpacing:'.15em', padding:'2px 8px', background:'#111', color:'#fff' }}>{(a.label||'Home').toUpperCase()}</span>
                      {a.is_default===1 && <span style={{ fontFamily:'var(--fm)', fontSize:'7px', color:'#16a34a', letterSpacing:'.1em' }}>✓ DEFAULT</span>}
                    </div>
                    <button onClick={() => deleteAddress(a.id)} style={{ background:'none', border:'none', fontFamily:'var(--fm)', fontSize:'8px', color:'#b85c38', cursor:'pointer' }}>REMOVE</button>
                  </div>
                  <div style={{ fontFamily:'var(--fm)', fontSize:'8.5px', lineHeight:1.8 }}>
                    <strong>{a.name}</strong> · {a.phone}<br/>
                    {a.line1}{a.line2?`, ${a.line2}`:''}<br/>
                    {a.city}, {a.state} — {a.pincode}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Returns Tab */}
      {tab === 'returns' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.1em', color:'var(--warm)' }}>{returns.length} RETURN{returns.length!==1?'S':''}</div>
            <button className="btn btn-k" style={{ fontSize:'7.5px', padding:'8px 16px' }} onClick={() => setShowRetForm(!showRetForm)}>{showRetForm ? 'CANCEL' : '+ REQUEST RETURN'}</button>
          </div>
          {showRetForm && (
            <div style={{ border:'var(--bd)', padding:20, marginBottom:20, background:'var(--off)' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <label className="fl2">SELECT ORDER *</label>
                  <select className="fi2" value={retForm.order_id} onChange={setRF('order_id')}>
                    <option value="">Choose an order...</option>
                    {orders.filter(o => o.order_status === 'delivered').map(o => (
                      <option key={o.id} value={o.id}>{o.order_number} — {fp(Number(o.total))}</option>
                    ))}
                  </select>
                  {orders.filter(o => o.order_status === 'delivered').length === 0 && (
                    <div style={{ fontFamily:'var(--fm)', fontSize:'7.5px', color:'var(--warm)', marginTop:6 }}>Only delivered orders can be returned.</div>
                  )}
                </div>
                <div>
                  <label className="fl2">REASON *</label>
                  <select className="fi2" value={retForm.reason} onChange={setRF('reason')}>
                    <option value="">Select reason...</option>
                    {['Wrong size','Damaged product','Not as described','Wrong item delivered','Changed my mind','Quality issue'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div><label className="fl2">ADDITIONAL DETAILS</label><textarea className="fi2" rows={3} value={retForm.details} onChange={setRF('details')} placeholder="Describe the issue..." style={{ resize:'vertical', fontFamily:'var(--fm)', fontSize:'9px' }} /></div>
              </div>
              <button className="btn btn-k" onClick={submitReturn} disabled={retSaving} style={{ marginTop:16, fontSize:'8px' }}>{retSaving ? 'SUBMITTING...' : 'SUBMIT RETURN →'}</button>
            </div>
          )}
          {retLoading ? <div style={{ fontFamily:'var(--fm)', fontSize:'9px', color:'var(--warm)', padding:20 }}>Loading...</div> : returns.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 0', fontFamily:'var(--fm)', fontSize:'9px', color:'var(--warm)' }}>No return requests yet.</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {returns.map(r => (
                <div key={r.id} style={{ border:'var(--bd)', padding:'16px 20px', background:'#fff' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <div style={{ fontFamily:'var(--fm)', fontSize:'9px', letterSpacing:'.1em' }}>{r.order_number}</div>
                    <span style={{ fontFamily:'var(--fm)', fontSize:'7px', letterSpacing:'.1em', padding:'2px 10px', background:(RET_STATUS[r.status]||'#111')+'22', color:RET_STATUS[r.status]||'#111' }}>{(r.status||'requested').toUpperCase()}</span>
                  </div>
                  <div style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'var(--warm)', marginBottom:4 }}>Reason: {r.reason}</div>
                  {r.details && <div style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'var(--warm)', marginBottom:4 }}>{r.details}</div>}
                  {r.admin_notes && <div style={{ fontFamily:'var(--fm)', fontSize:'8px', color:'#2563eb', marginTop:6, padding:'8px 12px', background:'#eff6ff' }}>Admin: {r.admin_notes}</div>}
                  <div style={{ fontFamily:'var(--fm)', fontSize:'7.5px', color:'var(--warm)', marginTop:6 }}>{new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
