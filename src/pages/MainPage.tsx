'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import { useSettings } from '../contexts/SettingsContext';

interface Mood {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

// Constants
const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

const MOODS: Mood[] = [
  {
    id: 'happy',
    label: 'Happy',
    emoji: '😊',
    color: 'bg-yellow-100 border-yellow-200',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    emoji: '😐',
    color: 'bg-gray-100 border-gray-200',
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😢',
    color: 'bg-blue-100 border-blue-200',
  },
  {
    id: 'angry',
    label: 'Angry',
    emoji: '😡',
    color: 'bg-red-100 border-red-200',
  },
];

const MainPage = () => {
  // Use global timer state
  const { state, toggleTimer, resetTimer, setSessionType, formatTime } = useTimer();
  
  // Use settings for timer visualization
  const { timerSettings, getCurrentTimerPreset } = useSettings();
  const currentPreset = getCurrentTimerPreset();
  
  // Local state for mood tracking
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState<boolean>(false);
  const [showSessionComplete, setShowSessionComplete] = useState<boolean>(false);

  // Timer visualization component
  const renderTimerDisplay = () => {
    // Calculate progress for animations (0 to 1)
    const currentPreset = getCurrentTimerPreset();
    const totalTime = state.sessionType === 'focus' ? currentPreset.workDuration : currentPreset.breakDuration;
    const progress = (totalTime - state.timeLeft) / totalTime;
    
    switch (timerSettings.visualization) {
      case 'rocket':
        return (
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="text-8xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 tracking-tight">
                {formatTime(state.timeLeft)}
              </div>
              <div className="relative text-4xl mb-2">
                <div 
                  className="transition-all duration-1000 ease-out"
                  style={{
                    transform: `translateY(${progress * -20}px) scale(${1 + progress * 0.2})`,
                    opacity: 0.8 + progress * 0.2,
                  }}
                >
                  🚀
                </div>
                {/* Rocket exhaust effect */}
                {state.isRunning && (
                  <div 
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 text-2xl transition-opacity duration-300"
                    style={{
                      opacity: Math.max(0, 1 - progress),
                      filter: `blur(${progress * 2}px)`,
                    }}
                  >
                    🔥
                  </div>
                )}
              </div>
            </div>
            <div className="text-xl font-medium text-text-secondary">
              {state.sessionType === 'focus' ? '🎯 Time to focus!' : '☕ Take a break!'}
            </div>
          </div>
        );
      
      case 'coffee':
        return (
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="text-8xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4 tracking-tight">
                {formatTime(state.timeLeft)}
              </div>
              <div className="relative text-4xl mb-2">
                <div className="relative">
                  ☕
                  {/* Steam animation */}
                  {state.isRunning && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="text-2xl transition-all duration-1000"
                        style={{
                          opacity: Math.max(0, 1 - progress),
                          transform: `translateY(${-progress * 30}px) scale(${1 + progress * 0.5})`,
                        }}
                      >
                        💨
                      </div>
                      <div 
                        className="text-xl absolute top-0 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-300"
                        style={{
                          opacity: Math.max(0, 0.8 - progress),
                          transform: `translateY(${-progress * 25}px) scale(${1 + progress * 0.3})`,
                        }}
                      >
                        💨
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xl font-medium text-text-secondary">
              {state.sessionType === 'focus' ? '🎯 Time to focus!' : '☕ Take a break!'}
            </div>
          </div>
        );
      
      case 'digital':
      default:
        return (
          <div className="text-center mb-8">
            <div className="text-8xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 tracking-tight">
              {formatTime(state.timeLeft)}
            </div>
            <div className="text-xl font-medium text-text-secondary">
              {state.sessionType === 'focus' ? '🎯 Time to focus!' : '☕ Take a break!'}
            </div>
          </div>
        );
    }
  };

  // Show session completion notification
  useEffect(() => {
    if (state.timeLeft === 0) {
      setShowSessionComplete(true);
      setTimeout(() => setShowSessionComplete(false), 3000);
    }
  }, [state.timeLeft]);


  // Handle mood selection
  const handleMoodSelection = (mood: Mood) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
    console.log('Selected mood:', mood);
  };

  return (
    <div className="min-h-screen bg-bg-color">
      {/* Mood Selector Modal */}
      {showMoodSelector && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">How was your session?</h3>
            <p className="text-gray-600 mb-6">Select your current mood to complete the session.</p>
            <div className="grid grid-cols-2 gap-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelection(mood)}
                  className={`p-6 rounded-2xl border-2 ${mood.color} hover:scale-105 transition-all duration-200 flex flex-col items-center shadow-lg hover:shadow-xl`}
                >
                  <span className="text-4xl mb-2">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
            {/* Add close button for debugging */}
            <button 
              onClick={() => setShowMoodSelector(false)}
              className="mt-4 w-full bg-red-500 text-white p-2 rounded"
            >
              Close Modal
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-6">
        {/* Session Status */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-lg">
            {state.sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
            {state.completedSessions > 0 && ` • ${state.completedSessions} session${state.completedSessions > 1 ? 's' : ''} completed`}
          </p>
        </div>

        {showSessionComplete && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center">
            <p className="text-green-800 font-medium">
              {state.sessionType === 'break' ? '🎉 Focus session completed! Take a break.' : '⚡ Break time is over! Ready to focus?'}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Timer Section */}
          <div className="lg:col-span-2">
            <div className="bg-bg-secondary backdrop-blur-md rounded-3xl shadow-xl p-8 border border-border-color">
              {/* Timer Display */}
              {renderTimerDisplay()}

              {/* Controls */}
              <div className="flex justify-center space-x-6 mb-8">
                <button
                  onClick={toggleTimer}
                  className="w-20 h-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center"
                  style={{ cursor: 'pointer' }}
                >
                  {state.isRunning ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-8 h-8" />
                </button>
              </div>
              
              {/* Session Type Toggle */}
              <div className="flex justify-center">
                <div className="inline-flex rounded-2xl bg-gray-100 p-1">
                  <button
                    onClick={() => setSessionType('focus')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      state.sessionType === 'focus' 
                        ? 'bg-white text-indigo-600 shadow-md' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🎯 Focus ({Math.floor(currentPreset.workDuration / 60)} min)
                  </button>
                  <button
                    onClick={() => setSessionType('break')}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      state.sessionType === 'break' 
                        ? 'bg-white text-green-600 shadow-md' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    ☕ Break ({Math.floor(currentPreset.breakDuration / 60)} min)
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mood Tracker */}
            <div className="bg-bg-secondary backdrop-blur-md rounded-3xl p-6 shadow-xl border border-border-color">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                {selectedMood ? 'Your Mood' : 'How are you feeling?'}
              </h2>
              {selectedMood && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-bg-color rounded-2xl">
                  <span className="text-4xl">{selectedMood.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{selectedMood.label}</p>
                    <button
                      onClick={() => setSelectedMood(null)}
                      className="text-sm text-primary hover:text-primary-dark font-medium"
                    >
                      Change mood
                    </button>
                  </div>
                </div>
              )} 

              {!selectedMood && (
                <div className="grid grid-cols-4 gap-3">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => handleMoodSelection(mood)}
                      className={`p-3 rounded-xl border-2 ${mood.color} hover:scale-110 transition-all duration-200 flex flex-col items-center shadow-md hover:shadow-lg`}
                      aria-label={`Select ${mood.label} mood`}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks */}
            <div className="bg-bg-secondary backdrop-blur-md rounded-3xl p-6 shadow-xl border border-border-color">
              <h2 className="text-xl font-bold text-text-primary mb-4">Today's Tasks</h2>
              <div className="space-y-3">
                {['Complete project', 'Review code', 'Team meeting'].map((task) => (
                  <label key={task} className="flex items-center p-3 rounded-xl hover:bg-bg-hover cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      className="h-5 w-5 text-primary rounded-lg border-border-color focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-3 text-text-primary font-medium">{task}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );};

export default MainPage;
