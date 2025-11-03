import React, { useEffect, useMemo, useState } from 'react';
import { UserStats } from '../../utils/gamification';
import './Stats.css';
import { getSessionHistory, Session } from '../../api/breakService';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StatsProps {
  stats: UserStats;
  onClose: () => void;
}

export const Stats: React.FC<StatsProps> = ({ stats, onClose }) => {
  const unlockedAchievements = stats.achievements.filter(a => a.unlocked);
  const lockedAchievements = stats.achievements.filter(a => !a.unlocked);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getSessionHistory(14)
      .then((res) => {
        setSessions(res.sessions);
        setError(null);
      })
      .catch(() => setError('Failed to load recent sessions'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    return sessions
      .slice()
      .reverse()
      .map((s) => ({
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        focusMin: Math.round(s.focus_duration / 60),
        breakMin: Math.round(s.break_duration / 60),
      }));
  }, [sessions]);

  return (
    <div className="stats-overlay">
      <div className="stats-modal">
        <div className="stats-header">
          <h2>📊 Your Progress</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="stats-content">
          {/* Progress Chart */}
          <div className="stats-section" style={{ marginBottom: 24 }}>
            <h3>📈 Recent Focus vs Break</h3>
            {loading && <div>Loading chart…</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && chartData.length === 0 && (
              <div>No recent sessions yet. Complete a session to see your progress.</div>
            )}
            {!loading && !error && chartData.length > 0 && (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="focusMin" name="Focus (min)" fill="#4f46e5" radius={[4,4,0,0]} />
                    <Bar dataKey="breakMin" name="Break (min)" fill="#22c55e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          {/* Main Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{stats.totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-label">Current Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">{stats.focusPoints}</div>
              <div className="stat-label">Focus Points</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{Math.floor(stats.totalFocusTime / 60)}h</div>
              <div className="stat-label">Total Focus Time</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="achievements-section">
            <h3>🏆 Achievements</h3>
            
            {unlockedAchievements.length > 0 && (
              <div className="achievements-group">
                <h4>Unlocked ({unlockedAchievements.length})</h4>
                <div className="achievements-list">
                  {unlockedAchievements.map(achievement => (
                    <div key={achievement.id} className="achievement-card unlocked">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-info">
                        <div className="achievement-title">{achievement.title}</div>
                        <div className="achievement-description">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lockedAchievements.length > 0 && (
              <div className="achievements-group">
                <h4>Locked ({lockedAchievements.length})</h4>
                <div className="achievements-list">
                  {lockedAchievements.map(achievement => (
                    <div key={achievement.id} className="achievement-card locked">
                      <div className="achievement-icon">🔒</div>
                      <div className="achievement-info">
                        <div className="achievement-title">{achievement.title}</div>
                        <div className="achievement-description">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
