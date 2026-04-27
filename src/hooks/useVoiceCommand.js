import { useEffect, useRef, useState } from 'react';

const KEYWORDS = ['suraksha help', 'help help', 'help me now', 'suraksha'];

export function useVoiceCommand(onTrigger, enabled = false) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  useEffect(() => {
    if (!enabled) { recogRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-IN';

    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(res => res[0].transcript).join(' ').toLowerCase();
      if (KEYWORDS.some(kw => transcript.includes(kw))) {
        onTrigger?.();
        r.stop();
        setTimeout(() => r.start(), 5000);
      }
    };
    r.onerror = () => setListening(false);
    r.onstart = () => setListening(true);
    r.onend = () => { setListening(false); if (enabled) setTimeout(() => r.start(), 1000); };

    r.start();
    recogRef.current = r;
    return () => r.stop();
  }, [enabled, onTrigger]);

  // Desktop V-key fallback
  useEffect(() => {
    const handleKey = (e) => { if ((e.key === 'v' || e.key === 'V') && enabled) onTrigger?.(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enabled, onTrigger]);

  return { listening };
}
