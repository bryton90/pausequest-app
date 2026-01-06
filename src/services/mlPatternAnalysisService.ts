import { Session } from '../api/breakService';

// Machine Learning Pattern Analysis Service
// This service uses various ML techniques to analyze user behavior patterns
// and provide sophisticated recommendations beyond simple rule-based logic

export interface ProductivityArchetype {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  recommendations: string[];
  confidence: number;
}

export interface TimeSeriesPrediction {
  timestamp: Date;
  predictedProductivity: number; // 0-1
  confidence: number;
  factors: string[];
}

export interface BehavioralPattern {
  name: any;
  confidence: number;
  type: 'circadian' | 'weekly' | 'session-based' | 'mood-based';
  strength: number; // 0-1
  description: string;
  implications: string[];
}

export interface MLInsight {
  id: string;
  type: 'pattern' | 'prediction' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  evidence: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface UserBehaviorProfile {
  userId: string;
  archetype: ProductivityArchetype;
  patterns: BehavioralPattern[];
  predictions: TimeSeriesPrediction[];
  insights: MLInsight[];
  lastUpdated: Date;
}

class MLPatternAnalysisService {
  private readonly ARCHETYPE_DEFINITIONS = {
    'early-bird': {
      name: 'Early Bird',
      description: 'Most productive in morning hours',
      characteristics: ['Peak productivity 6AM-10AM', 'Declining energy after noon', 'Consistent morning routine'],
      recommendations: ['Schedule important tasks early', 'Lighter tasks in afternoon', 'Maintain consistent sleep schedule']
    },
    'night-owl': {
      name: 'Night Owl',
      description: 'Peak productivity in evening hours',
      characteristics: ['Peak productivity 8PM-12AM', 'Slow morning start', 'Creative bursts at night'],
      recommendations: ['Protect evening focus time', 'Ease into morning with lighter tasks', 'Avoid early meetings']
    },
    'steady-performer': {
      name: 'Steady Performer',
      description: 'Consistent productivity throughout the day',
      characteristics: ['Stable energy levels', 'Reliable session completion', 'Balanced break patterns'],
      recommendations: ['Maintain current routine', 'Optimize break timing', 'Focus on task variety']
    },
    'burst-worker': {
      name: 'Burst Worker',
      description: 'Productivity in intense bursts with longer breaks',
      characteristics: ['Long focus sessions', 'Extended breaks', 'High intensity periods'],
      recommendations: ['Protect burst periods', 'Plan for recovery time', 'Avoid over-scheduling']
    },
    'interval-focuser': {
      name: 'Interval Focuser',
      description: 'Works best with short, frequent sessions',
      characteristics: ['Short focus sessions', 'Frequent breaks', 'High session frequency'],
      recommendations: ['Use Pomodoro technique', 'Keep breaks short', 'Maintain high frequency']
    }
  };

  // K-means clustering for user behavior segmentation
  private calculateUserFeatures(sessions: Session[]): number[] {
    if (sessions.length === 0) return [0, 0, 0, 0, 0];

    const focusDurations = sessions.map(s => s.focus_duration / 60); // minutes
    const breakDurations = sessions.map(s => s.break_duration / 60);
    const sessionHours = sessions.map(s => new Date(s.date).getHours());
    
    // Feature extraction
    const avgFocusTime = focusDurations.reduce((a, b) => a + b, 0) / focusDurations.length;
    const avgBreakTime = breakDurations.reduce((a, b) => a + b, 0) / breakDurations.length;
    const focusToBreakRatio = avgBreakTime > 0 ? avgFocusTime / avgBreakTime : 1;
    
    // Time preference features
    const morningSessions = sessionHours.filter(h => h >= 6 && h < 12).length;
    const eveningSessions = sessionHours.filter(h => h >= 18 && h < 24).length;
    const timePreference = sessions.length > 0 ? (eveningSessions - morningSessions) / sessions.length : 0;
    
    // Consistency feature (standard deviation of session durations)
    const focusVariance = this.calculateVariance(focusDurations);
    const consistency = 1 / (1 + focusVariance);
    
    return [
      this.normalize(avgFocusTime, 5, 60), // Normalize to 0-1
      this.normalize(focusToBreakRatio, 2, 10),
      this.normalize(timePreference, -1, 1),
      consistency,
      this.normalize(sessions.length, 1, 100) // Session frequency
    ];
  }

