import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile/UserProfile';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { FiClock, FiTrendingUp, FiAward, FiBell, FiSettings } from 'react-icons/fi';
import { ROUTES } from '../config/routes';

interface UserStats {
  totalFocusHours: number;
  totalBreaks: number;
  highestStreak: number;
  totalPoints: number;
}

const UserProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { notifications } = useSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoadingStats(true);
      try {
        // Replace with real API endpoint once backend is available
        const response = await fetch(`/api/users/${user.id}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalFocusHours: data.totalFocusHours || 0,
            totalBreaks: data.totalBreaks || 0,
            highestStreak: data.highestStreak || 0,
            totalPoints: data.totalPoints || 0,
          });
        } else {
          // Fall back to mocked values if API fails
          setStats({ totalFocusHours: 0, totalBreaks: 0, highestStreak: 0, totalPoints: 0 });
        }
      } catch (err) {
        console.error('Failed to fetch user stats', err);
        setStats({ totalFocusHours: 0, totalBreaks: 0, highestStreak: 0, totalPoints: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && initialLoad) {
      navigate(ROUTES.LOGIN, { replace: true, state: { from: '/profile' } });
    }
    setInitialLoad(false);
  }, [isAuthenticated, authLoading, initialLoad, navigate]);

  // Show loading state while checking auth status
  if (authLoading || initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If not authenticated (and not loading), don't render anything as we'll redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Account Information */}
      <section>
        <h1 className="text-3xl font-bold mb-6 text-text-primary">Account Information</h1>
        <UserProfile />
      </section>

      {/* Performance Summary */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FiTrendingUp className="mr-2" /> Performance Summary
        </h2>
        {loadingStats ? (
          <p className="text-text-secondary">Loading statistics...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 bg-bg-secondary rounded-lg shadow border border-border-color flex items-center">
              <FiClock className="text-primary text-2xl mr-4" />
              <div>
                <p className="text-lg font-medium text-text-primary">Total Focus Hours</p>
                <p className="text-2xl font-bold text-primary">{stats?.totalFocusHours ?? 0}</p>
              </div>
            </div>
            <div className="p-5 bg-bg-secondary rounded-lg shadow border border-border-color flex items-center">
              <FiBell className="text-primary text-2xl mr-4" />
              <div>
                <p className="text-lg font-medium text-text-primary">Total Breaks Taken</p>
                <p className="text-2xl font-bold text-primary">{stats?.totalBreaks ?? 0}</p>
              </div>
            </div>
            <div className="p-5 bg-bg-secondary rounded-lg shadow border border-border-color flex items-center">
              <FiTrendingUp className="text-primary text-2xl mr-4" />
              <div>
                <p className="text-lg font-medium text-text-primary">Highest Streak</p>
                <p className="text-2xl font-bold text-primary">{stats?.highestStreak ?? 0} days</p>
              </div>
            </div>
            <div className="p-5 bg-bg-secondary rounded-lg shadow border border-border-color flex items-center">
              <FiAward className="text-primary text-2xl mr-4" />
              <div>
                <p className="text-lg font-medium text-text-primary">Total Points</p>
                <p className="text-2xl font-bold text-primary">{stats?.totalPoints ?? 0}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Default Settings */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <FiSettings className="mr-2" /> Default Settings & Notifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-5 bg-bg-secondary rounded-lg border border-border-color">
            <h3 className="text-lg font-medium mb-2 text-text-primary">Notification Preferences</h3>
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1 text-sm text-text-secondary">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="font-semibold">{value ? 'On' : 'Off'}</span>
              </div>
            ))}
          </div>
          <div className="p-5 bg-bg-secondary rounded-lg border border-border-color">
            <h3 className="text-lg font-medium mb-2 text-text-primary">Session Defaults</h3>
            <p className="flex justify-between text-sm text-text-secondary py-1">
              <span>Focus Length</span>
              <span className="font-semibold">{(user?.preferences?.workDuration ?? 1500) / 60} min</span>
            </p>
            <p className="flex justify-between text-sm text-text-secondary py-1">
              <span>Break Length</span>
              <span className="font-semibold">{((user?.preferences as any)?.breakDuration ?? 300) / 60} min</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserProfilePage;
