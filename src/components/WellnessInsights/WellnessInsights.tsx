import React, { useState, useEffect } from 'react';
import { enhancedAIService, WellnessInsight, PersonalizedRecommendation } from '../../services/enhancedAIService';
import { Session } from '../../api/breakService';

interface WellnessInsightsProps {
  sessions: Session[];
  userId: string;
  currentSessionTime?: number;
  currentMood?: string;
}

export const WellnessInsights: React.FC<WellnessInsightsProps> = ({
  sessions,
  userId,
  currentSessionTime,
  currentMood
}) => {
  const [insights, setInsights] = useState<WellnessInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [realTimeRecommendation, setRealTimeRecommendation] = useState<PersonalizedRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeData = async () => {
      setLoading(true);
      try {
        const analysis = enhancedAIService.analyzeUserPatterns(sessions, userId);
        setInsights(analysis.insights);
        setRecommendations(analysis.recommendations.slice(0, 3)); // Show top 3
        
        if (currentSessionTime !== undefined) {
          const realtime = enhancedAIService.getRealTimeRecommendation(
            currentSessionTime,
            sessions.slice(-5), // Last 5 sessions
            currentMood
          );
          setRealTimeRecommendation(realtime);
        }
      } catch (error) {
        console.error('Error analyzing wellness data:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeData();
  }, [sessions, userId, currentSessionTime, currentMood]);

  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Recommendation */}
      {realTimeRecommendation && (
        <div className={`p-4 rounded-lg border-2 ${getPriorityColor(realTimeRecommendation.priority)}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{realTimeRecommendation.title}</h3>
              <p className="text-sm mb-2 opacity-90">{realTimeRecommendation.description}</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                  {realTimeRecommendation.actionText}
                </button>
                <span className="text-xs opacity-75">
                  Expected: {realTimeRecommendation.expectedBenefit}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Insights */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground tracking-wider">
          WELLNESS INSIGHTS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 bg-card rounded-lg border border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium capitalize">
                  {insight.category}
                </h3>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${getScoreColor(insight.score)}`}>
                    {insight.score}
                  </span>
                  <div className="flex items-center">
                    {insight.trend === 'improving' && <span className="text-green-500">↑</span>}
                    {insight.trend === 'declining' && <span className="text-red-500">↓</span>}
                    {insight.trend === 'stable' && <span className="text-gray-500">→</span>}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {insight.message}
              </p>
              
              <div className="space-y-1">
                {insight.suggestions.slice(0, 2).map((suggestion, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground tracking-wider">
          PERSONALIZED RECOMMENDATIONS
        </h2>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={rec.id} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-xl">
                    {rec.type === 'wellness' ? '🧘' : 
                     rec.type === 'break_timing' ? '⏰' :
                     rec.type === 'duration' ? '⏱️' : '📊'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{rec.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm mb-2 opacity-90">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      {rec.actionText}
                    </button>
                    <span className="text-xs opacity-75">
                      💡 {rec.expectedBenefit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground tracking-wider">
          QUICK ACTIONS
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
            <span className="text-2xl mb-1 block">🎯</span>
            <span className="text-xs font-medium">Focus Session</span>
          </button>
          <button className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
            <span className="text-2xl mb-1 block">☕</span>
            <span className="text-xs font-medium">Quick Break</span>
          </button>
          <button className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
            <span className="text-2xl mb-1 block">📊</span>
            <span className="text-xs font-medium">View Stats</span>
          </button>
          <button className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
            <span className="text-2xl mb-1 block">🎨</span>
            <span className="text-xs font-medium">Customize</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WellnessInsights;