  private normalize(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  // Simple k-means clustering implementation
  private kMeansClustering(features: number[][], k: number = 5): number[][] {
    // Initialize centroids (simplified - using predefined archetypes)
    const centroids = this.getArchetypeCentroids();
    const assignments = new Array(features.length).fill(0);
    
    // Assign to nearest centroid
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      if (!feature) continue;
      
      let minDistance = Infinity;
      let closestCentroid = 0;
      
      for (let j = 0; j < centroids.length; j++) {
        const centroid = centroids[j];
        if (!centroid) continue;
        
        const distance = this.euclideanDistance(feature, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = j;
        }
      }
      
      assignments[i] = closestCentroid;
    }
    
    return centroids;
  }

  private getArchetypeCentroids(): number[][] {
    return [
      [0.8, 0.6, -0.7, 0.8, 0.7], // early-bird
      [0.7, 0.5, 0.8, 0.6, 0.5],  // night-owl
      [0.6, 0.4, 0.0, 0.9, 0.8],  // steady-performer
      [0.9, 0.8, 0.2, 0.4, 0.6],  // burst-worker
      [0.3, 0.3, 0.1, 0.7, 0.9]   // interval-focuser
    ];
  }

  private euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Arrays must have the same length for euclidean distance calculation');
    }
    return Math.sqrt(a.reduce((sum, val, i) => {
      const bVal = b[i];
      if (bVal === undefined) {
        throw new Error(`Index ${i} is out of bounds for array b`);
      }
      return sum + Math.pow(val - bVal, 2);
    }, 0));
  }

  // Time series forecasting using exponential smoothing
  private forecastProductivity(sessions: Session[], horizon: number = 24): TimeSeriesPrediction[] {
    const hourlyData = this.aggregateHourlyProductivity(sessions);
    const predictions: TimeSeriesPrediction[] = [];
    
    // Simple exponential smoothing for each hour
    for (let hour = 0; hour < horizon; hour++) {
      const currentHour = (new Date().getHours() + hour) % 24;
      const historicalValue = hourlyData[currentHour] || 0.5;
      
      // Exponential smoothing with trend
      const alpha = 0.3; // Smoothing factor
      const trend = this.calculateHourlyTrend(hourlyData, currentHour);
      const prediction = historicalValue * (1 + trend * 0.1);
      
      predictions.push({
        timestamp: new Date(Date.now() + hour * 60 * 60 * 1000),
        predictedProductivity: Math.max(0, Math.min(1, prediction)),
        confidence: Math.max(0.3, 1 - (hour / horizon) * 0.5), // Decreasing confidence
        factors: this.getInfluencingFactors(sessions, currentHour)
      });
    }
    
    return predictions;
  }

  private aggregateHourlyProductivity(sessions: Session[]): Record<number, number> {
    const hourlyData: Record<number, { sum: number; count: number }> = {};
    
    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      const efficiency = session.focus_duration / (session.focus_duration + session.break_duration);
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = { sum: 0, count: 0 };
      }
      
      hourlyData[hour].sum += efficiency;
      hourlyData[hour].count += 1;
    });
    
    // Convert to averages
    const result: Record<number, number> = {};
    Object.entries(hourlyData).forEach(([hour, data]) => {
      result[parseInt(hour)] = data.sum / data.count;
    });
    
    return result;
  }

  private calculateHourlyTrend(hourlyData: Record<number, number>, hour: number): number {
    // Simple trend calculation based on neighboring hours
    const prevHour = (hour - 1 + 24) % 24;
    const nextHour = (hour + 1) % 24;
    
    const current = hourlyData[hour] || 0.5;
    const previous = hourlyData[prevHour] || current;
    const next = hourlyData[nextHour] || current;
    
    return ((next - previous) / 2) / current;
  }

  private getInfluencingFactors(sessions: Session[], hour: number): string[] {
    const factors: string[] = [];
    const hourSessions = sessions.filter(s => new Date(s.date).getHours() === hour);
    
    if (hourSessions.length > 0) {
      const avgFocus = hourSessions.reduce((sum, s) => sum + s.focus_duration, 0) / hourSessions.length;
      
      if (avgFocus > 30) factors.push('Historically long focus sessions');
      if (avgFocus < 15) factors.push('Typically short sessions');
      if (hourSessions.length > 5) factors.push('High session frequency');
    }
    
    // Time-based factors
    if (hour >= 6 && hour < 12) factors.push('Morning hours');
    if (hour >= 12 && hour < 14) factors.push('Post-lunch dip');
    if (hour >= 18 && hour < 22) factors.push('Evening productivity');
    
    return factors;
  }

  // Pattern detection using statistical analysis
  private detectPatterns(sessions: Session[]): BehavioralPattern[] {
    const patterns: BehavioralPattern[] = [];
    
    // Circadian rhythm pattern
    const circadianStrength = this.detectCircadianPattern(sessions);
    if (circadianStrength > 0.6) {
      patterns.push({
        type: 'circadian',
        strength: circadianStrength,
        description: 'Strong daily productivity rhythm detected',
        implications: ['Schedule important tasks during peak hours', 'Protect high-energy periods', 'Plan breaks around low-energy times']
      });
    }
    
    // Weekly pattern
    const weeklyStrength = this.detectWeeklyPattern(sessions);
    if (weeklyStrength > 0.5) {
      patterns.push({
        type: 'weekly',
        strength: weeklyStrength,
        description: 'Consistent weekly work patterns identified',
        implications: ['Optimize weekly planning', 'Account for weekly energy cycles', 'Plan recovery periods']
      });
    }
    
    // Session-based pattern
    const sessionStrength = this.detectSessionPattern(sessions);
    if (sessionStrength > 0.7) {
      patterns.push({
        type: 'session-based',
        strength: sessionStrength,
        description: 'Consistent session duration and break patterns',
        implications: ['Maintain effective session structure', 'Optimize break timing', 'Leverage established routines']
      });
    }
    
    return patterns;
  }

  private detectCircadianPattern(sessions: Session[]): number {
    const hourlyProductivity = this.aggregateHourlyProductivity(sessions);
    const values = Object.values(hourlyProductivity);
    
    if (values.length < 6) return 0;
    
    // Calculate variance - lower variance suggests stronger pattern
    const variance = this.calculateVariance(values);
    return Math.max(0, 1 - variance * 2);
  }

  private detectWeeklyPattern(sessions: Session[]): number {
    const weeklyData: Record<number, number[]> = {};
    
    sessions.forEach(session => {
      const dayOfWeek = new Date(session.date).getDay();
      const efficiency = session.focus_duration / (session.focus_duration + session.break_duration);
      
      if (!weeklyData[dayOfWeek]) {
        weeklyData[dayOfWeek] = [];
      }
      weeklyData[dayOfWeek].push(efficiency);
    });
    
    const dayAverages = Object.values(weeklyData).map(day => 
      day.reduce((sum, val) => sum + val, 0) / day.length
    );
    
    if (dayAverages.length < 3) return 0;
    
    const variance = this.calculateVariance(dayAverages);
    return Math.max(0, 1 - variance);
  }

  private detectSessionPattern(sessions: Session[]): number {
    const focusDurations = sessions.map(s => s.focus_duration / 60);
    const breakDurations = sessions.map(s => s.break_duration / 60);
    
    if (focusDurations.length < 5) return 0;
    
    const focusVariance = this.calculateVariance(focusDurations);
    const breakVariance = this.calculateVariance(breakDurations);
    
    // Lower variance = stronger pattern
    const avgVariance = (focusVariance + breakVariance) / 2;
    return Math.max(0, 1 - avgVariance / 100); // Normalize
  }

  // Anomaly detection
  private detectAnomalies(sessions: Session[]): MLInsight[] {
    const insights: MLInsight[] = [];
    
    if (sessions.length < 10) return insights;
    
    // Detect unusual session lengths
    const focusDurations = sessions.map(s => s.focus_duration / 60);
    const mean = focusDurations.reduce((a, b) => a + b, 0) / focusDurations.length;
    const stdDev = Math.sqrt(this.calculateVariance(focusDurations));
    
    const outliers = sessions.filter(s => {
      const duration = s.focus_duration / 60;
      return Math.abs(duration - mean) > 2 * stdDev; // 2 standard deviations
    });
    
    if (outliers.length > 0) {
      insights.push({
        id: 'session-outliers',
        type: 'anomaly',
        title: 'Unusual Session Patterns Detected',
        description: `Found ${outliers.length} sessions with unusual durations. These may indicate exceptional productivity or potential issues.`,
        confidence: 0.8,
        actionable: true,
        evidence: outliers.map(s => `${new Date(s.date).toLocaleDateString()}: ${s.focus_duration/60}min`),
        priority: 'medium'
      });
    }
    
    return insights;
  }

  // Main analysis method
  public analyzeUserBehavior(sessions: Session[], userId: string): UserBehaviorProfile {
    const features = this.calculateUserFeatures(sessions);
    const centroids = this.kMeansClustering([features]);
    const archetypeIndex = this.findClosestCentroid(features, centroids);
    const archetypeKeys = Object.keys(this.ARCHETYPE_DEFINITIONS);
    const archetypeKey = archetypeKeys[archetypeIndex] || 'steady-performer';
    const archetypeDef = this.ARCHETYPE_DEFINITIONS[archetypeKey as keyof typeof this.ARCHETYPE_DEFINITIONS];
    
    const archetype: ProductivityArchetype = {
      id: archetypeKey,
      name: archetypeDef.name,
      description: archetypeDef.description,
      characteristics: archetypeDef.characteristics,
      recommendations: archetypeDef.recommendations,
      confidence: this.calculateArchetypeConfidence(features, centroids[archetypeIndex] || [])
    };
    
    const patterns = this.detectPatterns(sessions);
    const predictions = this.forecastProductivity(sessions);
    const anomalyInsights = this.detectAnomalies(sessions);
    
    // Generate additional insights
    const insights: MLInsight[] = [
      ...anomalyInsights,
      ...this.generatePatternInsights(patterns, archetype),
      ...this.generatePredictiveInsights(predictions)
    ];
    
    return {
      userId,
      archetype,
      patterns,
      predictions,
      insights,
      lastUpdated: new Date()
    };
  }

  private findClosestCentroid(features: number[], centroids: number[][]): number {
    let minDistance = Infinity;
    let closestIndex = 0;
    
    centroids.forEach((centroid, index) => {
      if (!centroid) return;
      
      const distance = this.euclideanDistance(features, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    return closestIndex;
  }

  private calculateArchetypeConfidence(features: number[], centroid: number[]): number {
    if (!centroid) return 0.3;
    
    const distance = this.euclideanDistance(features, centroid);
    return Math.max(0.3, 1 - distance / 2); // Convert distance to confidence
  }

  private generatePatternInsights(patterns: BehavioralPattern[], archetype: ProductivityArchetype): MLInsight[] {
    return patterns.map(pattern => ({
      id: `pattern-${pattern.type}`,
      type: 'pattern' as const,
      title: `${pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} Pattern`,
      description: pattern.description,
      confidence: pattern.strength,
      actionable: true,
      evidence: pattern.implications,
      priority: pattern.strength > 0.7 ? 'high' : pattern.strength > 0.5 ? 'medium' : 'low'
    }));
  }

  private generatePredictiveInsights(predictions: TimeSeriesPrediction[]): MLInsight[] {
    const insights: MLInsight[] = [];
    
    // Find next peak productivity window
    const nextPeak = predictions
      .filter(p => p.timestamp > new Date())
      .sort((a, b) => b.predictedProductivity - a.predictedProductivity)[0];
    
    if (nextPeak && nextPeak.predictedProductivity > 0.7) {
      insights.push({
        id: 'next-peak',
        type: 'prediction',
        title: 'Upcoming Productivity Peak',
        description: `High productivity predicted around ${nextPeak.timestamp.toLocaleTimeString()}`,
        confidence: nextPeak.confidence,
        actionable: true,
        evidence: nextPeak.factors,
        priority: 'high'
      });
    }
    
    return insights;
  }

  // Real-time recommendation based on current context
  public getRealTimeMLRecommendation(
    currentSessionTime: number,
    userProfile: UserBehaviorProfile,
    currentMood?: string,
    recentSessions: Session[] = []
  ): MLInsight | null {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Check if current time aligns with user's peak productivity
    const currentPrediction = userProfile.predictions.find(p => 
      Math.abs(p.timestamp.getTime() - now.getTime()) < 60 * 60 * 1000 // Within 1 hour
    );
    
    if (currentPrediction && currentPrediction.predictedProductivity < 0.3) {
      return {
        id: 'low-productivity-time',
        type: 'recommendation',
        title: 'Low Productivity Period',
        description: 'Current time is typically low-productivity for you',
        confidence: currentPrediction.confidence,
        actionable: true,
        evidence: currentPrediction.factors,
        priority: 'medium'
      };
    }
    
    // Mood-based recommendations
    if (currentMood) {
      const moodRecommendation = this.getMoodBasedRecommendation(currentMood, userProfile.archetype);
      if (moodRecommendation) {
        return moodRecommendation;
      }
    }
    
    // Session duration recommendations
    if (currentSessionTime > 0) {
      const avgSessionTime = recentSessions.length > 0 
        ? recentSessions.reduce((sum, s) => sum + s.focus_duration, 0) / recentSessions.length 
        : 25 * 60;
      
      if (currentSessionTime > avgSessionTime * 1.5) {
        return {
          id: 'extended-session',
          type: 'recommendation',
          title: 'Extended Session Detected',
          description: 'Current session is longer than your average',
          confidence: 0.8,
          actionable: true,
          evidence: [`Average: ${avgSessionTime/60}min, Current: ${currentSessionTime/60}min`],
          priority: 'high'
        };
      }
    }
    
    return null;
  }

  private getMoodBasedRecommendation(mood: string, archetype: ProductivityArchetype): MLInsight | null {
    const moodMappings: Record<string, { title: string; description: string; priority: 'low' | 'medium' | 'high' }> = {
      'tired': {
        title: 'Energy Management',
        description: 'Low energy detected - consider a recovery break',
        priority: 'high'
      },
      'stressed': {
        title: 'Stress Management',
        description: 'Stress levels elevated - mindfulness break recommended',
        priority: 'high'
      },
      'distracted': {
        title: 'Focus Restoration',
        description: 'Difficulty focusing detected - try a reset break',
        priority: 'medium'
      },
      'energized': {
        title: 'Energy Optimization',
        description: 'High energy - great time for challenging tasks',
        priority: 'low'
      },
      'focused': {
        title: 'Flow State Protection',
        description: 'Deep focus detected - protect this state',
        priority: 'low'
      }
    };
    
    const mapping = moodMappings[mood];
    if (!mapping) return null;
    
    return {
      id: `mood-${mood}`,
      type: 'recommendation',
      title: mapping.title,
      description: mapping.description,
      confidence: 0.7,
      actionable: true,
      evidence: [`Archetype: ${archetype.name}`, `Mood: ${mood}`],
      priority: mapping.priority
    };
  }
}

export const mlPatternAnalysisService = new MLPatternAnalysisService();
