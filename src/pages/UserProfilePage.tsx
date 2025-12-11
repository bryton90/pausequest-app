import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  FiClock, 
  FiTrendingUp, 
  FiAward, 
  FiBell, 
  FiSun, 
  FiMoon, 
  FiMonitor,
  FiUser,
  FiMail,
  FiInfo,
  FiEdit2,
  FiSave,
  FiX
} from 'react-icons/fi';
import { ROUTES } from '../config/routes';
import { getUserLifetimeStats } from '../lib/services/sessionService';

interface UserStats {
  totalFocusHours: number;
  highestStreak: number;
  totalPoints: number;
}

const UserProfilePage: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    loading: authLoading, 
    updateProfile 
  } = useAuth();
  
  const { 
    theme, 
    setTheme, 
    notifications
  } = useSettings();
  
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [sessionSettings, setSessionSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
  });

  const fetchUserStats = useCallback(async () => {
    if (!user?.id) return;
    setLoadingStats(true);
    try {
      const stats = await getUserLifetimeStats(user.id);
      setStats({
        totalFocusHours: stats.totalFocusHours || 0,
        highestStreak: stats.highestStreak || 0,
        totalPoints: stats.totalPoints || 0,
      });
    } catch (error) {
      console.error('Failed to fetch user stats', error);
      // Fallback to default values
      setStats({ 
        totalFocusHours: 0, 
        highestStreak: 0, 
        totalPoints: 0 
      });
    } finally {
      setLoadingStats(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
      
      // Load user preferences if available
      if (user.preferences) {
        setSessionSettings({
          workDuration: (user.preferences.workDuration || 1500) / 60, // Convert seconds to minutes
          breakDuration: ((user.preferences as any)?.breakDuration || 300) / 60,
        });
      }
      
      // Set form data from user profile
      setFormData({
        name: user.displayName || '',
        email: user.email || '',
      });
    }
  }, [user, fetchUserStats]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && initialLoad) {
      navigate(ROUTES.LOGIN, { replace: true, state: { from: '/profile' } });
    }
    setInitialLoad(false);
  }, [isAuthenticated, authLoading, initialLoad, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSessionSettingChange = (field: 'workDuration' | 'breakDuration', value: number) => {
    setSessionSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Here you would typically save this to the backend
    // updateProfile({
    //   preferences: {
    //     workDuration: field === 'workDuration' ? value * 60 : sessionSettings.workDuration * 60,
    //     breakDuration: field === 'breakDuration' ? value * 60 : sessionSettings.breakDuration * 60,
    //   },
    // });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName: formData.name,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

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
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Account Information */}
      <section className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border-color">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Account Settings</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary bg-opacity-10 text-primary rounded-lg hover:bg-opacity-20 transition-colors flex items-center"
            >
              <FiEdit2 className="mr-2" /> Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
              >
                <FiSave className="mr-2" /> Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-border-color rounded-lg hover:bg-bg-hover transition-colors flex items-center"
              >
                <FiX className="mr-2" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-bg-hover flex items-center justify-center mb-4 overflow-hidden">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="w-16 h-16 text-text-secondary" />
              )}
            </div>
            {isEditing && (
              <button className="text-sm text-primary hover:underline">
                Change Photo
              </button>
            )}
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center">
                <FiUser className="mr-2" /> Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-border-color rounded-lg bg-bg-color text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                />
              ) : (
                <p className="p-2 text-text-primary">{user.displayName || 'Not set'}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center">
                <FiMail className="mr-2" /> Email
              </label>
              <p className="p-2 text-text-primary">{user.email}</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center">
                <FiInfo className="mr-2" /> Member Since
              </label>
              <p className="p-2 text-text-secondary">
                {new Date(user.metadata?.creationTime || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Dashboard */}
      <section className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border-color">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Performance Dashboard</h2>
        
        {loadingStats ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-bg-color p-5 rounded-lg border border-border-color">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                  <FiClock className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-text-secondary">Total Focus Hours</h3>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {stats?.totalFocusHours.toFixed(1) || '0.0'}
              </p>
            </div>
            
            <div className="bg-bg-color p-5 rounded-lg border border-border-color">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                  <FiTrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-text-secondary">Highest Streak</h3>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {stats?.highestStreak || '0'} <span className="text-sm font-normal">days</span>
              </p>
            </div>
            
            <div className="bg-bg-color p-5 rounded-lg border border-border-color">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
                  <FiAward className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-text-secondary">Total Points</h3>
              </div>
              <p className="text-3xl font-bold text-text-primary">
                {stats?.totalPoints || '0'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Theme & Display Settings */}
      <section className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border-color">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Theme & Display</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-text-primary mb-3">Color Theme</h3>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'light', label: 'Light', icon: <FiSun className="w-4 h-4" /> },
                { value: 'dark', label: 'Dark', icon: <FiMoon className="w-4 h-4" /> },
                { value: 'system', label: 'System', icon: <FiMonitor className="w-4 h-4" /> },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value as any)}
                  className={`flex items-center px-4 py-2 rounded-lg border ${
                    theme === option.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-color border-border-color hover:bg-bg-hover'
                  } transition-colors`}
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border-color">
            <h3 className="text-lg font-medium text-text-primary mb-3">Session Defaults</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={sessionSettings.workDuration}
                  onChange={(e) => handleSessionSettingChange('workDuration', parseInt(e.target.value) || 25)}
                  className="w-full p-2 border border-border-color rounded-lg bg-bg-color text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={sessionSettings.breakDuration}
                  onChange={(e) => handleSessionSettingChange('breakDuration', parseInt(e.target.value) || 5)}
                  className="w-full p-2 border border-border-color rounded-lg bg-bg-color text-text-primary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Notification Settings */}
      <section className="bg-bg-secondary rounded-xl p-6 shadow-sm border border-border-color">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Notification Preferences</h2>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-bg-color rounded-lg border border-border-color">
              <div>
                <h3 className="font-medium text-text-primary capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-sm text-text-secondary">
                  {key === 'breakReminders' && 'Get notified when it\'s time to take a break'}
                  {key === 'sessionComplete' && 'Receive a notification when a focus session is complete'}
                  {key === 'dailySummary' && 'Get a daily summary of your productivity'}
                  {key === 'weeklyReport' && 'Receive a weekly report every Monday'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={() => {}}
                  className="sr-only peer"
                  disabled // Disabled for now as we don't have the update function in context
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};


export default UserProfilePage;
