import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Timer } from '../components/Timer/Timer';
import { useTimer } from '../hooks/useTimer';

const TimerPage: React.FC = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600">
          <h1 className="text-2xl font-bold text-white text-center">PauseQuest</h1>
        </div>
        
        {/* Timer Section */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </h2>
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
              {['😊', '😐', '😕', '😫'].map((mood) => (
                <button
                  key={mood}
                  className={`text-4xl p-2 rounded-full transition-all ${selectedMood === mood 
                    ? 'scale-110 bg-blue-100 dark:bg-blue-900' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                  onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
                  aria-label={`Select mood: ${mood}`}
                >
                  {mood}
                </button>
              ))}
            </div>
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
    </div>
  );
};

export default TimerPage;
