import { QueryAnalysis } from './nlpService';
import { UserBehaviorProfile, MLInsight } from './mlPatternAnalysisService';

// Adaptive Learning Service
// Learns from user feedback and interaction patterns to improve recommendations over time

export interface UserFeedback {
  id: string;
  userId: string;
  insightId: string;
  recommendationId?: string;
  feedbackType: 'helpful' | 'not_helpful' | 'implemented' | 'ignored' | 'partially_helpful';
  rating?: number; // 1-5
  comment?: string;
  context: {
    timeOfDay: number;
    dayOfWeek: number;
    sessionTime?: number;
    currentMood?: string;
    recentSessions: number;
  };
  timestamp: Date;
}

export interface LearningMetrics {
  totalFeedback: number;
  helpfulRatio: number;
  implementedRatio: number;
  averageRating: number;
  feedbackByIntent: Record<string, number>;
  feedbackByTimeOfDay: Record<number, number>;
  feedbackByMood: Record<string, number>;
  improvementTrend: number; // -1 to 1, negative means declining
}

export interface AdaptiveWeights {
  intentWeights: Record<string, number>;
  temporalWeights: Record<number, number>;
  moodWeights: Record<string, number>;
  contextWeights: {
    sessionTime: number;
    streakLength: number;
    recentPerformance: number;
  };
  archetypeWeights: Record<string, number>;
}

export interface PersonalizedModel {
  userId: string;
  weights: AdaptiveWeights;
  metrics: LearningMetrics;
  lastUpdated: Date;
  modelVersion: number;
  confidence: number;
}

export interface RecommendationScore {
  insightId: string;
  baseScore: number;
  adaptiveScore: number;
  finalScore: number;
  factors: {
    intent: number;
    temporal: number;
    mood: number;
    context: number;
    archetype: number;
    feedback: number;
  };
  explanation: string[];
}

class AdaptiveLearningService {
  private readonly DEFAULT_WEIGHTS: AdaptiveWeights = {
    intentWeights: {
      'productivity': 1.0,
      'wellness': 0.9,
      'focus': 0.9,
      'break': 0.8,
      'schedule': 0.8,
      'achievement': 0.7,
      'help': 0.6,
      'general': 0.5
    },
    temporalWeights: this.initializeTemporalWeights(),
    moodWeights: {
      'energized': 1.2,
      'focused': 1.1,
      'balanced': 1.0,
      'distracted': 0.9,
      'tired': 0.7,
      'stressed': 0.6
    },
    contextWeights: {
      sessionTime: 0.8,
      streakLength: 0.6,
      recentPerformance: 0.9
    },
    archetypeWeights: {
      'early-bird': 1.0,
      'night-owl': 1.0,
      'steady-performer': 1.0,
      'burst-worker': 1.0,
      'interval-focuser': 1.0
    }
  };

  private userModels: Map<string, PersonalizedModel> = new Map();
  private feedbackHistory: Map<string, UserFeedback[]> = new Map();

