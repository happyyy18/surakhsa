import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MapPin, WifiOff } from 'lucide-react';
import { useSOS } from '../context/SOSContext';
import { useAuth } from '../context/AuthContext';
import WaveformAnim from '../components/WaveformAnim';

// Build a WhatsApp URL — use %0A for newlines (WhatsApp ignores \n in encoded text)
function whatsappUrl(phone, message) {
  // Replace actual newlines AND literal \n sequences with %0A
  const encoded = encodeURIComponent(message).replace(/%5Cn/g, '%0A').replace(/\n/g, '%0A');
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    // Prepend India country code (91) if 10-digit number without country code
    const num = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${num}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}

const SHAPES = ['★', '◆', '●', '▲'];
const CANCEL_SECONDS = 5;

export default function SOSActive() {
  const navigate = useNavigate();
  const { deactivateSOS, offline, location, recording, alertsSent, trigger } = useSOS();
  const { contacts, alias } = useAuth();
  const [seconds, setSeconds] = useState(CANCEL_SECONDS);
  const [cancelShape, setCancelShape] = useState('');
  const [tapShape, setTapShape] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const [phase, setPhase] = useState('countdown'); // countdown | active

  useEffect(() => {
    const correct = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const decoy = SHAPES.filter(s => s !== correct)[Math.floor(Math.random() * 3)];
    setCancelShape(correct);
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) { clearInterval(t); setPhase('active'); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const CIRC = 2 * Math.PI * 60;

  const tryCancel = (shape) => {
    setTapShape(shape);
    if (shape === cancelShape) {
      setCancelled(true);
      deactivateSOS();
      setTimeout(() => navigate('/'), 1200);
    }
  };

  const hasLocation = location && location.lat !== null && location.lng !== null;
  // Use maps.google.com/maps?q= — renders as a tappable map card inside WhatsApp
  const mapLink = hasLocation
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}`
    : null;

  // Pre-composed SOS WhatsApp message
  const sosMessage = hasLocation
    ? `🆘 EMERGENCY ALERT from ${alias || 'a friend'}!\nI need help. My current location:\n${mapLink}\nPlease contact me or send help immediately.`
    : `🆘 EMERGENCY ALERT from ${alias || 'a friend'}!\nI need help immediately. GPS is still acquiring — please call me or alert authorities.`;

  // Open WhatsApp — use location.href to avoid popup blockers
  const shareViaWhatsApp = (phone = null) => {
    window.location.href = whatsappUrl(phone, sosMessage);
  };

  return (
    <div className="screen" style={{ background: 'radial-gradient(ellipse at top, #3D0A12 0%, var(--bg) 60%)' }}>
      <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge badge-red">🔴 SOS ACTIVE</span>
        {offline && <span className="badge badge-red"><WifiOff size={10} /> OFFLINE QUEUED</span>}
        {recording && <span className="badge badge-red"><Mic size={10} /> REC</span>}
      </div>

      {cancelled && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>SOS Cancelled</div>
        </div>
      )}

      {!cancelled && (
        <>
          {/* Countdown */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px 20px' }}>
            <div className="countdown-ring">
              <svg viewBox="0 0 140 140" width="160" height="160">
                <circle cx="70" cy="70" r="60" className="ring-bg" />
                <circle cx="70" cy="70" r="60" className="ring-fg"
                  strokeDasharray={CIRC}
                  strokeDashoffset={phase === 'countdown' ? CIRC * (1 - seconds / CANCEL_SECONDS) : 0} />
              </svg>
              <div className="countdown-number">
                {phase === 'countdown' ? (
                  <><div className="num">{seconds}</div><div className="lbl">CANCEL?</div></>
                ) : (
                  <><div className="num" style={{ fontSize: 32 }}>🆘</div><div className="lbl">SENDING</div></>
                )}
              </div>
            </div>

            {phase === 'active' && (
              <div style={{ marginTop: 16 }}>
                <WaveformAnim bars={16} />
              </div>
            )}
          </div>

          {/* Trigger info */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span className="badge badge-red">
              {trigger === 'shake' ? '📳 Shake Detected' : trigger === 'voice' ? '🎙️ Voice Triggered' : '👆 Manual SOS'}
            </span>
          </div>

          {/* Cancel Challenge */}
          {phase === 'countdown' && (
            <div className="pad" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Tap <strong style={{ color: 'white' }}>{cancelShape}</strong> to cancel</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                {SHAPES.map(s => (
                  <button key={s} onClick={() => tryCancel(s)} id={`cancel-shape-${s}`}
                    style={{ background: tapShape === s && s !== cancelShape ? 'rgba(230,57,70,0.3)' : 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, width: 56, height: 56, fontSize: 28, cursor: 'pointer', color: 'white', transition: 'all 0.15s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alert status */}
          {phase === 'active' && (
            <div className="pad gap-sm mt-md">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>ALERTS SENT TO</div>
              {alertsSent.length === 0 ? (
                <div className="card text-muted text-sm" style={{ textAlign: 'center', padding: 16 }}>
                  {offline ? '📴 SOS queued — will send when online' : 'No contacts configured'}
                </div>
              ) : alertsSent.map((a, i) => {
                // Find phone for this contact
                const contact = contacts.find(c => c.name === a.name);
                return (
                  <div key={i} className="card row" style={{ gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(6,214,160,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✓</div>
                    <div className="flex-1">
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                      <div className="text-muted">{a.status === 'sent' ? `✅ Alerted at ${a.time}` : '⏳ Sending...'}</div>
                    </div>
                    {contact?.phone && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#25D366', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 10, padding: '6px 10px', fontSize: 18, flexShrink: 0 }}
                        onClick={() => shareViaWhatsApp(contact.phone)}
                        id={`whatsapp-contact-${i}`}
                        title={`Send WhatsApp to ${a.name}`}
                      >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width={18} height={18} style={{ display: 'block' }} />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* WhatsApp broadcast button */}
              <button
                className="btn btn-full mt-sm"
                style={{
                  background: hasLocation ? 'linear-gradient(135deg,#25D366,#128C7E)' : 'rgba(37,211,102,0.15)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 14,
                  padding: '14px',
                  fontWeight: 700,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  opacity: 1,
                }}
                onClick={() => shareViaWhatsApp(null)}
                id="share-whatsapp-btn"
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width={20} height={20} />
                {hasLocation ? 'Share Location on WhatsApp' : (location?.error ? 'Share SOS on WhatsApp' : 'Share SOS on WhatsApp (GPS acquiring…)')}
              </button>

              {/* Secondary: open map */}
              {hasLocation && (
                <a href={mapLink} target="_blank" rel="noreferrer"
                  className="btn btn-ghost btn-full"
                  style={{ marginTop: 6, fontSize: 13 }}
                  id="view-map-btn"
                >
                  <MapPin size={14} /> View on Google Maps
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
