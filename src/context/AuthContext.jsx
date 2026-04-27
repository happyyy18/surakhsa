import { createContext, useContext, useState, useEffect } from 'react';
import { generateAlias } from '../utils/aliasGenerator';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [unlocked, setUnlocked] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [alias, setAlias] = useState('');
  const [contacts, setContacts] = useState([]);
  const [autoLockMin, setAutoLockMin] = useState(5);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const stored = localStorage.getItem('suraksha_auth');
    if (stored) {
      const data = JSON.parse(stored);
      setOnboarded(data.onboarded || false);
      setAlias(data.alias || generateAlias());
      setContacts(data.contacts || []);
      setAutoLockMin(data.autoLockMin || 5);
    } else {
      setAlias(generateAlias());
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const timer = setInterval(() => {
      if (Date.now() - lastActivity > autoLockMin * 60 * 1000) {
        setUnlocked(false);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [unlocked, lastActivity, autoLockMin]);

  const touch = () => setLastActivity(Date.now());

  const persist = (updates) => {
    const data = { onboarded, alias, contacts, autoLockMin, ...updates };
    localStorage.setItem('suraksha_auth', JSON.stringify(data));
  };

  const unlock = () => { setUnlocked(true); touch(); };

  const completeOnboarding = (contactList) => {
    const newContacts = contactList;
    setContacts(newContacts);
    setOnboarded(true);
    persist({ onboarded: true, alias, contacts: newContacts });
  };

  const updateContacts = (c) => { setContacts(c); persist({ contacts: c }); };
  const updateAlias = (a) => { setAlias(a); persist({ alias: a }); };
  const updateAutoLock = (m) => { setAutoLockMin(m); persist({ autoLockMin: m }); };

  const panicWipe = () => {
    localStorage.clear();
    setUnlocked(false);
    setOnboarded(false);
    setAlias(generateAlias());
    setContacts([]);
  };

  return (
    <AuthContext.Provider value={{
      unlocked, unlock, onboarded, alias, contacts,
      completeOnboarding, updateContacts, updateAlias,
      autoLockMin, updateAutoLock, panicWipe, touch
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
