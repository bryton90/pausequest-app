import { BreakType } from '../hooks/useBreakTypes';

export interface MoodEntry {
  mood: string;
  emoji: string;
  description: string;
}

export const MOOD_OPTIONS: MoodEntry[] = [
  { mood: 'energized', emoji: '⚡', description: 'Feeling productive and full of energy' },
  { mood: 'focused', emoji: '🎯', description: 'In the zone and concentrated' },
  { mood: 'tired', emoji: '😴', description: 'Feeling low on energy' },
  { mood: 'stressed', emoji: '😫', description: 'Feeling overwhelmed or anxious' },
  { mood: 'balanced', emoji: '☯️', description: 'Feeling calm and centered' },
  { mood: 'distracted', emoji: '🤯', description: 'Having trouble focusing' },
];

export const BREAK_SUGGESTIONS: Record<string, { type: string; description: string }[]> = {
  energized: [
    { type: 'stretch', description: 'Try some light stretching to maintain your energy' },
    { type: 'water', description: 'Stay hydrated to keep your energy levels up' },
  ],
  focused: [
    { type: 'eye_break', description: 'Rest your eyes with the 20-20-20 rule' },
    { type: 'breathe', description: 'Take 5 deep breaths to stay focused' },
  ],
  tired: [
    { type: 'coffee', description: 'A short coffee break might help' },
    { type: 'walk', description: 'A quick walk can boost your energy' },
  ],
  stressed: [
    { type: 'meditation', description: 'Try a 2-minute meditation' },
    { type: 'breathe', description: 'Deep breathing can help reduce stress' },
  ],
  balanced: [
    { type: 'water', description: 'Stay hydrated' },
    { type: 'stretch', description: 'A quick stretch can be refreshing' },
  ],
  distracted: [
    { type: 'focus', description: 'Try a quick focus exercise' },
    { type: 'walk', description: 'A short walk can help clear your mind' },
  ],
};

export const getBreakSuggestion = (mood: string) => {
  const suggestions = BREAK_SUGGESTIONS[mood] || [
    { type: 'stretch', description: 'Take a quick stretch break' },
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};

export const analyzePatterns = (sessions: any[]) => {
  if (sessions.length === 0) return null;
  
  // Simple pattern analysis - can be enhanced with more sophisticated algorithms
  const moodCounts: Record<string, number> = {};
  let totalScore = 0;
  
  sessions.forEach(session => {
    if (session.mood) {
      moodCounts[session.mood] = (moodCounts[session.mood] || 0) + 1;
    }
    if (session.sentiment_score) {
      totalScore += session.sentiment_score;
    }
  });
  
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const averageSentiment = totalScore / sessions.length;
  
  return {
    mostCommonMood,
    averageSentiment,
    suggestion: getMoodBasedSuggestion(mostCommonMood, averageSentiment)
  };
};

const getMoodBasedSuggestion = (mood: string | undefined, sentiment: number) => {
  if (!mood) return 'Consider taking regular breaks to maintain focus';
  
  const suggestions: Record<string, string> = {
    tired: 'Your energy seems low. Try taking more frequent short breaks.',
    stressed: 'You seem stressed. Consider more frequent mindfulness breaks.',
    distracted: 'Try the Pomodoro technique to improve focus.',
    focused: 'Great focus! Keep taking regular breaks to maintain this state.',
    energized: 'Good energy! Channel it productively with focused work sessions.',
    balanced: 'You\'re doing well! Maintain this balance with consistent breaks.'
  };
  
  return suggestions[mood] || 'Consider taking regular breaks to maintain focus';
};
