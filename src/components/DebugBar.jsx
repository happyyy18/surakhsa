import { useSOS } from '../context/SOSContext';

export default function DebugBar() {
  const { demoMode } = useSOS();
  if (!demoMode) return null;
  return (
    <div className="debug-bar">
      <span>🎬 DEMO MODE</span>
      <span><span className="debug-key">S</span> Shake</span>
      <span><span className="debug-key">V</span> Voice</span>
      <span><span className="debug-key">F</span> FakeCall</span>
      <span><span className="debug-key">D</span> Toggle</span>
    </div>
  );
}
