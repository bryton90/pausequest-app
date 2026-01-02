import { Session } from '../api/breakService';

export interface EnhancedPattern {
  type: 'productivity' | 'wellness' | 'focus' | 'break';
  title: string;
  description: string;
  confidence: number; // 0-1
  recommendation: string;
  actionable: boolean;
}

export interface WellnessInsight {
  category: 'energy' | 'stress' | 'focus' | 'balance';
  score: number; // 0-100
  trend: 'improving' | 'declining' | 'stable';
  message: string;
  suggestions: string[];
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'break_timing' | 'duration' | 'frequency' | 'wellness';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionText: string;
  expectedBenefit: string;
}

export interface UserPattern {
  userId: string;
  averageFocusSession: number; // minutes
  averageBreakDuration: number; // minutes
  peakProductivityHours: number[]; // hours of day
  moodTrends: Record<string, number>;
  weeklyProgress: {
    week: string;
    totalFocus: number;
    totalBreaks: number;
    consistency: number;
  }[];
  burnoutRisk: number; // 0-100
  efficiency: number; // 0-100
}

class EnhancedAIService {
  private analyzeSessionPatterns(sessions: Session[]): EnhancedPattern[] {
    const patterns: EnhancedPattern[] = [];

    // Analyze focus duration patterns
    const focusDurations = sessions.map(s => s.focus_duration / 60); // convert to minutes
    const avgFocus = focusDurations.reduce((a, b) => a + b, 0) / focusDurations.length;
    
    if (avgFocus < 15) {
      patterns.push({
        type: 'focus',
        title: 'Short Focus Sessions',
        description: 'Your focus sessions are typically shorter than 15 minutes',
        confidence: 0.8,
        recommendation: 'Try gradually increasing session duration by 5 minutes to build focus endurance',
        actionable: true
      });
    } else if (avgFocus > 45) {
      patterns.push({
        type: 'focus',
        title: 'Long Focus Sessions',
        description: 'You maintain focus for extended periods (45+ minutes)',
        confidence: 0.9,
        recommendation: 'Consider taking strategic breaks to maintain high performance',
        actionable: true
      });
    }

    // Analyze break patterns
    const breakDurations = sessions.map(s => s.break_duration / 60);
    const avgBreak = breakDurations.reduce((a, b) => a + b, 0) / breakDurations.length;
    const focusToBreakRatio = avgFocus / avgBreak;

    if (focusToBreakRatio > 8) {
      patterns.push({
        type: 'break',
        title: 'Insufficient Break Time',
        description: 'Your break-to-focus ratio suggests you may be under-recovering',
        confidence: 0.85,
        recommendation: 'Increase break duration to at least 1/8 of your focus time',
        actionable: true
      });
    }

    // Analyze time-of-day patterns
    const hourlyProductivity = this.analyzeHourlyProductivity(sessions);
    const peakHours = hourlyProductivity
      .filter((_, hour) => _ > 0.7)
      .map((_, hour) => hour);

    if (peakHours.length > 0) {
      patterns.push({
        type: 'productivity',
        title: 'Peak Productivity Hours',
        description: `You're most productive during: ${peakHours.map(h => `${h}:00`).join(', ')}`,
        confidence: 0.75,
        recommendation: 'Schedule important tasks during your peak hours for better results',
        actionable: true
      });
    }

    return patterns;
  }

  private analyzeHourlyProductivity(sessions: Session[]): number[] {
    const hourlyData = new Array(24).fill(0);
    const hourlyCount = new Array(24).fill(0);

    sessions.forEach(session => {
      if (session.date) {
        const hour = new Date(session.date).getHours();
        const efficiency = session.focus_duration / (session.focus_duration + session.break_duration);
        hourlyData[hour] += efficiency;
        hourlyCount[hour]++;
      }
    });

    return hourlyData.map((sum, hour) => 
      hourlyCount[hour] > 0 ? sum / hourlyCount[hour] : 0
    );
  }

