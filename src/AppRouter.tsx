import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import Navigation from './components/Navigation';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';

// Lazy load components
const TimerPage = lazy(() => import('./pages/TimerPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const UserProfile = lazy(() => import('./components/UserProfile/UserProfile'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const AppRouter: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <div className={`min-h-screen flex flex-col bg-bg-color text-text-primary transition-colors duration-200 ${document.documentElement.classList.contains('dark') ? 'dark' : ''}`}>
            <Navigation />
            
            <main className="flex-1">
              <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
                <Suspense 
                  fallback={
                    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                      <div className="text-center">
                        <LoadingSpinner size="md" />
                        <p className="mt-4 text-text-secondary">Loading your content...</p>
                      </div>
                    </div>
                  }
                >
                  <div className="max-w-6xl mx-auto">
                    <Routes>
                      <Route path="/" element={<TimerPage />} />
                      <Route path="/stats" element={<StatsPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </div>
                </Suspense>
              </div>
            </main>

            <footer className="bg-bg-secondary border-t border-border-color mt-auto">
              <div className="container mx-auto px-4 py-4 sm:py-5">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-sm text-text-secondary text-center md:text-left">
                    &copy; {new Date().getFullYear()} PauseQuest. All rights reserved.
                  </p>
                  <div className="flex items-center space-x-6">
                    <a href="/privacy" className="text-sm text-text-secondary hover:text-primary transition-colors">
                      Privacy
                    </a>
                    <a href="/terms" className="text-sm text-text-secondary hover:text-primary transition-colors">
                      Terms
                    </a>
                    <a href="/contact" className="text-sm text-text-secondary hover:text-primary transition-colors">
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;
