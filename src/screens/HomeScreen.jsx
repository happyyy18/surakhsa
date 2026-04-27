import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Mic, MicOff, MapPin, Battery } from 'lucide-react';
import { useSOS } from '../context/SOSContext';
import { useAuth } from '../context/AuthContext';
import { useShakeDetect } from '../hooks/useShakeDetect';
import { useVoiceCommand } from '../hooks/useVoiceCommand';
import FakeCallSlider from '../components/FakeCallSlider';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { activateSOS, offline, demoMode, setDemoMode } = useSOS();
  const { alias, contacts, touch } = useAuth();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [shakeFlash, setShakeFlash] = useState(false);

  const triggerSOS = useCallback((type) => {
    touch();
    activateSOS(type, contacts, alias);
    navigate('/sos');
  }, [activateSOS, contacts, alias, navigate, touch]);

  const onShake = useCallback(() => { setShakeFlash(true); setTimeout(() => setShakeFlash(false), 500); triggerSOS('shake'); }, [triggerSOS]);
  const onVoice = useCallback(() => triggerSOS('voice'), [triggerSOS]);

  useShakeDetect(onShake, true);
  const { listening } = useVoiceCommand(onVoice, voiceEnabled);

  return (
    <div className="screen" onClick={touch}>
      {/* Status Bar */}
      <div className="status-bar">
        <span className="brand">🛡️ Suraksha</span>
        <div className="status-icons">
          {offline ? <WifiOff size={14} color="var(--sos)" /> : <Wifi size={14} color="var(--accent)" />}
          <Battery size={14} color="var(--accent)" />
          <MapPin size={14} color={offline ? '#888' : 'var(--accent)'} />
          {listening && <Mic size={14} color="var(--sos)" />}
          <div className={`status-dot ${offline ? 'red' : ''}`} />
        </div>
      </div>

      {/* Alias chip */}
      <div style={{ padding: '4px 20px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="badge badge-purple" style={{ fontSize: 12 }}>🔒 {alias}</span>
        {offline && <span className="badge badge-red">📴 OFFLINE</span>}
      </div>

      {/* SOS Button */}
      <div style={{ padding: '20px 0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="sos-btn-wrap" style={{ background: shakeFlash ? 'rgba(230,57,70,0.1)' : 'transparent', borderRadius: '50%', transition: 'background 0.2s' }}>
          <div className="sos-ring" />
          <div className="sos-ring" />
          <div className="sos-ring" />
          <button className="sos-btn" id="sos-main-btn" onClick={() => triggerSOS('tap')}>
            <span className="sos-icon">🆘</span>
            <span className="sos-label">SOS</span>
            <span className="sos-sub">TAP TO ALERT</span>
          </button>
        </div>
        <p className="text-muted" style={{ fontSize: 12, textAlign: 'center' }}>
          Press S to simulate shake · V for voice · Hold Space (3s)
        </p>
      </div>

      {/* Fake Call Slider */}
      <div className="pad mb-md">
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>FAKE CALL — SLIDE TO ACTIVATE</div>
        <FakeCallSlider onActivate={() => navigate('/fakecall')} />
      </div>

      {/* Quick Actions */}
      <div className="pad gap-sm mb-md">
        <div className="row gap-sm" style={{ gap: 10 }}>
          <button className={`btn ${voiceEnabled ? 'btn-danger' : 'btn-ghost'} flex-1`} id="voice-toggle-btn"
            onClick={() => { setVoiceEnabled(v => !v); touch(); }}>
            {voiceEnabled ? <><MicOff size={16} /> Mic On</> : <><Mic size={16} /> Enable Mic</>}
          </button>
          <button className="btn btn-ghost flex-1" id="demo-mode-btn" onClick={() => { setDemoMode(d => !d); touch(); }}>
            🎬 {demoMode ? 'Exit Demo' : 'Demo Mode'}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="pad gap-sm" style={{ paddingBottom: 20 }}>
        <div className="card row" style={{ gap: 14 }}>
          <div style={{ fontSize: 28 }}>📍</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>GPS Ready</div>
            <div className="text-muted">Activates automatically when SOS is triggered</div>
          </div>
        </div>
        <div className="card row" style={{ gap: 14 }}>
          <div style={{ fontSize: 28 }}>👥</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{contacts.length} Trusted Contact{contacts.length !== 1 ? 's' : ''}</div>
            <div className="text-muted">{contacts.length > 0 ? contacts.map(c => c.name).join(', ') : 'Add contacts in Settings'}</div>
          </div>
        </div>
        <div className="card row" style={{ gap: 14 }}>
          <div style={{ fontSize: 28 }}>🔒</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>AES-256 Encrypted</div>
            <div className="text-muted">All incident logs encrypted on your device</div>
          </div>
        </div>
      </div>
    </div>
  );
}
