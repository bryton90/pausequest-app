import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import AppLayout from './components/AppLayout';
import { TimerProvider } from './contexts/TimerContext';

// Lazy load components with error boundary
const lazyWithRetry = (componentImport: any) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error('Error loading component:', error);
      // Retry once after a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return componentImport();
    }
  });

// Lazy load components with retry
const MainPage = lazyWithRetry(() => import('./pages/MainPage'));
const StatsPage = lazyWithRetry(() => import('./pages/StatsPage'));
const HistoryPage = lazyWithRetry(() => import('./pages/HistoryPage'));
const SettingsPage = lazyWithRetry(() => import('./pages/SettingsPage'));
const UserProfilePage = lazyWithRetry(() => import('./pages/UserProfilePage'));
const AICoachPage = lazyWithRetry(() => import('./pages/AICoachPage'));
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'));

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
    <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-6">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

// Loading spinner component
const PageLoading = () => (
  <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
    <div className="text-center">
      <LoadingSpinner size="md" />
      <p className="mt-4 text-text-secondary">Loading your content...</p>
    </div>
  </div>
);

// Wrapper component for routes with animation
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoading />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<MainPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/ai-coach" element={<AICoachPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <TimerProvider>
        <AppLayout>
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            <AnimatedRoutes />
          </div>
        </AppLayout>
        
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
      </TimerProvider>
    </Router>
  );
};

export default AppRouter;
