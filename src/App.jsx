import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SOSProvider } from './context/SOSContext';

import Onboarding from './screens/Onboarding';
import HomeScreen from './screens/HomeScreen';
import SOSActive from './screens/SOSActive';
import SafetyMap from './screens/SafetyMap';
import AIAssistant from './screens/AIAssistant';
import FakeCall from './screens/FakeCall';
import IncidentLog from './screens/IncidentLog';
import Contacts from './screens/Contacts';
import Settings from './screens/Settings';
import BottomNav from './components/BottomNav';
import DebugBar from './components/DebugBar';

function AppRoutes() {
  const { unlocked, onboarded } = useAuth();
  const location = useLocation();
  const [showFakeCall, setShowFakeCall] = useState(false);
  const isSOS = location.pathname === '/sos';


  if (!onboarded) return <Onboarding />;

  return (
    <div className="app-shell">
      {showFakeCall && <FakeCall onEnd={() => setShowFakeCall(false)} />}
      <div className="screen">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/sos" element={<SOSActive />} />
          <Route path="/map" element={<SafetyMap />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/fakecall" element={<FakeCall onEnd={() => window.history.back()} />} />
          <Route path="/logs" element={<IncidentLog />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      {!isSOS && <BottomNav />}
      <DebugBar />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SOSProvider>
          <AppRoutes />
        </SOSProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
