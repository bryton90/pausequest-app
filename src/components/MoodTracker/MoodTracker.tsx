import React, { useState, useEffect } from 'react';
import { MOOD_OPTIONS, getBreakSuggestion, MoodEntry } from '../../services/aiService';

interface MoodTrackerProps {
  selectedMood: string | null;
  onMoodChange: (mood: string, emoji: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onSuggestion?: (suggestion: { type: string; description: string }) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  selectedMood,
  onMoodChange,
  notes,
  onNotesChange,
  onSuggestion,
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodEntry | null>(null);

  useEffect(() => {
    if (selectedMood) {
      const moodData = MOOD_OPTIONS.find(m => m.mood === selectedMood) || null;
      setCurrentMood(moodData);
      
      if (moodData && onSuggestion) {
        const suggestion = getBreakSuggestion(moodData.mood);
        onSuggestion(suggestion);
        setShowSuggestion(true);
      }
    }
  }, [selectedMood, onSuggestion]);

  const handleMoodClick = (mood: MoodEntry) => {
    onMoodChange(mood.mood, mood.emoji);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Mood Tracking */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground tracking-wider">
          HOW ARE YOU FEELING?
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.mood}
              onClick={() => handleMoodClick(mood)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl
                transition-all duration-200 border-2
                ${
                  selectedMood === mood.mood
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }
              `}
            >
              <span className="text-3xl mb-2">{mood.emoji}</span>
              <span className="text-sm font-medium capitalize">
                {mood.mood.replace('-', ' ')}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                {mood.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Suggestion */}
      {showSuggestion && currentMood && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <span>💡 Suggestion for {currentMood.mood}</span>
          </h3>
          <p className="mt-1 text-blue-700 dark:text-blue-300 text-sm">
            {getBreakSuggestion(currentMood.mood).description}
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-semibold text-foreground tracking-wider">
          NOTES (OPTIONAL):
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="What's on your mind? Any patterns you're noticing?"
          className="
            w-full min-h-[120px] px-4 py-3 rounded-lg
            border border-border bg-background text-foreground
            placeholder:text-muted-foreground/60
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            resize-none text-sm
          "
        />
      </div>
    </div>
  );
};

