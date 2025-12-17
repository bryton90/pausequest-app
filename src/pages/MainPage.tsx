'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import { playSound } from '@/utils/sounds';

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'break';

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
  // Session state
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [showSessionComplete, setShowSessionComplete] = useState<boolean>(false);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle session completion
  const handleSessionComplete = useCallback(() => {
    playSound('complete');
    setShowSessionComplete(true);
    
    setTimeout(() => setShowSessionComplete(false), 3000);
    
    const nextSessionType = sessionType === 'focus' ? 'break' : 'focus';
    setSessionType(nextSessionType);
    
    if (sessionType === 'focus') {
      setCompletedSessions(prev => prev + 1);
    }
    
    timer.resetTimer(nextSessionType === 'focus' ? FOCUS_TIME : BREAK_TIME);
  }, [sessionType]);

  // Initialize timer
  const timer = useTimer({
    initialTime: FOCUS_TIME,
    onTimeEnd: handleSessionComplete,
    tickIntervalMs: 200,
  });

  // Timer controls
  const toggleTimer = () => {
    if (timer.isRunning) {
      timer.stopTimer();
    } else {
      playSound('start');
      timer.startTimer();
    }
  };

  const resetTimer = useCallback(() => {
    timer.resetTimer(sessionType === 'focus' ? FOCUS_TIME : BREAK_TIME);
  }, [sessionType, timer]);

  // Handle session type change
  useEffect(() => {
    resetTimer();
  }, [sessionType, resetTimer]);
  
  // Handle timer completion
  useEffect(() => {
    if (timer.timeLeft <= 0 && timer.isRunning) {
      timer.stopTimer();
      setShowMoodSelector(true);
    }
  }, [timer.timeLeft, timer.isRunning, timer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        timer.stopTimer();
      }
    };
  }, [timer]);

  // Handle mood selection
  const handleMoodSelection = (mood: Mood) => {
    setSelectedMood(mood);
    setShowMoodSelector(false);
    console.log('Selected mood:', mood);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
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

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Main Timer Section */}
        <div className="md:col-span-2">
          <div className="w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Session Info */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">PauseQuest</h1>
              <div className="text-sm text-gray-500 mb-4">
                {sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
                {completedSessions > 0 && ` • ${completedSessions} session${completedSessions > 1 ? 's' : ''} completed`}
              </div>
              
              {showSessionComplete && (
                <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md">
                  {sessionType === 'break' ? 'Focus session completed! Take a break.' : 'Break time is over! Ready to focus?'}
                </div>
              )}
            </div>

            {/* Timer Display */}
            <div className="text-center">
              <div className="text-7xl font-bold text-gray-800 mb-2">
                {formatTime(timer.timeLeft)}
              </div>
              <div className="text-lg font-medium text-gray-500">
                {sessionType === 'focus' ? 'Time to focus!' : 'Take a break!'}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleTimer}
                className={`flex items-center justify-center w-16 h-16 rounded-full ${
                  timer.isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
                } text-white transition-colors`}
                aria-label={timer.isRunning ? 'Pause timer' : 'Start timer'}
              >
                {timer.isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
            
            {/* Session Type Toggle */}
            <div className="flex justify-center space-x-4 mt-2">
            </div>
          </div>
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
    )
    <div className="max-w-md mx-auto">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Session Info */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">PauseQuest</h1>
          <div className="text-sm text-gray-500 mb-4">
            {sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
            {completedSessions > 0 && ` • ${completedSessions} session${completedSessions > 1 ? 's' : ''} completed`}
          </div>
          {showSessionComplete && (
            <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md">
              {sessionType === 'break' ? 'Focus session completed! Take a break.' : 'Break time is over! Ready to focus?'}
            </div>
          )}
        </div>

        {/* Timer Display */}
        <div className="text-center">
          <div className="text-7xl font-bold text-gray-800 mb-2">
            {formatTime(timer.timeLeft)}
          </div>
          <div className="text-lg font-medium text-gray-500">
            {sessionType === 'focus' ? 'Time to focus!' : 'Take a break!'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center w-16 h-16 rounded-full ${timer.isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
            aria-label={timer.isRunning ? 'Pause timer' : 'Start timer'}
          >
            {timer.isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
        
        {/* Session Type Toggle */}
        <div className="flex justify-center space-x-4 mt-2">
          <button
            onClick={() => setSessionType('focus')}
            className={`px-4 py-2 rounded-lg ${sessionType === 'focus' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Focus ({Math.floor(FOCUS_TIME / 60)} min)
          </button>
          <button
            onClick={() => setSessionType('break')}
            className={`px-4 py-2 rounded-lg ${sessionType === 'break' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Break ({Math.floor(BREAK_TIME / 60)} min)
          </button>
        </div>
      </div>
    </div>
    <div className="space-y-6">
      {/* Mood Tracker */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {selectedMood ? 'Your Mood' : 'How are you feeling?'}
        </h2>
        {selectedMood && (
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
        )} 

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
  </div>
)};

export default MainPage;
