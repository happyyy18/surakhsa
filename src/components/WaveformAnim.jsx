export default function WaveformAnim({ bars = 14 }) {
  return (
    <div className="waveform">
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="wave-bar" style={{ animationDelay: `${(i * 0.07).toFixed(2)}s` }} />
      ))}
    </div>
  );
}
