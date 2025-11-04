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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Focus Timer</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <Timer 
          timeLeft={timeLeft}
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          totalTime={workDuration}
          animationType="rocket"
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Session Notes</h2>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Add notes about your focus session..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">How are you feeling?</h2>
        <div className="flex space-x-4">
          {['😊', '😐', '😕', '😫'].map((mood) => (
            <button
              key={mood}
              className={`text-3xl p-2 rounded-full ${selectedMood === mood ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
              aria-label={`Select mood: ${mood}`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimerPage;
