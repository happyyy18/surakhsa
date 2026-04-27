import { useState } from 'react';
import { Shield, UserPlus, Phone, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { icon: <Shield size={36} color="white" />, title: 'Welcome to Suraksha', sub: 'Your private safety companion. No real names. No traces.' },
  { icon: <Lock size={36} color="white" />, title: 'Your Secret Identity', sub: 'We generated a private alias for you. No one can link this to your real identity.' },
  { icon: <UserPlus size={36} color="white" />, title: 'Trusted Contacts', sub: 'Add up to 5 people who will receive your SOS alert instantly.' },
];

export default function Onboarding() {
  const { alias, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [contacts, setContacts] = useState([{ name: '', phone: '', email: '' }]);

  const addContact = () => setContacts(c => [...c, { name: '', phone: '', email: '' }]);
  const updateContact = (i, field, val) => setContacts(c => c.map((ct, idx) => idx === i ? { ...ct, [field]: val } : ct));

  const finish = () => completeOnboarding(contacts.filter(c => c.name && c.phone));

  return (
    <div className="onboard-screen">
      <div className="step-dots">
        {STEPS.map((_, i) => <div key={i} className={`step-dot ${i === step ? 'active' : ''}`} />)}
      </div>

      <div className="onboard-icon">{STEPS[step].icon}</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>{STEPS[step].title}</h1>
      <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: 32 }}>{STEPS[step].sub}</p>

      {step === 1 && (
        <div className="glass" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: 1 }}>YOUR ALIAS</div>
          <div className="alias-tag">{alias}</div>
          <div className="text-muted mt-sm" style={{ fontSize: 12 }}>This replaces your name in all SOS alerts. Only you know your real identity.</div>
        </div>
      )}

      {step === 2 && (
        <div className="gap-md" style={{ flex: 1, overflowY: 'auto', marginBottom: 24 }}>
          {contacts.map((c, i) => (
            <div key={i} className="card gap-sm">
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>CONTACT {i + 1}</div>
              <input className="input" placeholder="Name" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} />
              <input className="input" placeholder="Phone (+91XXXXXXXXXX)" value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} />
              <input className="input" placeholder="Email (optional)" value={c.email} onChange={e => updateContact(i, 'email', e.target.value)} />
            </div>
          ))}
          {contacts.length < 5 && (
            <button className="btn btn-ghost btn-full" onClick={addContact}><UserPlus size={16} /> Add Contact</button>
          )}
        </div>
      )}

      <button className="btn btn-primary btn-full" style={{ marginTop: 'auto' }}
        onClick={() => step < 2 ? setStep(s => s + 1) : finish()}>
        {step < 2 ? <><span>Continue</span><ChevronRight size={18} /></> : <><span>Start Suraksha</span><Shield size={18} /></>}
      </button>
    </div>
  );
}
