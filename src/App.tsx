import React from 'react';
import AppRouter from './AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { GamificationProvider } from './contexts/GamificationContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <GamificationProvider>
          <AppRouter />
        </GamificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
