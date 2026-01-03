// Natural Language Processing Service
// Provides sophisticated text analysis for understanding user queries, sentiment, and intent

export interface Intent {
  type: 'productivity' | 'wellness' | 'focus' | 'break' | 'schedule' | 'achievement' | 'help' | 'general' | 'unknown';
  confidence: number;
  entities: Entity[];
  sentiment: SentimentScore;
}

export interface Entity {
  type: 'time' | 'duration' | 'frequency' | 'mood' | 'activity' | 'goal' | 'metric';
  value: string | number;
  confidence: number;
}

export interface SentimentScore {
  positive: number; // 0-1
  negative: number; // 0-1
  neutral: number; // 0-1
  compound: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
}

export interface QueryAnalysis {
  originalText: string;
  cleanedText: string;
  intent: Intent;
  keywords: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  urgency: 'low' | 'medium' | 'high';
  sentiment?: {
    label: 'positive' | 'negative' | 'neutral';
    score: number;
  };
  entities?: Array<{
    type: string;
    value: string | number;
  }>;
}

export interface ConversationContext {
  previousQueries: QueryAnalysis[];
  userProfile: any; // User behavior profile from ML service
  currentSessionTime?: number;
  currentMood?: string;
}

class NLPService {
  private readonly INTENT_PATTERNS = {
    productivity: {
      keywords: ['productivity', 'efficient', 'effective', 'output', 'performance', 'accomplish', 'achieve', 'complete', 'work', 'task', 'project'],
      patterns: [/how.*productiv/i, /improve.*productiv/i, /more.*productiv/i, /better.*productiv/i],
      weight: 1.0
    },
    wellness: {
      keywords: ['wellness', 'well-being', 'health', 'burnout', 'stress', 'anxiety', 'tired', 'fatigue', 'energy', 'rest', 'recover'],
      patterns: [/feeling.*tired/i, /burnout/i, /stress/i, /overwhelm/i, /need.*rest/i],
      weight: 0.9
    },
    focus: {
      keywords: ['focus', 'concentrate', 'attention', 'distraction', 'flow', 'deep work', 'zone', 'mindful'],
      patterns: [/can.*focus/i, /trouble.*focus/i, /improve.*focus/i, /stay.*focus/i, /lose.*focus/i],
      weight: 0.9
    },
    break: {
      keywords: ['break', 'rest', 'pause', 'timeout', 'recess', 'interval', 'recovery'],
      patterns: [/take.*break/i, /need.*break/i, /break.*time/i, /when.*break/i],
      weight: 0.8
    },
    schedule: {
      keywords: ['schedule', 'time', 'when', 'plan', 'routine', 'habit', 'daily', 'weekly'],
      patterns: [/best.*time/i, /when.*should/i, /schedule.*session/i, /plan.*day/i],
      weight: 0.8
    },
    achievement: {
      keywords: ['achievement', 'goal', 'target', 'milestone', 'progress', 'streak', 'points', 'stats', 'record'],
      patterns: [/reach.*goal/i, /achievement/i, /personal.*best/i, /new.*record/i],
      weight: 0.7
    },
    help: {
      keywords: ['help', 'assist', 'guide', 'how to', 'tutorial', 'explain', 'show me'],
      patterns: [/help/i, /how.*to/i, /show.*me/i, /explain/i, /assist/i],
      weight: 0.6
    },
    general: {
      keywords: ['hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye', 'ok', 'okay', 'yes', 'no'],
      patterns: [/^(hello|hi|hey)/i, /^(thanks|thank you)/i, /^(bye|goodbye)/i, /^(ok|okay)/i],
      weight: 0.5
    }
  };

