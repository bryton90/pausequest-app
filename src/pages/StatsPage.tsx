import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { getInitialStats } from '../utils/gamification';
import { Clock, Trophy, Flame, Target, TrendingUp, BarChart3 } from 'lucide-react';

function StatsPage() {
  const { isDarkMode } = useSettings();
  const { user } = useAuth();
  
  // Get real stats from gamification system
  const stats = getInitialStats(user?.id);

  return (
    <div className={`min-h-screen bg-gradient-to-br p-6 ${
      isDarkMode 
        ? 'from-gray-900 via-gray-800 to-gray-900' 
        : 'from-green-50 via-white to-green-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className={`p-3 rounded-2xl ${
              isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'
            }`}>
              <BarChart3 className={`w-8 h-8 ${
                isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
              }`} />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Your Performance Stats
          </h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Track your productivity journey and celebrate your achievements
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-2xl shadow-xl border p-6 ${
            isDarkMode ? 'border-white/10' : 'border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">
                {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
              </span>
            </div>
            <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Total Focus Time
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Deep work hours accumulated
            </p>
          </div>

          <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-2xl shadow-xl border p-6 ${
            isDarkMode ? 'border-white/10' : 'border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-green-500">{stats.totalSessions}</span>
            </div>
            <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Sessions Completed
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Focus sessions finished
            </p>
          </div>

          <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-2xl shadow-xl border p-6 ${
            isDarkMode ? 'border-white/10' : 'border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-orange-500">{stats.currentStreak}</span>
            </div>
            <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Current Streak
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Days in a row
            </p>
          </div>

          <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-2xl shadow-xl border p-6 ${
            isDarkMode ? 'border-white/10' : 'border-white/20'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500">{stats.focusPoints}</span>
            </div>
            <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Focus Points
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Productivity score
            </p>
          </div>
        </div>

        {/* Weekly Focus Chart */}
        <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-2xl shadow-xl border p-6 mb-8 ${
          isDarkMode ? 'border-white/10' : 'border-white/20'
        }`}>
          <div className="flex items-center mb-6">
            <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Weekly Focus Pattern
            </h2>
          </div>
          <div className="h-64 flex items-end justify-between">
            {[20, 35, 45, 25, 50, 40, 30].map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-12 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg transition-all hover:from-green-600 hover:to-emerald-600"
                  style={{ height: `${(value / 50) * 100}%` }}
                  title={`${value} min`} 
                />
                <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className={`bg-bg-secondary/95 backdrop-blur-md rounded-2xl shadow-xl border p-6 ${
          isDarkMode ? 'border-white/10' : 'border-white/20'
        }`}>
          <div className="flex items-center mb-6">
            <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              🏆 Achievements
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'First Timer', description: 'Complete your first focus session', earned: stats.totalSessions > 0, icon: '🎯' },
              { name: '5 in a Row', description: 'Complete 5 focus sessions', earned: stats.totalSessions >= 5, icon: '⚡' },
              { name: 'Marathon Runner', description: 'Focus for more than 2 hours total', earned: stats.totalFocusTime > 120, icon: '🏃' },
              { name: 'Early Bird', description: 'Complete a session before 8 AM', earned: false, icon: '🌅' },
              { name: 'Night Owl', description: 'Complete a session after 10 PM', earned: false, icon: '🦉' },
              { name: 'Consistency King', description: '7-day streak', earned: stats.currentStreak >= 7, icon: '👑' },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-lg ${
                    achievement.earned ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    {achievement.earned ? achievement.icon : '🔒'}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      achievement.earned ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
