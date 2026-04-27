import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SECRET = '1337=';
const BUTTONS = [
  ['AC', '+/-', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function CalculatorDisguise() {
  const { unlock } = useAuth();
  const [val, setVal] = useState('0');
  const [history, setHistory] = useState('');
  const [seq, setSeq] = useState('');

  const press = (btn) => {
    const next = seq + btn;
    setSeq(next);
    if (next.endsWith(SECRET)) { unlock(); return; }
    if (next.length > 8) setSeq(btn);

    if (btn === 'AC') { setVal('0'); setHistory(''); return; }
    if (btn === '=') { setHistory(val); try { const r = eval(val.replace('×','*').replace('÷','/').replace('−','-')); setVal(String(r)); } catch { setVal('Error'); } return; }
    if (['+', '−', '×', '÷', '%'].includes(btn)) { setHistory(val + ' ' + btn); setVal(btn); return; }
    if (btn === '+/-') { setVal(v => v.startsWith('-') ? v.slice(1) : '-' + v); return; }
    setVal(v => (v === '0' || ['+','−','×','÷'].includes(v)) ? btn : v + btn);
  };

  return (
    <div className="calc-screen">
      <div className="calc-display">
        <div className="calc-history">{history}</div>
        <div className="calc-value">{val}</div>
      </div>
      <div className="calc-grid">
        {BUTTONS.flat().map((b, i) => (
          <button
            key={i}
            className={`calc-btn ${['÷','×','−','+','='].includes(b) ? 'op' : ['AC','+/-','%'].includes(b) ? 'fn' : 'num'} ${b === '0' ? 'zero' : ''}`}
            style={b === '0' ? { gridColumn: 'span 2' } : {}}
            onClick={() => press(b)}
            id={`calc-btn-${b.replace(/[^a-zA-Z0-9]/g, '_')}`}
          >{b}</button>
        ))}
      </div>
    </div>
  );
}
