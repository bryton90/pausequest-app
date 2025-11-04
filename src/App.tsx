import React from 'react';
import AppRouter from './AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppRouter />
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
