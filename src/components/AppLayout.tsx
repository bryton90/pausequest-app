import React, { useState, useCallback, ReactNode } from 'react';
import { Clock, User, Zap, Settings as SettingsIcon, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import SettingsModal from './Settings/SettingsModal';

type AppView = 'timer' | 'profile' | 'history' | 'ai-coach' | 'settings';

const NAV_ITEMS: { id: AppView; label: string; Icon: React.ComponentType<any>; path: string }[] = [
  { id: 'timer', label: 'Timer', Icon: Clock, path: '/' },
  { id: 'profile', label: 'Profile', Icon: User, path: '/profile' },
  { id: 'history', label: 'History', Icon: History, path: '/history' },
  { id: 'ai-coach', label: 'AI Coach', Icon: Zap, path: '/ai-coach' },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon, path: '/settings' },
];

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { isDarkMode } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = useCallback((view: AppView, path: string) => {
    if (view === 'settings') {
      setShowSettingsModal(true);
      return;
    }
    navigate(path);
  }, [navigate]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-bg-color relative">
        {/* Top Header Navigation Bar */}
        <header className="bg-bg-secondary backdrop-blur-md border-b border-border-color shadow-lg sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo / App Name */}
            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              PauseQuest
            </div>

            {/* Navigation Buttons */}
            <nav className="flex items-center space-x-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.path)}
                  className={`flex items-center space-x-2 p-3 rounded-xl transition-all duration-200 font-medium ${
                    (location.pathname === item.path) || (item.id === 'settings' && showSettingsModal)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'text-text-secondary hover:bg-bg-hover'
                  }`}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                  title={item.label}
                >
                  <item.Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </div>
    </div>
  );
};

export default AppLayout;
