import { useState, useRef, useCallback } from 'react';
import { Phone } from 'lucide-react';

export default function FakeCallSlider({ onActivate }) {
  const [pos, setPos] = useState(0);
  const [activated, setActivated] = useState(false);
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const startX = useRef(0);

  const getMax = () => (trackRef.current?.offsetWidth || 280) - 60;

  const onStart = (clientX) => {
    if (activated) return;
    dragging.current = true;
    startX.current = clientX;
  };

  const onMove = useCallback((clientX) => {
    if (!dragging.current) return;
    const delta = clientX - startX.current;
    const max = getMax();
    setPos(Math.max(0, Math.min(delta, max)));
  }, []);

  const onEnd = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    const max = getMax();
    if (pos > max * 0.8) {
      setPos(max);
      setActivated(true);
      setTimeout(() => { onActivate?.(); setPos(0); setActivated(false); }, 300);
    } else {
      setPos(0);
    }
  }, [pos, onActivate]);

  return (
    <div ref={trackRef} className="slider-track"
      onMouseDown={e => onStart(e.clientX)}
      onMouseMove={e => onMove(e.clientX)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchStart={e => onStart(e.touches[0].clientX)}
      onTouchMove={e => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      id="fake-call-slider"
    >
      <div className="slider-fill" style={{ width: pos + 60 }} />
      <div className="slider-thumb" style={{ left: pos + 4 }}>
        <Phone size={22} color="var(--bg)" />
      </div>
      <div className="slider-label">{activated ? '✓ Calling...' : 'Slide to fake call →'}</div>
    </div>
  );
}
