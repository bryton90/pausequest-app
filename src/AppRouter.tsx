import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import Navigation from './components/Navigation';

// Lazy load components
const TimerPage = lazy(() => import('./pages/TimerPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const AppRouter: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Suspense 
            fallback={
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<TimerPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        
        <footer className="bg-white mt-12 border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PauseQuest. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default AppRouter;
