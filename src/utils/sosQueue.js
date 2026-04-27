const KEY = 'suraksha_sos_queue';
export const saveToQueue = (e) => { const q = getQueue(); q.push(e); localStorage.setItem(KEY, JSON.stringify(q)); };
export const getQueue = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
export const clearQueue = () => localStorage.removeItem(KEY);
