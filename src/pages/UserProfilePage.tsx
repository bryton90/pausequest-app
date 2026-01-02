import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Clock, 
  TrendingUp, 
  Award, 
  User, 
  Mail, 
  Calendar, 
  Edit2, 
  Save, 
  X,
  Target,
  Zap,
  Star,
  Activity,
  Camera
} from 'lucide-react';

interface UserStats {
  totalFocusHours: number;
  highestStreak: number;
  totalPoints: number;
  sessionsCompleted: number;
  averageSessionLength: number;
  currentStreak: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const UserProfilePage: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    loading: authLoading, 
    updateProfile 
  } = useAuth();
  
  const { isDarkMode } = useSettings();
  
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [memberSinceDate, setMemberSinceDate] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockStats: UserStats = {
    totalFocusHours: 47.5,
    highestStreak: 12,
    totalPoints: 2850,
    sessionsCompleted: 114,
    averageSessionLength: 25,
    currentStreak: 5
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Focus Master',
      description: 'Complete 100 focus sessions',
      icon: <Target className="w-5 h-5" />,
      unlocked: true,
      progress: 114,
      maxProgress: 100
    },
    {
      id: '2',
      title: 'Streak Champion',
      description: 'Maintain a 7-day streak',
      icon: <Zap className="w-5 h-5" />,
      unlocked: true,
      progress: 5,
      maxProgress: 7
    },
    {
      id: '3',
      title: 'Time Warrior',
      description: 'Accumulate 50 focus hours',
      icon: <Clock className="w-5 h-5" />,
      unlocked: false,
      progress: 47.5,
      maxProgress: 50
    },
    {
      id: '4',
      title: 'Point Collector',
      description: 'Earn 5000 points',
      icon: <Star className="w-5 h-5" />,
      unlocked: false,
      progress: 2850,
      maxProgress: 5000
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Simulate loading stats
    setTimeout(() => {
      setStats(mockStats);
      setLoadingStats(false);
    }, 1000);

    // Set initial form data
    if (user) {
      setFormData({
        name: user.displayName || '',
        email: user.email || '',
        bio: 'Passionate about productivity and personal growth.'
      });
      setMemberSinceDate(new Date(user?.metadata?.creationTime || Date.now()));
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    console.log('=== memberSinceDate EFFECT TRIGGERED ===');
    console.log('New memberSinceDate:', memberSinceDate);
    console.log('Formatted date:', memberSinceDate.toLocaleDateString());
    console.log('Date object type:', typeof memberSinceDate);
    console.log('Is valid date:', !isNaN(memberSinceDate.getTime()));
  }, [memberSinceDate]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      try {
        // Here you would typically call an API to update the user's profile
        // updateProfile({ 
        //   name: formData.name,
        //   email: formData.email,
        //   bio: formData.bio
        // });
        console.log('Profile saved:', formData);
      } catch (error) {
        console.error('Error saving profile:', error);
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleMemberSinceChange = (newDate: string) => {
    console.log('=== HANDLE MEMBER SINCE CHANGE ===');
    console.log('Input newDate:', newDate);
    
    try {
      const parsedDate = new Date(newDate);
      console.log('Parsed date object:', parsedDate);
      console.log('Is valid date:', !isNaN(parsedDate.getTime()));
      
      if (isNaN(parsedDate.getTime())) {
        console.log('Invalid date - showing alert');
        alert('Invalid date. Please enter a valid date in YYYY-MM-DD format.');
        return;
      }
      
      const today = new Date();
      console.log('Today:', today);
      console.log('Is future date:', parsedDate > today);
      
      if (parsedDate > today) {
        console.log('Future date - showing alert');
        alert('Member since date cannot be in the future.');
        return;
      }
      
      console.log('About to setMemberSinceDate with:', parsedDate);
      console.log('Current memberSinceDate before update:', memberSinceDate);
      setMemberSinceDate(parsedDate);
      console.log('setMemberSinceDate called');
    } catch (error) {
      console.error('Error in handleMemberSinceChange:', error);
      alert('Error updating date. Please try again.');
    }
  };

  const getActivityLevel = () => {
    if (!stats) return { level: 'Beginner', color: 'from-gray-500 to-gray-600', percentage: 0 };
    
    const points = stats.totalPoints;
    if (points < 1000) return { level: 'Beginner', color: 'from-gray-500 to-gray-600', percentage: (points / 1000) * 100 };
    if (points < 3000) return { level: 'Intermediate', color: 'from-blue-500 to-cyan-500', percentage: ((points - 1000) / 2000) * 100 };
    if (points < 5000) return { level: 'Advanced', color: 'from-purple-500 to-pink-500', percentage: ((points - 3000) / 2000) * 100 };
    return { level: 'Expert', color: 'from-yellow-500 to-orange-500', percentage: 100 };
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br p-6 flex items-center justify-center ${
        isDarkMode 
          ? 'from-gray-900 via-gray-800 to-gray-900' 
          : 'from-indigo-50 via-white to-purple-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activityLevel = getActivityLevel();

  return (
    <div className={`min-h-screen bg-gradient-to-br p-6 ${
      isDarkMode 
        ? 'from-gray-900 via-gray-800 to-gray-900' 
        : 'from-indigo-50 via-white to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl text-white">
              <User className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            User Profile
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage your account and track your progress</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border p-8 ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Profile Information</h2>
                <button
                  onClick={handleEditToggle}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isEditing 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                  }`}
                >
                  {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Avatar */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                    {previewImage || user?.photoURL ? (
                      <img src={previewImage || user?.photoURL} alt={formData.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                      <button 
                        onClick={handlePhotoUpload}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1"
                      >
                        <Camera className="w-4 h-4" />
                        Change Photo
                      </button>
                    </>
                  )}
                </div>
                
                {/* User Info */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-bg-color text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                    ) : (
                      <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{formData.name || 'Not set'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-bg-color text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                    ) : (
                      <p className={isDarkMode ? 'text-gray-100' : 'text-gray-800'}>{formData.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-bg-color text-text-primary focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                      />
                    ) : (
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{formData.bio}</p>
                    )}
                  </div>
                  
                  <div className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Member since {memberSinceDate.toLocaleDateString()}</span>
                    {isEditing && (
                      <>
                        <button
                          onClick={() => {
                            console.log('=== EDIT BUTTON CLICKED ===');
                            console.log('Current memberSinceDate:', memberSinceDate);
                            
                            const currentDateStr = memberSinceDate.toISOString().split('T')[0];
                            console.log('Current date string for prompt:', currentDateStr);
                            
                            const newDate = prompt('Enter join date (YYYY-MM-DD):', currentDateStr);
                            console.log('User entered date:', newDate);
                            
                            // Always try to process the date if user entered anything
                            if (newDate && newDate.trim() !== '') {
                              console.log('Processing date input...');
                              handleMemberSinceChange(newDate.trim());
                            } else if (newDate === null) {
                              console.log('User cancelled the prompt');
                            } else {
                              console.log('User entered empty string');
                            }
                          }}
                          className={`ml-3 text-sm px-2 py-1 rounded transition-colors ${
                            isDarkMode 
                              ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20' 
                              : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            console.log('=== TEST BUTTON CLICKED ===');
                            console.log('Setting date to 2023-01-01 directly');
                            const testDate = new Date('2023-01-01');
                            console.log('Test date object:', testDate);
                            setMemberSinceDate(testDate);
                            console.log('setMemberSinceDate called with test date');
                          }}
                          className={`ml-2 text-sm px-2 py-1 rounded transition-colors bg-green-500 text-white`}
                        >
                          Test (2023)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Level */}
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border p-8 ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Activity Level</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Level</span>
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${activityLevel.color}`}>
                    {activityLevel.level}
                  </span>
                </div>
                <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${activityLevel.color} transition-all duration-500`}
                    style={{ width: `${activityLevel.percentage}%` }}
                  ></div>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stats?.totalPoints || 0} points • Next level at {activityLevel.level === 'Expert' ? '∞' : activityLevel.level === 'Advanced' ? '5000' : activityLevel.level === 'Intermediate' ? '3000' : '1000'} points
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border p-6 ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                Performance Stats
              </h3>
              
              {loadingStats ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-600 mr-3" />
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Focus Hours</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{stats?.totalFocusHours.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Current Streak</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">{stats?.currentStreak} days</span>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-purple-900/30 border-purple-800' : 'bg-purple-50 border-purple-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-purple-600 mr-3" />
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Points</span>
                      </div>
                      <span className="text-xl font-bold text-purple-600">{stats?.totalPoints}</span>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-orange-900/30 border-orange-800' : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Target className="w-5 h-5 text-orange-600 mr-3" />
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sessions</span>
                      </div>
                      <span className="text-xl font-bold text-orange-600">{stats?.sessionsCompleted}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-3xl shadow-xl border p-6 ${
              isDarkMode ? 'border-white/10' : 'border-white/20'
            }`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-3 rounded-xl border ${
                      achievement.unlocked 
                        ? isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
                        : isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${
                          achievement.unlocked 
                            ? 'bg-yellow-500 text-white' 
                            : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h4 className={`font-medium text-sm ${
                            achievement.unlocked 
                              ? isDarkMode ? 'text-gray-100' : 'text-gray-800' 
                              : isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="mt-2">
                        <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              achievement.unlocked ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {achievement.progress} / {achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
