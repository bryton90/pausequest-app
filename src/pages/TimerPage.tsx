import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTimer } from '../hooks/useTimer';
import TimerVisualization from '../components/TimerVisualization';
import { useSettings } from '../contexts/SettingsContext';
import SettingsPanel from '../components/SettingsPanel';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'text-yellow-400' },
  { emoji: '😐', label: 'Neutral', color: 'text-gray-400' },
  { emoji: '😕', label: 'Unsure', color: 'text-blue-400' },
  { emoji: '😫', label: 'Tired', color: 'text-red-400' },
];

const TimerPage: React.FC = () => {
  const { user } = useAuth();
  const { timerVisualization, showMoodAvatars } = useSettings();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  // Default to 25 minutes if no user preferences are set
  const workDuration = user?.preferences?.workDuration || 25 * 60;
  
  const {
    timeLeft,
    isRunning: timerRunning,
    startTimer,
    stopTimer,
    resetTimer
  } = useTimer({
    initialTime: workDuration,
    onTimeEnd: () => {
      // Play a sound or show a notification when the timer ends
      new Audio('/notification.mp3').play().catch(e => console.error('Error playing sound:', e));
    }
  });

  const handleStart = useCallback(() => {
    startTimer();
    setIsRunning(true);
  }, [startTimer]);

  const handleStop = useCallback(() => {
    stopTimer();
    setIsRunning(false);
  }, [stopTimer]);

  const handleReset = useCallback(() => {
    resetTimer(workDuration);
    setIsRunning(false);
    setSelectedMood(null);
    setNotes('');
  }, [resetTimer, workDuration]);

  const handleSaveNotes = useCallback(() => {
    console.log('Notes submitted:', notes);
    // Add your save logic here
  }, [notes]);

  const progress = 1 - timeLeft / workDuration;
  const currentMood = useMemo(() => {
    return MOODS.find(mood => mood.emoji === selectedMood) || null;
  }, [selectedMood]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Mood follows action</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Settings"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        {/* Timer Section */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="flex flex-col items-center justify-center">
              <TimerVisualization 
                type={timerVisualization} 
                progress={progress} 
                size={200} 
                className="mb-4"
              />
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </h2>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  Stop
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
          
          {/* Mood Section */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">How are you feeling?</h2>
            <div className="flex justify-between">
              {MOODS.map((mood) => (
                <button
                  key={mood.emoji}
                  className={`text-4xl p-2 rounded-full transition-all ${selectedMood === mood.emoji 
                    ? `scale-110 ${mood.color} bg-opacity-20 dark:bg-opacity-20 p-3` 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  onClick={() => setSelectedMood(mood.emoji === selectedMood ? null : mood.emoji)}
                  aria-label={`Select mood: ${mood.label}`}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
            
            {showMoodAvatars && selectedMood && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {currentMood?.label} Mode Activated!
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-6xl">{currentMood?.emoji}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getMoodMessage(currentMood?.emoji)}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Notes Section */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes</h2>
            <textarea
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={4}
              placeholder="Add notes about your focus session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={handleSaveNotes}
              disabled={!notes.trim()}
              className={`w-full mt-3 py-2 px-4 rounded-lg font-medium transition-colors ${
                notes.trim() 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              }`}
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
      
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

function getMoodMessage(emoji: string | undefined): string {
  switch (emoji) {
    case '😊':
      return "You're doing great! Keep up the good work and stay positive!";
    case '😐':
      return "Feeling neutral? Take a deep breath and find your focus.";
    case '😕':
      return "Need a break? Try some deep breathing or a quick stretch.";
    case '😫':
      return "Feeling tired? Consider taking a short break to recharge.";
    default:
      return "How are you feeling today?";
  }
}

export default TimerPage;
