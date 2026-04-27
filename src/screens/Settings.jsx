import { useState } from 'react';
import { Shield, RefreshCw, LogOut, Download, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateAlias } from '../utils/aliasGenerator';

export default function Settings() {
  const { alias, updateAlias, autoLockMin, updateAutoLock, panicWipe, unlock } = useAuth();
  const [unlockCode, setUnlockCode] = useState('1337=');
  const [showWipe, setShowWipe] = useState(false);

  const [toggles, setToggles] = useState({
    calculator: true,
    voiceDefault: false,
    autoAlert: true,
    offlineMode: false,
  });
  const tog = (k) => setToggles(t => ({ ...t, [k]: !t[k] }));

  return (
    <div className="screen">
      <div className="section-hdr"><h2>Settings</h2></div>

      <div className="pad gap-md" style={{ paddingBottom: 32 }}>
        {/* Ghost Identity */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>GHOST IDENTITY</div>
          <div className="alias-card">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>YOUR ALIAS</div>
            <div className="alias-tag">{alias}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Used in SOS alerts instead of your real name</div>
            <button className="btn btn-ghost btn-sm mt-md" onClick={() => updateAlias(generateAlias())} id="regen-alias-btn">
              <RefreshCw size={14} /> Regenerate Alias
            </button>
          </div>
        </div>

        {/* Unlock Code */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>CALCULATOR UNLOCK CODE</div>
          <div className="card gap-sm">
            <input className="input" value={unlockCode} onChange={e => setUnlockCode(e.target.value)} id="unlock-code-input" style={{ letterSpacing: 4, fontWeight: 700 }} />
            <div className="text-muted text-sm">Enter this in the calculator to unlock Suraksha</div>
          </div>
        </div>

        {/* Auto-Lock */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>AUTO-LOCK TIMEOUT</div>
          <div className="card gap-sm">
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 5, 10, 30].map(m => (
                <button key={m} className={`btn ${autoLockMin === m ? 'btn-primary' : 'btn-ghost'} flex-1 btn-sm`} onClick={() => updateAutoLock(m)} id={`lock-${m}min`}>{m}m</button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>FEATURES</div>
          <div className="card">
            {[
              { key: 'calculator', label: 'Calculator Disguise', sub: 'App opens as calculator' },
              { key: 'voiceDefault', label: 'Voice Monitoring', sub: 'Listen for "Suraksha Help" keyword' },
              { key: 'autoAlert', label: 'Auto-Alert on Trigger', sub: 'Immediately send SOS on shake/voice' },
              { key: 'offlineMode', label: 'Offline Map Cache', sub: 'Pre-download tiles for this area' },
            ].map(({ key, label, sub }) => (
              <div key={key} className="setting-row" id={`setting-${key}`}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                  <div className="text-muted text-sm">{sub}</div>
                </div>
                <button className={`toggle ${toggles[key] ? 'on' : 'off'}`} onClick={() => tog(key)} />
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <div style={{ fontSize: 12, color: 'var(--sos)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>DANGER ZONE</div>
          <div className="card" style={{ borderColor: 'rgba(230,57,70,0.3)' }}>
            {!showWipe ? (
              <button className="btn btn-danger btn-full" onClick={() => setShowWipe(true)} id="panic-wipe-btn">
                <AlertTriangle size={16} /> Panic Wipe — Delete Everything
              </button>
            ) : (
              <div className="gap-sm">
                <div style={{ color: 'var(--sos)', fontWeight: 700, textAlign: 'center' }}>⚠️ This will delete ALL data permanently</div>
                <div className="row" style={{ gap: 8 }}>
                  <button className="btn btn-danger flex-1" onClick={() => { panicWipe(); }} id="confirm-wipe-btn">Confirm Wipe</button>
                  <button className="btn btn-ghost flex-1" onClick={() => setShowWipe(false)}>Cancel</button>
                </div>
              </div>
            )}
            <div className="text-muted text-sm mt-sm center">Clears all contacts, logs, and resets to calculator mode</div>
          </div>
        </div>

        {/* Version */}
        <div className="center text-muted text-xs" style={{ paddingTop: 8 }}>
          🛡️ Suraksha V2.0 · Built with AES-256-GCM encryption<br />
          Your data never leaves your device
        </div>
      </div>
    </div>
  );
}
