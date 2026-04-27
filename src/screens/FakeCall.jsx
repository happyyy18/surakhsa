import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff } from 'lucide-react';

const SCRIPTS = [
  "Hey! Where are you? I'm right outside waiting...",
  "Yeah don't worry, I'll be there in 5 minutes, just finish up...",
  "Okay yes, the car is running. See you soon. Love you, bye!",
];

const CONTACTS = ['Mom 💛', 'Dr. Sharma', 'Priya', 'Rahul Bhai'];

export default function FakeCall({ onEnd }) {
  const [answered, setAnswered] = useState(false);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [contact] = useState(CONTACTS[Math.floor(Math.random() * CONTACTS.length)]);
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef(null);
  const synthRef = useRef(null);

  // Web Audio API ringtone
  useEffect(() => {
    if (answered) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const pattern = [{ f: 440, d: 0.4 }, { f: 0, d: 0.2 }, { f: 440, d: 0.4 }, { f: 0, d: 1.5 }];
    let t = ctx.currentTime;
    const nodes = [];
    const play = () => {
      pattern.forEach(({ f, d }) => {
        if (f > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = f;
          osc.connect(gain);
          gain.connect(ctx.destination);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + d);
          osc.start(t);
          osc.stop(t + d);
          nodes.push(osc);
        }
        t += d;
      });
    };
    play();
    const interval = setInterval(() => { t = ctx.currentTime; play(); }, 2500);
    audioRef.current = { ctx, interval };
    return () => { clearInterval(interval); try { ctx.close(); } catch {} };
  }, [answered]);

  // Timer when answered
  useEffect(() => {
    if (!answered) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [answered]);

  // Script progression
  useEffect(() => {
    if (!answered) return;
    if (scriptIdx >= SCRIPTS.length) return;
    if (window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(SCRIPTS[scriptIdx]);
      utt.rate = 0.9;
      utt.pitch = 1.1;
      utt.onend = () => setTimeout(() => setScriptIdx(i => i + 1), 1500);
      window.speechSynthesis.speak(utt);
      synthRef.current = utt;
    } else {
      setTimeout(() => setScriptIdx(i => i + 1), 3000);
    }
  }, [answered, scriptIdx]);

  const answer = () => {
    if (audioRef.current) { clearInterval(audioRef.current.interval); try { audioRef.current.ctx.close(); } catch {} }
    setAnswered(true);
  };

  const decline = () => {
    if (audioRef.current) { clearInterval(audioRef.current.interval); try { audioRef.current.ctx.close(); } catch {} }
    window.speechSynthesis?.cancel();
    onEnd?.();
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;

  return (
    <div className="fake-call-screen">
      {!answered && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 20 }}>INCOMING CALL</div>}
      {answered && <div style={{ fontSize: 13, color: 'var(--accent)', letterSpacing: 1, marginBottom: 20 }}>{fmt(elapsed)}</div>}

      <div className="call-ripple">
        <div className="call-avatar" style={{ width: 110, height: 110, fontSize: 44 }}>
          {contact.split(' ')[0][0]}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{contact}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 6 }}>
          {answered ? 'Connected' : 'Mobile · Suraksha Contacts'}
        </div>
      </div>

      {answered && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
              "{SCRIPTS[Math.min(scriptIdx, SCRIPTS.length - 1)]}"
            </div>
          </div>
        </div>
      )}

      <div className="call-actions">
        {!answered ? (
          <>
            <button className="call-action-btn" onClick={decline} id="call-decline-btn">
              <div className="icon-circle" style={{ background: '#E63946' }}><PhoneOff size={28} color="white" /></div>
              Decline
            </button>
            <button className="call-action-btn" onClick={answer} id="call-answer-btn">
              <div className="icon-circle" style={{ background: '#06D6A0' }}><Phone size={28} color="white" /></div>
              Answer
            </button>
          </>
        ) : (
          <button className="call-action-btn" onClick={decline} id="call-end-btn">
            <div className="icon-circle" style={{ background: '#E63946' }}><PhoneOff size={28} color="white" /></div>
            End Call
          </button>
        )}
      </div>
    </div>
  );
}
