import { useState } from 'react';
import { UserPlus, Trash2, Phone, Mail, Edit3, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Contacts() {
  const { contacts, updateContacts } = useAuth();
  const [local, setLocal] = useState(contacts);
  const [adding, setAdding] = useState(false);
  const [newC, setNewC] = useState({ name: '', phone: '', email: '' });
  const [saved, setSaved] = useState(false);

  const add = () => {
    if (!newC.name || !newC.phone) return;
    const updated = [...local, { ...newC }];
    setLocal(updated);
    setNewC({ name: '', phone: '', email: '' });
    setAdding(false);
  };

  const remove = (i) => setLocal(l => l.filter((_, idx) => idx !== i));

  const save = () => { updateContacts(local); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="screen">
      <div className="section-hdr">
        <h2>Trusted Contacts</h2>
        <span className="badge badge-green">{local.length}/5</span>
      </div>

      <div className="pad gap-md" style={{ paddingBottom: 20 }}>
        <div className="card" style={{ background: 'rgba(230,57,70,0.06)', borderColor: 'rgba(230,57,70,0.2)', padding: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            🆘 These contacts will receive your SOS alerts via SMS and Email when you activate an emergency.
          </div>
        </div>

        {local.map((c, i) => (
          <div key={i} className="card row" style={{ gap: 14, alignItems: 'flex-start' }} id={`contact-${i}`}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent2),#5A1FA0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {c.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
              <div className="row gap-sm text-muted mt-sm">
                <Phone size={12} /><span style={{ fontSize: 12 }}>{c.phone}</span>
              </div>
              {c.email && <div className="row gap-sm text-muted" style={{ marginTop: 2 }}>
                <Mail size={12} /><span style={{ fontSize: 12 }}>{c.email}</span>
              </div>}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => remove(i)} style={{ color: 'var(--sos)', padding: '6px' }} id={`remove-contact-${i}`}><Trash2 size={16} /></button>
          </div>
        ))}

        {adding && (
          <div className="card gap-sm">
            <div style={{ fontWeight: 700, marginBottom: 4 }}>New Contact</div>
            <input className="input" placeholder="Name*" value={newC.name} onChange={e => setNewC(c => ({ ...c, name: e.target.value }))} id="new-contact-name" />
            <input className="input" placeholder="Phone*" value={newC.phone} onChange={e => setNewC(c => ({ ...c, phone: e.target.value }))} id="new-contact-phone" />
            <input className="input" placeholder="Email (optional)" value={newC.email} onChange={e => setNewC(c => ({ ...c, email: e.target.value }))} id="new-contact-email" />
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-primary flex-1" onClick={add} id="add-contact-confirm">Add</button>
              <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
            </div>
          </div>
        )}

        {local.length < 5 && !adding && (
          <button className="btn btn-ghost btn-full" onClick={() => setAdding(true)} id="add-contact-btn"><UserPlus size={16} /> Add Contact</button>
        )}

        <button className="btn btn-primary btn-full" onClick={save} id="save-contacts-btn">
          {saved ? <><Check size={16} /> Saved!</> : 'Save Contacts'}
        </button>
      </div>
    </div>
  );
}
