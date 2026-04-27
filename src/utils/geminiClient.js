const KEY = import.meta.env.VITE_GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`;

const OFFLINE = {
  followed:  [{ type:'a', icon:'🏪', title:'Enter public space', desc:'Go to the nearest store, café, or petrol station. Stay near the counter.', action:'Fake Call' },
              { type:'b', icon:'📞', title:'Call a contact', desc:'Tell them exactly where you are and to call back immediately.', action:'Open Contacts' },
              { type:'c', icon:'🚔', title:'Note attacker details', desc:'Clothing, height, direction of travel — for your incident report.', action:'Record Note' }],
  unsafe:    [{ type:'a', icon:'💡', title:'Move to a lit area', desc:'Street lights and crowds deter attackers. Head toward busy roads.', action:'Open Map' },
              { type:'b', icon:'🆘', title:'Activate SOS', desc:'Send your location to all trusted contacts immediately.', action:'SOS' },
              { type:'c', icon:'🏃', title:'Keep moving', desc:'Do not stop or appear lost. Walk with purpose.', action:'Safe Route' }],
  emergency: [{ type:'a', icon:'🚨', title:'Call police now', desc:'Dial 100 (India) or your local emergency number immediately.', action:'Call 100' },
              { type:'b', icon:'🆘', title:'Activate SOS', desc:'Your contacts and location are being shared right now.', action:'SOS' },
              { type:'c', icon:'📢', title:'Create a scene', desc:'Shout "FIRE!" — people respond faster than "Help!".', action:'Record' }],
  default:   [{ type:'a', icon:'🏪', title:'Enter public space', desc:'Find the nearest shop or crowded area immediately.', action:'Fake Call' },
              { type:'b', icon:'📞', title:'Alert your contacts', desc:'Call or message your most trusted contact right now.', action:'Open Contacts' },
              { type:'c', icon:'🗺️', title:'Find safe route', desc:'Use the Safety Map to navigate to a police station or safe zone.', action:'Open Map' }]
};

function matchKeyword(text) {
  const t = text.toLowerCase();
  if (t.includes('follow') || t.includes('stalk')) return OFFLINE.followed;
  if (t.includes('unsafe') || t.includes('dark') || t.includes('alone')) return OFFLINE.unsafe;
  if (t.includes('attack') || t.includes('hurt') || t.includes('emergency')) return OFFLINE.emergency;
  return OFFLINE.default;
}

export async function getAICards(prompt) {
  if (!KEY) return matchKeyword(prompt);
  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a women's safety advisor. User situation: "${prompt}". Respond with exactly 3 JSON action cards. Format: [{"type":"a","icon":"emoji","title":"short title","desc":"2 sentences","action":"button label"},{"type":"b",...},{"type":"c",...}]. Be direct and practical.` }] }]
      })
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return matchKeyword(prompt);
  } catch { return matchKeyword(prompt); }
}
