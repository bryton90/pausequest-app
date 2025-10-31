import React from 'react';

interface MoodTrackerProps {
  selectedMood: string | null;
  onMoodChange: (mood: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const MOODS = [
  { emoji: '😊', value: 'happy' },
  { emoji: '😐', value: 'neutral' },
  { emoji: '😢', value: 'sad' },
  { emoji: '😣', value: 'stressed' },
  { emoji: '😃', value: 'very-happy' },
];

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  selectedMood,
  onMoodChange,
  notes,
  onNotesChange,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Mood Tracking */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground tracking-wider">
          MOOD TRACKING
        </h2>
        <div className="flex gap-2 justify-center">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => onMoodChange(mood.value)}
              className={`
                w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl
                transition-colors duration-200
                ${
                  selectedMood === mood.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-green-300 dark:border-green-700 hover:border-green-400'
                }
              `}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-semibold text-foreground tracking-wider">
          NOTES:
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Type your thoughts here..."
          className="
            w-full min-h-[150px] px-4 py-3 rounded-lg
            border border-border bg-background text-foreground
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            resize-none
          "
        />
      </div>
    </div>
  );
};

