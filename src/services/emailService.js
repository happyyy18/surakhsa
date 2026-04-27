// Email via SendGrid API
export async function sendEmail(toEmail, alias, location) {
  const KEY = import.meta.env.VITE_SENDGRID_API_KEY;
  const FROM = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'alerts@suraksha.app';
  const link = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : 'Location unavailable';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#E63946;padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">🆘 SURAKSHA SOS ALERT</h1>
      </div>
      <div style="background:#1a1a2e;color:#F8F7FF;padding:24px;border-radius:0 0 12px 12px">
        <p style="font-size:18px"><strong>${alias}</strong> has activated an SOS alert!</p>
        <p style="color:#aaa">Time: ${new Date().toLocaleString()}</p>
        <a href="${link}" style="display:inline-block;background:#E63946;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;font-weight:bold">📍 View Live Location</a>
        <p style="color:#aaa;font-size:13px">Please respond immediately. If unreachable, call emergency services (100 in India).</p>
      </div>
    </div>`;

  if (!KEY) { console.log('[MOCK EMAIL] To:', toEmail, '\nAlias:', alias); return { success: true, mock: true }; }

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalizations: [{ to: [{ email: toEmail }], subject: `🆘 URGENT: Suraksha SOS — ${alias}` }], from: { email: FROM }, content: [{ type: 'text/html', value: html }] })
    });
    return res.ok ? { success: true } : { success: false };
  } catch { return { success: false }; }
}
