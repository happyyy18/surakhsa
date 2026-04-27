import { useEffect, useRef, useState } from 'react';
import { useSOS } from '../context/SOSContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const POINTS = [
  { lat: 28.6139, lng: 77.2090, label: '🚔 Connaught Place Police', type: 'police' },
  { lat: 28.6220, lng: 77.2100, label: '🏥 Ram Manohar Lohia Hospital', type: 'hospital' },
  { lat: 28.6080, lng: 77.2200, label: '🚔 India Gate Police', type: 'police' },
  { lat: 28.6160, lng: 77.2010, label: '🟢 Safe Zone: Metro Station', type: 'safe' },
  { lat: 28.6250, lng: 77.2150, label: '🏥 AIIMS Emergency', type: 'hospital' },
];

const ROUTES = [
  { name: 'Via Connaught Place', score: 9, distance: '1.2 km', time: '15 min', type: 'safe', desc: '3 police stations, well-lit, populated' },
  { name: 'Via Rajpath', score: 6, distance: '0.9 km', time: '11 min', type: 'caution', desc: 'Less populated after 10 PM' },
  { name: 'Via Ring Road', score: 3, distance: '0.7 km', time: '8 min', type: 'danger', desc: 'Isolated stretch, avoid at night' },
];

export default function SafetyMap() {
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const { location, offline } = useSOS();
  const [activeRoute, setActiveRoute] = useState(0);

  useEffect(() => {
    if (mapObjRef.current) return;
    const center = location ? [location.lat, location.lng] : [28.6139, 77.2090];
    const map = L.map(mapRef.current, { zoomControl: false }).setView(center, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(map);

    // User marker
    L.circle(center, { color: '#E63946', fillColor: '#E63946', fillOpacity: 0.8, radius: 50, weight: 3 }).addTo(map)
      .bindPopup('<b>📍 Your Location</b>').openPopup();

    // POI markers
    POINTS.forEach(p => {
      const color = p.type === 'police' ? '#4A90E2' : p.type === 'hospital' ? '#06D6A0' : '#7B2FBE';
      L.circleMarker([p.lat, p.lng], { color, fillColor: color, fillOpacity: 0.9, radius: 10, weight: 2 })
        .addTo(map).bindPopup(`<b>${p.label}</b>`);
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapObjRef.current = map;
  }, []);

  useEffect(() => {
    if (!location || !mapObjRef.current) return;
    mapObjRef.current.setView([location.lat, location.lng], 14);
  }, [location]);

  return (
    <div className="screen" style={{ paddingBottom: 0 }}>
      <div className="section-hdr">
        <h2>Safety Map</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {offline && <span className="badge badge-red">📴 Offline</span>}
          <span className="badge badge-green">🔴 Police 🏥 Hospital 🟢 Safe</span>
        </div>
      </div>

      <div ref={mapRef} style={{ height: '38vh', width: '100%' }} />

      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>SAFE ROUTE SUGGESTIONS</div>
        <div className="gap-sm">
          {ROUTES.map((r, i) => (
            <div key={i} className={`card route-card row`} style={{ gap: 14, cursor: 'pointer', border: activeRoute === i ? `1px solid ${r.type === 'safe' ? 'var(--accent)' : r.type === 'caution' ? '#FF9F0A' : 'var(--sos)'}` : '1px solid var(--border)' }}
              onClick={() => setActiveRoute(i)} id={`route-${i}`}>
              <div className={`route-score ${r.type}`}>{r.score}</div>
              <div className="flex-1">
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                <div className="text-muted" style={{ fontSize: 12 }}>{r.distance} · {r.time} · {r.desc}</div>
              </div>
              <div className={`badge badge-${r.type === 'safe' ? 'green' : r.type === 'caution' ? 'purple' : 'red'}`} style={{ alignSelf: 'flex-start' }}>
                {r.type === 'safe' ? 'SAFE' : r.type === 'caution' ? 'CAUTION' : 'AVOID'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
