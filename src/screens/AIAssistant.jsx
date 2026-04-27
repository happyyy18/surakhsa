import { useState, useRef } from 'react';
import { Send, Sparkles, Loader } from 'lucide-react';
import { getAICards } from '../utils/geminiClient';

const QUICK = [
  { label: "I'm being followed", q: "Someone has been following me for 10 minutes" },
  { label: "Unsafe area", q: "I'm in a dark isolated area and feel unsafe" },
  { label: "Need to escape", q: "I need to leave a situation discreetly" },
  { label: "Emergency help", q: "I'm in an emergency and need immediate help" },
];

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  const ask = async (text) => {
    const q = text || prompt;
    if (!q.trim()) return;
    setLoading(true);
    setPrompt('');
    setHistory(h => [...h, { role: 'user', text: q }]);
    const result = await getAICards(q);
    setCards(result);
    setHistory(h => [...h, { role: 'ai', cards: result }]);
    setLoading(false);
  };

  const colorMap = { a: 'ai-card-a', b: 'ai-card-b', c: 'ai-card-c' };

  return (
    <div className="screen">
      <div className="section-hdr">
        <h2>AI Assistant</h2>
        <span className="badge badge-purple"><Sparkles size={10} /> Gemini</span>
      </div>

      <div className="pad gap-sm mb-md">
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>QUICK SCENARIOS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK.map((q, i) => (
            <button key={i} className="btn btn-ghost btn-sm" id={`quick-${i}`} onClick={() => ask(q.q)}>{q.label}</button>
          ))}
        </div>
      </div>

      {/* Chat history */}
      <div className="pad gap-md" style={{ minHeight: 200 }}>
        {history.map((h, i) => h.role === 'user' ? (
          <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ background: 'var(--surface2)', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', maxWidth: '80%', fontSize: 14 }}>{h.text}</div>
          </div>
        ) : (
          <div key={i} className="gap-sm">
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>🤖 Suraksha AI — Action Plan</div>
            {h.cards?.map((c, j) => (
              <div key={j} className={`ai-card ${colorMap[c.type] || 'ai-card-a'}`} id={`ai-card-${i}-${j}`}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{c.icon}</div>
                  <div className="flex-1">
                    <div className="card-title">{c.title}</div>
                    <div className="card-desc">{c.desc}</div>
                    {c.action && <button className="btn btn-ghost btn-sm mt-sm" style={{ fontSize: 12, padding: '6px 12px' }}>{c.action} →</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 14 }}>Generating safety plan...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="pad" style={{ position: 'sticky', bottom: 80, paddingBottom: 16 }}>
        <div className="row" style={{ gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '8px 8px 8px 16px' }}>
          <input ref={inputRef} className="input" style={{ background: 'transparent', border: 'none', padding: '6px 0', flex: 1 }}
            placeholder="Describe your situation..." value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask()} id="ai-input" />
          <button className="btn btn-primary" style={{ padding: '10px 16px', borderRadius: 12 }} onClick={() => ask()} disabled={loading} id="ai-send-btn">
            <Send size={16} />
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
