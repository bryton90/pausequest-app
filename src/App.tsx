import React from 'react';
import AppRouter from './AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { SmartSchedulerProvider } from './contexts/SmartSchedulerContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <GamificationProvider>
          <SmartSchedulerProvider>
            <AppRouter />
          </SmartSchedulerProvider>
        </GamificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
