import React, { useState, useCallback, ReactNode } from 'react';
import { Clock, User, Zap, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import SettingsModal from './Settings/SettingsModal';

type AppView = 'timer' | 'profile' | 'ai-coach' | 'settings';

const NAV_ITEMS: { id: AppView; label: string; Icon: React.ComponentType<any> }[] = [
  { id: 'timer', label: 'Timer', Icon: Clock },
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'ai-coach', label: 'AI Coach', Icon: Zap },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('timer');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { isDarkMode } = useSettings();

  const handleNavClick = useCallback((view: AppView) => {
    if (view === 'settings') {
      setShowSettingsModal(true);
      return;
    }
    setCurrentView(view);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
        {/* Top Header Navigation Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-md sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo / App Name */}
            <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              PauseQuest
            </div>

            {/* Navigation Buttons */}
            <nav className="flex items-center space-x-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as AppView)}
                  className={`flex items-center space-x-2 p-2 rounded-full md:rounded-lg transition-all duration-200 font-medium ${
                    currentView === item.id || (item.id === 'settings' && showSettingsModal)
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-current={currentView === item.id ? 'page' : undefined}
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
        <main className="flex-1 p-4 md:p-8">
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
