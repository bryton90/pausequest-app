import React, { memo, useMemo } from 'react';
import { Star, Zap, Award } from 'lucide-react';

interface GamificationPanelProps {
  xp: number;
  level: number;
  streak: number;
  achievements: Array<{ id: string; name: string; unlocked: boolean }>;
  className?: string;
}

const GamificationPanel: React.FC<GamificationPanelProps> = memo(({ 
  xp, 
  level, 
  streak, 
  achievements = [],
  className = ''
}) => {
  const unlockedAchievements = useMemo(
    () => achievements.filter(a => a.unlocked),
    [achievements]
  );

  return (
    <div className={`bg-bg-secondary rounded-lg shadow p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
        Progress
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Level {level}</span>
            <span>{xp} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(xp % 1000) / 10}%` }}
            />
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <Star className="w-4 h-4 mr-1 text-yellow-500" />
          <span>{streak} day streak</span>
        </div>

        {unlockedAchievements.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Award className="w-4 h-4 mr-1 text-green-500" />
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {unlockedAchievements.slice(0, 3).map(achievement => (
                <div 
                  key={achievement.id}
                  className="text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-md"
                >
                  {achievement.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

GamificationPanel.displayName = 'GamificationPanel';

export default GamificationPanel;