  private calculateWellnessInsights(sessions: Session[]): WellnessInsight[] {
    const insights: WellnessInsight[] = [];

    // Energy analysis based on session patterns
    const recentSessions = sessions.slice(-7); // Last 7 sessions
    const avgFocusTime = recentSessions.reduce((sum, s) => sum + s.focus_duration, 0) / recentSessions.length;
    
    let energyScore = 50;
    if (avgFocusTime > 1800) energyScore += 20; // 30+ minutes average
    if (avgFocusTime < 900) energyScore -= 20;  // Less than 15 minutes

    insights.push({
      category: 'energy',
      score: Math.max(0, Math.min(100, energyScore)),
      trend: this.calculateTrend(sessions, 'focus_duration'),
      message: energyScore > 70 ? 'High energy levels detected!' : 'Consider optimizing your energy management',
      suggestions: energyScore > 70 
        ? ['Maintain current routine', 'Track what fuels your productivity']
        : ['Ensure adequate sleep', 'Consider shorter, more frequent sessions']
    });

    // Stress analysis based on break patterns
    const avgBreakTime = recentSessions.reduce((sum, s) => sum + s.break_duration, 0) / recentSessions.length;
    const focusToBreakRatio = avgFocusTime / avgBreakTime;
    
    let stressScore = 50;
    if (focusToBreakRatio > 6) stressScore += 30; // High stress risk
    if (focusToBreakRatio < 3) stressScore -= 20;  // Good balance

    insights.push({
      category: 'stress',
      score: Math.max(0, Math.min(100, stressScore)),
      trend: this.calculateTrend(sessions, 'break_duration'),
      message: stressScore > 70 ? 'High stress risk detected' : 'Good stress management',
      suggestions: stressScore > 70
        ? ['Increase break frequency', 'Practice mindfulness during breaks']
        : ['Continue current break patterns', 'Help others with your routine']
    });

    return insights;
  }

  private calculateTrend(sessions: Session[], metric: keyof Session): 'improving' | 'declining' | 'stable' {
    if (sessions.length < 4) return 'stable';
    
    const recent = sessions.slice(-2).reduce((sum, s) => sum + (s[metric] as number), 0) / 2;
    const previous = sessions.slice(-4, -2).reduce((sum, s) => sum + (s[metric] as number), 0) / 2;
    
    const change = (recent - previous) / previous;
    
    if (change > 0.1) return 'improving';
    if (change < -0.1) return 'declining';
    return 'stable';
  }

  private generatePersonalizedRecommendations(
    patterns: EnhancedPattern[],
    insights: WellnessInsight[],
    userPattern: UserPattern
  ): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    // Based on patterns
    patterns.forEach(pattern => {
      if (pattern.actionable) {
        recommendations.push({
          id: `pattern-${pattern.type}`,
          type: pattern.type === 'focus' ? 'duration' : 'frequency',
          priority: pattern.confidence > 0.8 ? 'high' : 'medium',
          title: pattern.title,
          description: pattern.description,
          actionText: pattern.recommendation,
          expectedBenefit: this.getExpectedBenefit(pattern.type)
        });
      }
    });

    // Based on wellness insights
    insights.forEach(insight => {
      if (insight.score < 40) {
        recommendations.push({
          id: `insight-${insight.category}`,
          type: 'wellness',
          priority: 'high',
          title: `${insight.category.charAt(0).toUpperCase() + insight.category.slice(1)} Management`,
          description: insight.message,
          actionText: insight.suggestions[0],
          expectedBenefit: 'Improved overall well-being and productivity'
        });
      }
    });

