import { useEffect, useRef } from 'react';

const THRESHOLD = 15;
const REQUIRED = 3;
const COOLDOWN = 10000;

export function useShakeDetect(onShake, enabled = true) {
  const countRef = useRef(0);
  const coolRef = useRef(false);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleMotion = (e) => {
      if (coolRef.current) return;
      const { x = 0, y = 0, z = 0 } = e.accelerationIncludingGravity || {};
      const mag = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      if (mag > THRESHOLD && now - lastRef.current > 100) {
        lastRef.current = now;
        countRef.current++;
        if (countRef.current >= REQUIRED) {
          countRef.current = 0;
          coolRef.current = true;
          onShake?.();
          setTimeout(() => { coolRef.current = false; }, COOLDOWN);
        }
      }
    };

    // Desktop fallback: S key
    const handleKey = (e) => {
      if (e.key === 's' || e.key === 'S') { if (!coolRef.current) { coolRef.current = true; onShake?.(); setTimeout(() => { coolRef.current = false; }, COOLDOWN); } }
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('devicemotion', handleMotion); window.removeEventListener('keydown', handleKey); };
  }, [onShake, enabled]);
}