  private readonly SENTIMENT_LEXICON = {
    // Positive words
    positive: {
      'great': 0.8, 'excellent': 0.9, 'amazing': 0.9, 'fantastic': 0.9, 'wonderful': 0.8,
      'good': 0.6, 'better': 0.5, 'best': 0.8, 'love': 0.9, 'enjoy': 0.7,
      'happy': 0.8, 'pleased': 0.7, 'satisfied': 0.6, 'proud': 0.8, 'excited': 0.7,
      'energetic': 0.7, 'motivated': 0.8, 'focused': 0.7, 'productive': 0.8, 'accomplished': 0.8,
      'successful': 0.8, 'winning': 0.8, 'progress': 0.6, 'improvement': 0.6, 'achievement': 0.7
    },
    // Negative words
    negative: {
      'bad': -0.7, 'terrible': -0.9, 'awful': -0.9, 'horrible': -0.9, 'worst': -0.8,
      'hate': -0.9, 'dislike': -0.6, 'frustrated': -0.7, 'annoyed': -0.6, 'angry': -0.8,
      'sad': -0.7, 'depressed': -0.8, 'unhappy': -0.7, 'disappointed': -0.7, 'worried': -0.6,
      'tired': -0.5, 'exhausted': -0.7, 'burnout': -0.8, 'stressed': -0.7, 'overwhelmed': -0.8,
      'difficult': -0.5, 'hard': -0.4, 'struggle': -0.6, 'fail': -0.7, 'failure': -0.8,
      'distracted': -0.5, 'unfocused': -0.5, 'procrastinate': -0.6, 'lazy': -0.6
    },
    // Negation words
    negators: ['not', 'no', 'never', 'none', 'nothing', 'neither', 'nor', 'cannot', "can't", "won't", "don't", "didn't", "doesn't", "isn't", "aren't", "wasn't", "weren't"],
    // Intensifiers
    intensifiers: {
      'very': 1.5, 'extremely': 2.0, 'really': 1.3, 'quite': 1.2, 'so': 1.4,
      'absolutely': 1.8, 'completely': 1.7, 'totally': 1.6, 'incredibly': 1.9,
      'slightly': 0.8, 'somewhat': 0.7, 'a bit': 0.6, 'kind of': 0.5
    }
  };

  private readonly ENTITY_PATTERNS = {
    time: {
      patterns: [/(\d{1,2}):(\d{2})\s*(am|pm)?/i, /(\d{1,2})\s*(am|pm)/i, /(morning|afternoon|evening|night|noon|midnight)/i],
      extract: (match: RegExpMatchArray) => match[0]
    },
    duration: {
      patterns: [/(\d+)\s*(minutes?|mins?|hours?|hrs?)\s*(long|duration)?/i, /(\d+)\s*min/i, /(\d+)\s*hr/i],
      extract: (match: RegExpMatchArray) => parseInt(match[1] || '0')
    },
    frequency: {
      patterns: [/(\d+)\s*(times?|sessions?|days?|weeks?)/i, /(daily|weekly|monthly|often|rarely|sometimes|always|never)/i],
      extract: (match: RegExpMatchArray) => match[0]
    },
    mood: {
      patterns: [/(tired|energetic|focused|distracted|stressed|relaxed|happy|sad|motivated|unmotivated)/i],
      extract: (match: RegExpMatchArray) => match[0].toLowerCase()
    },
    activity: {
      patterns: [/(work|study|read|write|code|meeting|exercise|meditate|break)/i],
      extract: (match: RegExpMatchArray) => match[0].toLowerCase()
    },
    metric: {
      patterns: [/(points|streak|sessions?|hours?|minutes?|productivity|efficiency|score)/i],
      extract: (match: RegExpMatchArray) => match[0].toLowerCase()
    },
    goal: {
      patterns: [/(goal|target|objective|aim|mission|purpose)/i],
      extract: (match: RegExpMatchArray) => match[0].toLowerCase()
    }
  };

