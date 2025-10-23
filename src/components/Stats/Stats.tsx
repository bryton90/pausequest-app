import React from 'react';
import { UserStats } from '../../utils/gamification';
import './Stats.css';

interface StatsProps {
  stats: UserStats;
  onClose: () => void;
}

export const Stats: React.FC<StatsProps> = ({ stats, onClose }) => {
  const unlockedAchievements = stats.achievements.filter(a => a.unlocked);
  const lockedAchievements = stats.achievements.filter(a => !a.unlocked);

  return (
    <div className="stats-overlay">
      <div className="stats-modal">
        <div className="stats-header">
          <h2>📊 Your Progress</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="stats-content">
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