  private initializeTemporalWeights(): Record<number, number> {
    const weights: Record<number, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      // Default: higher weights during typical work hours
      if (hour >= 9 && hour <= 11) weights[hour] = 1.2; // Morning peak
      else if (hour >= 14 && hour <= 16) weights[hour] = 1.1; // Afternoon
      else if (hour >= 19 && hour <= 21) weights[hour] = 0.9; // Evening
      else weights[hour] = 0.7; // Other times
    }
    return weights;
  }

  // Get or create user model
  private getUserModel(userId: string): PersonalizedModel {
    if (!this.userModels.has(userId)) {
      const model: PersonalizedModel = {
        userId,
        weights: JSON.parse(JSON.stringify(this.DEFAULT_WEIGHTS)), // Deep copy
        metrics: this.initializeMetrics(),
        lastUpdated: new Date(),
        modelVersion: 1,
        confidence: 0.5
      };
      this.userModels.set(userId, model);
    }
    return this.userModels.get(userId)!;
  }

  private initializeMetrics(): LearningMetrics {
    return {
      totalFeedback: 0,
      helpfulRatio: 0,
      implementedRatio: 0,
      averageRating: 0,
      feedbackByIntent: {},
      feedbackByTimeOfDay: {},
      feedbackByMood: {},
      improvementTrend: 0
    };
  }

  // Record user feedback
  public recordFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp'>): void {
    const feedbackId = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullFeedback: UserFeedback = {
      ...feedback,
      id: feedbackId,
      timestamp: new Date()
    };

    // Store feedback
    if (!this.feedbackHistory.has(feedback.userId)) {
      this.feedbackHistory.set(feedback.userId, []);
    }
    this.feedbackHistory.get(feedback.userId)!.push(fullFeedback);

    // Update user model
    this.updateUserModel(feedback.userId, fullFeedback);
  }

  private updateUserModel(userId: string, feedback: UserFeedback): void {
    const model = this.getUserModel(userId);
    const userFeedback = this.feedbackHistory.get(userId)!;

    // Update metrics
    model.metrics = this.calculateMetrics(userFeedback);
    
    // Update weights based on feedback
    this.updateWeights(model, feedback);
    
    // Update model metadata
    model.lastUpdated = new Date();
    model.modelVersion += 1;
    model.confidence = Math.min(1.0, model.metrics.totalFeedback / 20); // Increase confidence with more feedback

    this.userModels.set(userId, model);
  }

  private calculateMetrics(feedback: UserFeedback[]): LearningMetrics {
    const metrics = this.initializeMetrics();
    
    if (feedback.length === 0) return metrics;

    metrics.totalFeedback = feedback.length;
    
    // Calculate ratios
    const helpful = feedback.filter(f => f.feedbackType === 'helpful').length;
    const implemented = feedback.filter(f => f.feedbackType === 'implemented').length;
    const ratings = feedback.filter(f => f.rating !== undefined).map(f => f.rating!);
    
    metrics.helpfulRatio = helpful / feedback.length;
    metrics.implementedRatio = implemented / feedback.length;
    metrics.averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    
    // Calculate feedback by categories
    feedback.forEach(f => {
      // By intent (would need to be passed from context)
      const hour = f.context.timeOfDay;
      metrics.feedbackByTimeOfDay[hour] = (metrics.feedbackByTimeOfDay[hour] || 0) + 1;
      
      if (f.context.currentMood) {
        metrics.feedbackByMood[f.context.currentMood] = (metrics.feedbackByMood[f.context.currentMood] || 0) + 1;
      }
    });
    
    // Calculate improvement trend
    metrics.improvementTrend = this.calculateImprovementTrend(feedback);
    
    return metrics;
  }

  private calculateImprovementTrend(feedback: UserFeedback[]): number {
    if (feedback.length < 5) return 0;
    
    // Compare recent vs older feedback
    const recentFeedback = feedback.slice(-Math.floor(feedback.length / 2));
    const olderFeedback = feedback.slice(0, Math.floor(feedback.length / 2));
    
    const recentHelpful = recentFeedback.filter(f => f.feedbackType === 'helpful').length / recentFeedback.length;
    const olderHelpful = olderFeedback.filter(f => f.feedbackType === 'helpful').length / olderFeedback.length;
    
    return recentHelpful - olderHelpful;
  }

  private updateWeights(model: PersonalizedModel, feedback: UserFeedback): void {
    const learningRate = 0.1; // How much to adjust weights
    const feedbackValue = this.getFeedbackValue(feedback.feedbackType);
    
    // Update temporal weights
    const hour = feedback.context.timeOfDay;
    if (typeof hour === 'number') {
      model.weights.temporalWeights[hour] = this.updateWeight(
        model.weights.temporalWeights[hour] || 0.5,
        feedbackValue,
        learningRate
      );
    }
    
    // Update mood weights
    if (feedback.context.currentMood) {
      const mood = feedback.context.currentMood;
      model.weights.moodWeights[mood] = this.updateWeight(
        model.weights.moodWeights[mood] || 1.0,
        feedbackValue,
        learningRate
      );
    }
    
    // Update context weights based on session performance
    if (feedback.context.sessionTime && feedback.context.sessionTime > 0) {
      const sessionImpact = feedback.context.sessionTime > 1800 ? 1.2 : 0.8; // Longer sessions have more impact
      model.weights.contextWeights.sessionTime = this.updateWeight(
        model.weights.contextWeights.sessionTime,
        feedbackValue * sessionImpact,
        learningRate * 0.5
      );
    }
  }

  private getFeedbackValue(feedbackType: UserFeedback['feedbackType']): number {
    const values = {
      'implemented': 1.0,
      'helpful': 0.8,
      'partially_helpful': 0.4,
      'not_helpful': -0.2,
      'ignored': -0.5
    };
    return values[feedbackType];
  }

  private updateWeight(currentWeight: number, feedbackValue: number, learningRate: number): number {
    const adjustment = feedbackValue * learningRate;
    const newWeight = currentWeight + adjustment;
    
    // Keep weights within reasonable bounds
    return Math.max(0.1, Math.min(2.0, newWeight));
  }

  // Score recommendations using adaptive learning
  public scoreRecommendations(
    insights: MLInsight[],
    queryAnalysis: QueryAnalysis,
    userProfile: UserBehaviorProfile,
    userId: string
  ): RecommendationScore[] {
    const model = this.getUserModel(userId);
    const scores: RecommendationScore[] = [];
    
    insights.forEach(insight => {
      const score = this.calculateRecommendationScore(insight, queryAnalysis, userProfile, model);
      scores.push(score);
    });
    
    return scores.sort((a, b) => b.finalScore - a.finalScore);
  }

  private calculateRecommendationScore(
    insight: MLInsight,
    queryAnalysis: QueryAnalysis,
    userProfile: UserBehaviorProfile,
    model: PersonalizedModel
  ): RecommendationScore {
    const factors = {
      intent: 0,
      temporal: 0,
      mood: 0,
      context: 0,
      archetype: 0,
      feedback: 0
    };
    
    const explanation: string[] = [];
    
    // Intent matching
    const intentWeight = model.weights.intentWeights[queryAnalysis.intent.type] || 0.5;
    factors.intent = intentWeight;
    if (intentWeight > 1.0) explanation.push('Strong intent match');
    
    // Temporal relevance
    const currentHour = new Date().getHours();
    const temporalWeight = model.weights.temporalWeights[currentHour] || 0.5;
    factors.temporal = temporalWeight;
    if (temporalWeight > 1.0) explanation.push('Optimal timing');
    
    // Mood relevance
    let moodWeight = 1.0;
    if (queryAnalysis.intent.sentiment.label === 'negative') {
      moodWeight = model.weights.moodWeights['stressed'] || 0.6;
      explanation.push('Addresses current mood');
    } else if (queryAnalysis.intent.sentiment.label === 'positive') {
      moodWeight = model.weights.moodWeights['energized'] || 1.2;
    }
    factors.mood = moodWeight;
    
    // Context relevance
    let contextScore = 0;
    if (userProfile.patterns.length > 0) {
      contextScore += model.weights.contextWeights.recentPerformance;
      explanation.push('Based on your patterns');
    }
    factors.context = contextScore;
    
    // Archetype alignment
    const archetypeWeight = model.weights.archetypeWeights[userProfile.archetype.id] || 1.0;
    factors.archetype = archetypeWeight;
    if (archetypeWeight > 1.0) explanation.push('Matches your work style');
    
    // Historical feedback
    const feedbackScore = this.getHistoricalFeedbackScore(insight.id, model);
    factors.feedback = feedbackScore;
    if (feedbackScore > 0.8) explanation.push('Previously helpful');
    
    // Calculate final scores
    const baseScore = insight.confidence;
    const adaptiveScore = (
      factors.intent * 0.25 +
      factors.temporal * 0.15 +
      factors.mood * 0.15 +
      factors.context * 0.2 +
      factors.archetype * 0.15 +
      factors.feedback * 0.1
    );
    
    const finalScore = baseScore * (0.6 + adaptiveScore * 0.4); // Blend base and adaptive scores
    
    return {
      insightId: insight.id,
      baseScore,
      adaptiveScore,
      finalScore,
      factors,
      explanation
    };
  }

  private getHistoricalFeedbackScore(_insightId: string, model: PersonalizedModel): number {
    // This would typically look up historical feedback for similar insights
    // For now, return a baseline based on overall metrics
    return model.metrics.helpfulRatio * 0.8 + model.metrics.implementedRatio * 0.2;
  }

  // Get learning insights for the user
  public getLearningInsights(userId: string): {
    metrics: LearningMetrics;
    topPerformingIntents: string[];
    optimalTimes: number[];
    moodPreferences: Record<string, number>;
    recommendations: string[];
  } {
    const model = this.getUserModel(userId);
    const feedback = this.feedbackHistory.get(userId) || [];
    
    // Find top performing intents
    const intentPerformance = Object.entries(model.weights.intentWeights)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([intent]) => intent);
    
    // Find optimal times
    const optimalTimes = Object.entries(model.weights.temporalWeights)
      .filter(([,weight]) => weight > 1.0)
      .map(([hour]) => parseInt(hour))
      .sort((a, b) => a - b);
    
    // Mood preferences
    const moodPreferences = Object.entries(model.weights.moodWeights)
      .filter(([,weight]) => weight !== 1.0)
      .reduce((acc, [mood, weight]) => ({ ...acc, [mood]: weight }), {});
    
    // Generate recommendations
    const recommendations = this.generateLearningRecommendations(model, feedback);
    
    return {
      metrics: model.metrics,
      topPerformingIntents: intentPerformance,
      optimalTimes,
      moodPreferences,
      recommendations
    };
  }

  private generateLearningRecommendations(model: PersonalizedModel, _feedback: UserFeedback[]): string[] {
    const recommendations: string[] = [];
    
    if (model.metrics.helpfulRatio < 0.5) {
      recommendations.push('Consider providing more specific feedback to improve recommendations');
    }
    
    if (model.metrics.implementedRatio < 0.3) {
      recommendations.push('Try implementing more recommendations to see better results');
    }
    
    if (model.metrics.improvementTrend < -0.1) {
      recommendations.push('Recent feedback suggests declining satisfaction - let\'s adjust your approach');
    }
    
    if (model.confidence < 0.5) {
      recommendations.push('Continue providing feedback to help me learn your preferences better');
    }
    
    // Time-based recommendations
    const peakHours = Object.entries(model.weights.temporalWeights)
      .filter(([,weight]) => weight > 1.1)
      .map(([hour]) => parseInt(hour));
    
    if (peakHours.length > 0) {
      recommendations.push(`Your most receptive times are around ${peakHours.map(h => `${h}:00`).join(' and ')}`);
    }
    
    return recommendations;
  }

  // Export/import model for persistence
  public exportModel(userId: string): PersonalizedModel | null {
    return this.userModels.get(userId) || null;
  }

  public importModel(model: PersonalizedModel): void {
    this.userModels.set(model.userId, model);
  }

  // Reset user model
  public resetModel(userId: string): void {
    this.userModels.delete(userId);
    this.feedbackHistory.delete(userId);
  }

  // Get model statistics
  public getModelStatistics(): {
    totalUsers: number;
    averageFeedbackPerUser: number;
    averageModelConfidence: number;
    topPerformingIntents: string[];
  } {
    const models = Array.from(this.userModels.values());
    const totalFeedback = Array.from(this.feedbackHistory.values())
      .reduce((total, userFeedback) => total + userFeedback.length, 0);
    
    const intentPerformance: Record<string, number> = {};
    models.forEach(model => {
      Object.entries(model.weights.intentWeights).forEach(([intent, weight]) => {
        intentPerformance[intent] = (intentPerformance[intent] || 0) + weight;
      });
    });
    
    const topIntents = Object.entries(intentPerformance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([intent]) => intent);
    
    return {
      totalUsers: models.length,
      averageFeedbackPerUser: models.length > 0 ? totalFeedback / models.length : 0,
      averageModelConfidence: models.length > 0 
        ? models.reduce((sum, model) => sum + model.confidence, 0) / models.length 
        : 0,
      topPerformingIntents: topIntents
    };
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();