  // Main text analysis method
  public analyzeQuery(text: string, context?: ConversationContext): QueryAnalysis {
    const cleanedText = this.cleanText(text);
    const intent = this.extractIntent(cleanedText, context);
    const keywords = this.extractKeywords(cleanedText);
    const complexity = this.assessComplexity(cleanedText, keywords);
    const urgency = this.assessUrgency(cleanedText, intent);

    return {
      originalText: text,
      cleanedText,
      intent,
      keywords,
      complexity,
      urgency
    };
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private extractIntent(text: string, context?: ConversationContext): Intent {
    const intentScores: Record<string, number> = {};
    const entities: Entity[] = [];
    
    // Score each intent type
    Object.entries(this.INTENT_PATTERNS).forEach(([intentType, pattern]) => {
      let score = 0;
      
      // Keyword matching
      pattern.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += pattern.weight;
        }
      });
      
      // Pattern matching
      pattern.patterns.forEach(regex => {
        if (regex.test(text)) {
          score += pattern.weight * 1.2; // Boost pattern matches
        }
      });
      
      // Contextual boosting
      if (context) {
        score += this.getContextualBoost(intentType, context, text);
      }
      
      intentScores[intentType] = score;
    });
    
    // Find best intent
    const bestIntent = Object.entries(intentScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Fallback to unknown intent if no matches found
    if (!bestIntent) {
      return {
        type: 'unknown' as Intent['type'],
        confidence: 0,
        entities: [],
        sentiment: {
          positive: 0,
          negative: 0,
          neutral: 1,
          compound: 0,
          label: 'neutral' as const
        }
      };
    }
    
    const intentType = bestIntent[0] as Intent['type'];
    const confidence = Math.min(1.0, bestIntent[1] / 3); // Normalize confidence
    
    // Extract entities
    const extractedEntities = this.extractEntities(text);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(text);
    
    return {
      type: intentType,
      confidence,
      entities: extractedEntities,
      sentiment
    };
  }

  private getContextualBoost(intentType: string, context: ConversationContext, text: string): number {
    let boost = 0;
    
    // Boost based on previous queries
    if (context.previousQueries.length > 0) {
      const recentIntents = context.previousQueries.slice(-3).map(q => q.intent.type);
      if (recentIntents.includes(intentType as Intent['type'])) {
        boost += 0.2; // Boost if recently discussed
      }
    }
    
    // Boost based on user profile
    if (context.userProfile) {
      if (intentType === 'wellness' && context.userProfile.archetype?.id === 'burst-worker') {
        boost += 0.1; // Burst workers might need more wellness advice
      }
    }
    
    // Boost based on current state
    if (context.currentMood) {
      if (intentType === 'wellness' && ['tired', 'stressed'].includes(context.currentMood)) {
        boost += 0.3;
      }
      if (intentType === 'focus' && context.currentMood === 'distracted') {
        boost += 0.3;
      }
    }
    
    return boost;
  }

  private extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];
    
    Object.entries(this.ENTITY_PATTERNS).forEach(([entityType, pattern]) => {
      pattern.patterns.forEach(regex => {
        const matches = text.match(regex);
        if (matches) {
          const value = pattern.extract(matches);
          entities.push({
            type: entityType as Entity['type'],
            value,
            confidence: 0.8
          });
        }
      });
    });
    
    return entities;
  }

  private analyzeSentiment(text: string): SentimentScore {
    const words = text.split(/\s+/);
    let positive = 0;
    let negative = 0;
    let negation = false;
    let intensifier = 1.0;
    
    words.forEach((word, index) => {
      const lowerWord = word.toLowerCase();
      
      // Check for negation
      if (this.SENTIMENT_LEXICON.negators.includes(lowerWord)) {
        negation = true;
        return;
      }
      
      // Check for intensifiers
      if (lowerWord in this.SENTIMENT_LEXICON.intensifiers) {
        intensifier = this.SENTIMENT_LEXICON.intensifiers[lowerWord as keyof typeof this.SENTIMENT_LEXICON.intensifiers];
        return;
      }
      
      // Check positive words
      if (lowerWord in this.SENTIMENT_LEXICON.positive) {
        const score = this.SENTIMENT_LEXICON.positive[lowerWord as keyof typeof this.SENTIMENT_LEXICON.positive] * intensifier;
        positive += negation ? -score : score;
        negation = false;
        intensifier = 1.0;
      }
      
      // Check negative words
      if (lowerWord in this.SENTIMENT_LEXICON.negative) {
        const score = this.SENTIMENT_LEXICON.negative[lowerWord as keyof typeof this.SENTIMENT_LEXICON.negative] * intensifier;
        negative += negation ? -score : score;
        negation = false;
        intensifier = 1.0;
      }
    });
    
    // Normalize scores
    const total = Math.abs(positive) + Math.abs(negative);
    const normalizedPositive = total > 0 ? Math.abs(positive) / total : 0.33;
    const normalizedNegative = total > 0 ? Math.abs(negative) / total : 0.33;
    const normalizedNeutral = Math.max(0, 1 - normalizedPositive - normalizedNegative);
    
    // Calculate compound score
    const compound = (positive - negative) / Math.max(1, words.length / 10);
    
    // Determine label
    let label: SentimentScore['label'] = 'neutral';
    if (compound > 0.1) label = 'positive';
    else if (compound < -0.1) label = 'negative';
    
    return {
      positive: normalizedPositive,
      negative: normalizedNegative,
      neutral: normalizedNeutral,
      compound: Math.max(-1, Math.min(1, compound)),
      label
    };
  }

  private extractKeywords(text: string): string[] {
    const words = text.split(/\s+/);
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
      'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this',
      'it', 'from', 'be', 'are', 'been', 'was', 'were', 'will', 'would',
      'could', 'should', 'may', 'might', 'can', 'shall', 'must', 'do',
      'does', 'did', 'have', 'has', 'had', 'i', 'you', 'he', 'she',
      'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your',
      'his', 'its', 'our', 'their'
    ]);
    
    return words
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
      .slice(0, 10); // Limit to top 10 keywords
  }

  private assessComplexity(text: string, keywords: string[]): QueryAnalysis['complexity'] {
    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.split(/\s+/)).size;
    const lexicalDiversity = uniqueWords / wordCount;
    
    if (wordCount <= 5 && lexicalDiversity <= 0.6) {
      return 'simple';
    } else if (wordCount <= 12 && lexicalDiversity <= 0.8) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  private assessUrgency(text: string, intent: Intent): QueryAnalysis['urgency'] {
    const urgencyWords = ['urgent', 'immediately', 'now', 'asap', 'quickly', 'help', 'problem', 'issue', 'stuck'];
    const hasUrgencyWords = urgencyWords.some(word => text.includes(word));
    
    if (hasUrgencyWords || (intent.type === 'help' && intent.sentiment.negative > 0.5)) {
      return 'high';
    } else if (intent.type === 'wellness' && intent.sentiment.negative > 0.3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Generate contextual response suggestions
  public generateResponseSuggestions(analysis: QueryAnalysis, context?: ConversationContext): string[] {
    let suggestions: string[] = [];
    const { intent, sentiment, entities, urgency } = analysis;
    
    // Base suggestions by intent
    switch (intent.type) {
      case 'productivity':
        suggestions.push(
          'Based on your recent sessions, here are personalized productivity strategies...',
          'Let me analyze your work patterns to suggest optimization techniques...',
          'I can help you boost your productivity with data-driven insights...'
        );
        break;
      
      case 'wellness':
        suggestions.push(
          'I notice you might need some wellness support. Let me suggest recovery strategies...',
          'Your well-being is important. Here are some personalized recommendations...',
          'Based on your current patterns, let me help you avoid burnout...'
        );
        break;
      
      case 'focus':
        suggestions.push(
          'Let me help you improve your focus with proven techniques...',
          'I can analyze your focus patterns to suggest optimal strategies...',
          'Based on your sessions, here are ways to enhance concentration...'
        );
        break;
      
      case 'break':
        suggestions.push(
          'Timing your breaks correctly is crucial. Let me suggest optimal patterns...',
          'I can help you optimize your break schedule for maximum recovery...',
          'Based on your work patterns, here are personalized break recommendations...'
        );
        break;
      
      case 'help':
        suggestions.push(
          'I\'m here to help! What specific challenge are you facing?',
          'Let me provide you with personalized guidance...',
          'I can assist you with various aspects of your productivity journey...'
        );
        break;
    }
    
    // Adjust suggestions based on sentiment
    if (sentiment?.label === 'negative') {
      suggestions.unshift('I\'m here to help you feel better. Let\'s work through this together...');
    } else if (sentiment?.label === 'positive') {
      suggestions.unshift('Great to hear your positive attitude! Let\'s build on this momentum...');
    }
    
    // Adjust for urgency
    if (urgency === 'high') {
      suggestions = suggestions.map(s => s.replace('...', ' right away!'));
    }
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  // Query expansion for better understanding
  public expandQuery(analysis: QueryAnalysis): string[] {
    const expansions: string[] = [];
    const { intent, entities, keywords } = analysis;
    
    // Expand based on intent
    if (intent.type === 'productivity') {
      expansions.push('efficiency', 'output', 'performance', 'time management');
    } else if (intent.type === 'wellness') {
      expansions.push('health', 'burnout prevention', 'stress management', 'work-life balance');
    } else if (intent.type === 'focus') {
      expansions.push('concentration', 'attention', 'deep work', 'flow state');
    }
    
    // Expand based on entities
    if (entities) {
      entities.forEach(entity => {
        if (entity.type === 'mood' && typeof entity.value === 'string') {
          if (entity.value === 'tired') {
            expansions.push('energy', 'fatigue', 'rest', 'recovery');
          } else if (entity.value === 'stressed') {
            expansions.push('anxiety', 'pressure', 'overwhelm', 'relaxation');
          }
        }
      });
    }
    
    return [...keywords, ...expansions].slice(0, 15);
  }
}

export const nlpService = new NLPService();
