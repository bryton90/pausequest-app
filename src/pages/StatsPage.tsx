import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

function StatsPage() {
  const { user } = useAuth();

  // Mock data for stats - in a real app, this would come from your backend or state management
  const stats = {
    totalFocusTime: user?.stats?.totalFocusTime || 0, // in minutes
    sessionsCompleted: user?.stats?.sessionsCompleted || 0,
    currentStreak: user?.stats?.currentStreak || 0, // days
    weeklyFocus: [20, 35, 45, 25, 50, 40, 30], // minutes per day
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Your Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Focus Time</h3>
          <p className="text-3xl font-bold text-blue-600">
            {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
          </p>
          <p className="text-sm text-gray-500 mt-1">of focused work</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Sessions Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.sessionsCompleted}</p>
          <p className="text-sm text-gray-500 mt-1">focus sessions</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Streak</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.currentStreak} days</p>
          <p className="text-sm text-gray-500 mt-1">in a row</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Weekly Focus</h2>
        <div className="h-64 flex items-end justify-between">
          {stats.weeklyFocus.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-8 bg-blue-500 rounded-t-sm"
                style={{ height: `${value}%` }}
                title={`${value} min`} />
              <span className="text-xs mt-2 text-gray-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'First Timer', description: 'Complete your first focus session', earned: stats.sessionsCompleted > 0 },
            { name: '5 in a Row', description: 'Complete 5 focus sessions', earned: stats.sessionsCompleted >= 5 },
            { name: 'Marathon Runner', description: 'Focus for more than 2 hours in one session', earned: stats.totalFocusTime > 120 },
            { name: 'Early Bird', description: 'Complete a session before 8 AM', earned: false },
            { name: 'Night Owl', description: 'Complete a session after 10 PM', earned: false },
            { name: 'Consistency King', description: '7-day streak', earned: stats.currentStreak >= 7 },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${achievement.earned
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'}`}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                  {achievement.earned ? '✓' : '?'}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
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
  );
}

export default StatsPage;
