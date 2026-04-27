// SMS via Twilio REST API
export async function sendSMS(toNumber, message) {
  const SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const FROM = import.meta.env.VITE_TWILIO_FROM_NUMBER;

  if (!SID || !TOKEN) {
    console.log('[MOCK SMS] To:', toNumber, '\nMessage:', message);
    return { success: true, mock: true };
  }

  const body = new URLSearchParams({ To: toNumber, From: FROM, Body: message });
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + btoa(`${SID}:${TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    return res.ok ? { success: true } : { success: false };
  } catch (e) {
    console.error('SMS error:', e);
    return { success: false };
  }
}

export function buildSOSMessage(alias, location) {
  const link = location ? `https://maps.google.com/?q=${location.lat},${location.lng}` : 'Location unavailable';
  return `🆘 SURAKSHA SOS ALERT\n${alias} needs help!\nTime: ${new Date().toLocaleString()}\n📍 Location: ${link}\nPlease respond immediately or call emergency services.`;
}
