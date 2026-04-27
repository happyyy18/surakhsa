import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Map, Sparkles, Users, Settings } from 'lucide-react';

const NAV = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/map', icon: Map, label: 'Map' },
  { path: '/ai', icon: Sparkles, label: 'AI' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <nav className="bottom-nav">
      {NAV.map(({ path, icon: Icon, label }) => (
        <button key={path} className={`nav-item ${pathname === path ? 'active' : ''}`}
          onClick={() => navigate(path)} id={`nav-${label.toLowerCase()}`}>
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