    // Based on burnout risk
    if (userPattern.burnoutRisk > 70) {
      recommendations.push({
        id: 'burnout-prevention',
        type: 'frequency',
        priority: 'high',
        title: 'Burnout Prevention',
        description: 'Your patterns indicate high burnout risk',
        actionText: 'Take a full day off and reassess your schedule',
        expectedBenefit: 'Long-term sustainability and performance'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private getExpectedBenefit(type: string): string {
    const benefits: Record<string, string> = {
      focus: 'Improved concentration and task completion',
      break: 'Better recovery and sustained performance',
      productivity: 'Higher output during peak hours',
      wellness: 'Enhanced overall well-being'
    };
    return benefits[type] || 'Improved productivity and well-being';
  }

  private calculateUserPattern(sessions: Session[], userId: string): UserPattern {
    const focusDurations = sessions.map(s => s.focus_duration / 60);
    const breakDurations = sessions.map(s => s.break_duration / 60);
    
    const hourlyProductivity = this.analyzeHourlyProductivity(sessions);
    const peakHours = hourlyProductivity
      .map((score, hour) => ({ score, hour }))
      .filter(item => item.score > 0.7)
      .map(item => item.hour);

    // Calculate burnout risk
    const avgFocusToBreakRatio = (focusDurations.reduce((a, b) => a + b, 0) / focusDurations.length) /
                                 (breakDurations.reduce((a, b) => a + b, 0) / breakDurations.length);
    const burnoutRisk = Math.min(100, Math.max(0, (avgFocusToBreakRatio - 4) * 20));

    // Calculate efficiency
    const efficiency = Math.min(100, (1 / (1 + avgFocusToBreakRatio / 5)) * 100);

    return {
      userId,
      averageFocusSession: focusDurations.reduce((a, b) => a + b, 0) / focusDurations.length,
      averageBreakDuration: breakDurations.reduce((a, b) => a + b, 0) / breakDurations.length,
      peakProductivityHours: peakHours,
      moodTrends: this.analyzeMoodTrends(sessions),
      weeklyProgress: this.calculateWeeklyProgress(sessions),
      burnoutRisk,
      efficiency
    };
  }

  private analyzeMoodTrends(sessions: Session[]): Record<string, number> {
    const moodCounts: Record<string, number> = {};
    
    sessions.forEach(session => {
      if (session.mood_emoji) {
        moodCounts[session.mood_emoji] = (moodCounts[session.mood_emoji] || 0) + 1;
      }
    });

    return moodCounts;
  }

  private calculateWeeklyProgress(sessions: Session[]): UserPattern['weeklyProgress'] {
    const weeklyData: Record<string, { focus: number; breaks: number; count: number }> = {};
    
    sessions.forEach(session => {
      if (session.date) {
        const week = this.getWeekKey(new Date(session.date));
        if (!weeklyData[week]) {
          weeklyData[week] = { focus: 0, breaks: 0, count: 0 };
        }
        weeklyData[week].focus += session.focus_duration;
        weeklyData[week].breaks += session.break_duration;
        weeklyData[week].count++;
      }
    });

    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      totalFocus: data.focus,
      totalBreaks: data.breaks,
      consistency: (data.count / 7) * 100 // Assuming 7 days per week
    }));
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  // Main analysis method
  public analyzeUserPatterns(sessions: Session[], userId: string): {
    patterns: EnhancedPattern[];
    insights: WellnessInsight[];
    recommendations: PersonalizedRecommendation[];
    userPattern: UserPattern;
  } {
    const userPattern = this.calculateUserPattern(sessions, userId);
    const patterns = this.analyzeSessionPatterns(sessions);
    const insights = this.calculateWellnessInsights(sessions);
    const recommendations = this.generatePersonalizedRecommendations(patterns, insights, userPattern);

    return {
      patterns,
      insights,
      recommendations,
      userPattern
    };
  }

  // Real-time recommendation based on current state
  public getRealTimeRecommendation(
    currentSessionTime: number,
    recentSessions: Session[],
    currentMood?: string
  ): PersonalizedRecommendation | null {
    const avgSessionTime = recentSessions.length > 0 
      ? recentSessions.reduce((sum, s) => sum + s.focus_duration, 0) / recentSessions.length 
      : 25 * 60; // 25 minutes default

    // If current session is much longer than average
    if (currentSessionTime > avgSessionTime * 1.5) {
      return {
        id: 'realtime-break',
        type: 'break_timing',
        priority: 'high',
        title: 'Time for a Break',
        description: 'You\'ve been focusing longer than your usual sessions',
        actionText: 'Take a 5-10 minute break to recharge',
        expectedBenefit: 'Maintain high performance and prevent burnout'
      };
    }

    // Mood-based recommendations
    if (currentMood === 'tired' || currentMood === 'stressed') {
      return {
        id: 'realtime-mood',
        type: 'wellness',
        priority: 'medium',
        title: 'Wellness Check-in',
        description: `You're feeling ${currentMood}`,
        actionText: currentMood === 'tired' 
          ? 'Consider a short energizing break' 
          : 'Try a 2-minute breathing exercise',
        expectedBenefit: 'Improved mental state and focus'
      };
    }

    return null;
  }
}

export const enhancedAIService = new EnhancedAIService();
