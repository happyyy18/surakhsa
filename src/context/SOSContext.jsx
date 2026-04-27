import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { saveToQueue, getQueue, clearQueue } from '../utils/sosQueue';

const SOSContext = createContext(null);

export function SOSProvider({ children }) {
  const [sosActive, setSosActive] = useState(false);
  const [trigger, setTrigger] = useState(null); // 'tap'|'shake'|'voice'
  const [location, setLocation] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [queue, setQueue] = useState(getQueue());
  const [recording, setRecording] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [alertsSent, setAlertsSent] = useState([]);
  const watchRef = useRef(null);
  const recordRef = useRef(null);

  useEffect(() => {
    const onOnline = () => { setOffline(false); flushQueue(); };
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const startGPS = () => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      }),
      (err) => {
        // Only fall back to a placeholder if permission was denied and we have nothing yet
        if (err.code === err.PERMISSION_DENIED) {
          setLocation((prev) => prev ?? { lat: null, lng: null, accuracy: null, error: 'Permission denied' });
        }
        // For POSITION_UNAVAILABLE / TIMEOUT keep retrying via watchPosition — don't overwrite a good fix
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const stopGPS = () => {
    if (watchRef.current) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordRef.current = mr;
      mr.start();
      setRecording(true);
    } catch { setRecording(false); }
  };

  const stopRecording = () => {
    if (recordRef.current) { recordRef.current.stop(); recordRef.current = null; }
    setRecording(false);
  };

  const activateSOS = (triggerType = 'tap', contacts = [], alias = '') => {
    setSosActive(true);
    setTrigger(triggerType);
    setAlertsSent([]);
    startGPS();
    startRecording();
    if (offline) {
      const entry = { timestamp: new Date().toISOString(), trigger: triggerType, location, contacts, alias };
      saveToQueue(entry);
      setQueue(getQueue());
    } else {
      simulateSend(contacts);
    }
  };

  const simulateSend = (contacts) => {
    const sent = contacts.map(c => ({ name: c.name, status: 'sent', time: new Date().toLocaleTimeString() }));
    setAlertsSent(sent);
  };

  const deactivateSOS = () => {
    setSosActive(false);
    setTrigger(null);
    stopGPS();
    stopRecording();
  };

  const flushQueue = () => {
    const q = getQueue();
    if (q.length > 0) { clearQueue(); setQueue([]); }
  };

  const simulateReconnect = () => { setOffline(false); flushQueue(); };

  return (
    <SOSContext.Provider value={{
      sosActive, trigger, location, offline, setOffline,
      queue, recording, demoMode, setDemoMode, alertsSent,
      activateSOS, deactivateSOS, simulateReconnect
    }}>
      {children}
    </SOSContext.Provider>
  );
}

export const useSOS = () => useContext(SOSContext);
