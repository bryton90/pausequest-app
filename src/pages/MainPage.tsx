'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

// Types
type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';
type Mood = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

// Constants
const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

const MOODS: Mood[] = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: 'bg-yellow-100 border-yellow-200'
  },
  {
    id: 'neutral',
    label: 'Neutral',
    emoji: '😐',
    color: 'bg-gray-100 border-gray-200'
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: 'bg-blue-100 border-blue-200'
  },
  {
    id: 'angry',
    label: 'Angry',
    emoji: '😡',
    color: 'bg-red-100 border-red-200'
  }
];

export default function MainPage() {
  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(FOCUS_TIME);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState<boolean>(false);
  
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const startTimer = () => {
    setTimerState('running');
    previousTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  const pauseTimer = () => {
    setTimerState('paused');
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
  };

  const resetTimer = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    setTimerState('idle');
    setTimeLeft(sessionType === 'focus' ? FOCUS_TIME : BREAK_TIME);
  };

  const updateTimer = (timestamp: number) => {
    if (timerState !== 'running') return;

    if (previousTimeRef.current === null) {
      previousTimeRef.current = timestamp;
    }

    const delta = timestamp - previousTimeRef.current;
    previousTimeRef.current = timestamp;

    if (delta > 0) {
      setTimeLeft(prev => {
        const newTime = Math.max(prev - (delta / 1000), 0);
        
        if (newTime <= 0) {
          setTimerState('idle');
          setShowMoodSelector(true);
          return 0;
        }
        
        return newTime;
      });
    }

    if (timerState === 'running') {
      requestRef.current = requestAnimationFrame(updateTimer);
    }
  };

  // Toggle between focus and break
  const toggleSessionType = () => {
    const newType = sessionType === 'focus' ? 'break' : 'focus';
    setSessionType(newType);
    setTimeLeft(newType === 'focus' ? FOCUS_TIME : BREAK_TIME);
    setTimerState('idle');
  };

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Handle mood selection
  const handleMoodSelection = (mood: Mood) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
    // Here you would typically save the mood to your backend
    console.log('Selected mood:', mood);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">PauseQuest</h1>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col items-center justify-center py-8">
              {/* Timer Display */}
              <div className="relative">
                <div className="w-64 h-64 rounded-full border-8 border-blue-200 flex items-center justify-center">
                  <span className="text-5xl font-mono font-bold text-blue-900">
                    {formatTime(Math.ceil(timeLeft))}
                  </span>
                </div>
                
                {/* Timer Controls */}
                <div className="flex justify-center mt-8 space-x-4">
                  {timerState === 'running' ? (
                    <button
                      onClick={pauseTimer}
                      className="p-3 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      aria-label="Pause timer"
                    >
                      <Pause className="w-6 h-6" />
                    </button>
                  ) : (
                    <button
                      onClick={startTimer}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                      aria-label="Start timer"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  )}
                  
                  <button
                    onClick={resetTimer}
                    className="p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Session Toggle */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={toggleSessionType}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      sessionType === 'focus'
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {sessionType === 'focus' ? 'Focus' : 'Break'} Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mood Tracker */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedMood ? 'Your Mood' : 'How are you feeling?'}
              </h2>
              {selectedMood ? (
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{selectedMood.emoji}</span>
                  <div>
                    <p className="font-medium text-gray-800">{selectedMood.label}</p>
                    <button
                      onClick={() => setSelectedMood(null)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => handleMoodSelection(mood)}
                      className={`p-2 rounded-lg border-2 ${mood.color} hover:opacity-90 transition-opacity`}
                      aria-label={`Select ${mood.label} mood`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Tasks */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>
              <div className="space-y-2">
                {['Complete project', 'Review code', 'Team meeting'].map((task) => (
                  <div key={task} className="flex items-center">
                    <input
                      type="checkbox"
                      id={task}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={task} className="ml-2 text-gray-700">
                      {task}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mood Selector Modal */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">How was your session?</h3>
            <p className="text-gray-600 mb-6">Select your current mood to complete the session.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelection(mood)}
                  className={`p-4 rounded-xl border-2 ${mood.color} hover:opacity-90 transition-opacity flex flex-col items-center`}
                >
                  <span className="text-3xl mb-2">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}