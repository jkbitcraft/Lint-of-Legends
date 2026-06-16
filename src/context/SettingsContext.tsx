import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  showBugCount: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  toggleBugCount: () => void;
}

const defaults: Settings = { showBugCount: false };

const SettingsContext = createContext<SettingsContextValue>({
  settings: defaults,
  toggleBugCount: () => {},
});

const STORAGE_KEY = '@crapp_settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setSettings(JSON.parse(raw));
    });
  }, []);

  function toggleBugCount() {
    setSettings((prev) => {
      const next = { ...prev, showBugCount: !prev.showBugCount };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <SettingsContext.Provider value={{ settings, toggleBugCount }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
