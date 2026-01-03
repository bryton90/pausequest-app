import React, { useState, useCallback, useEffect, useMemo, useRef, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createSession, getSessionHistory as fetchSessionHistory } from '../lib/services/sessionService';
import { scheduleBreakReminder } from '../lib/services/notificationService';
import { scheduleSmartReminder } from '../lib/actions/smartReminder.action';
import { useSettings } from '../contexts/SettingsContext';
import { useGamification } from '../contexts/GamificationContext';
import { useSmartScheduler } from '../contexts/SmartSchedulerContext';
import Visualizer from '../components/Visualizer';
import UpcomingBreaks from '../components/UpcomingBreaks';
import { analyzePatterns } from '../services/aiService';
import { MoodTracker } from '../components/MoodTracker/MoodTracker';
import GamificationStats from '../components/GamificationStats';
import SettingsPanel from '../components/SettingsPanel';
import GamificationBanner from '../components/GamificationBanner';
import TimerPageTabs from '../components/TimerPageTabs';
import { useTimer } from '../hooks/useTimer';
import Timer from '../components/Timer/Timer';

type TimerVisualization = 'rocket' | 'coffee' | 'digital';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'text-yellow-400' },
  { emoji: '😐', label: 'Neutral', color: 'text-gray-400' },
  { emoji: '😕', label: 'Unsure', color: 'text-blue-400' },
  { emoji: '😫', label: 'Tired', color: 'text-red-400' },
];

// Memoized MoodButton component to prevent unnecessary re-renders
const MoodButton = memo(({ emoji, label, color, isSelected, onClick }: { 
  emoji: string; 
  label: string; 
  color: string; 
  isSelected: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`text-4xl p-4 rounded-full transition-all duration-200 ${color} ${
      isSelected ? 'ring-4 ring-offset-2 ring-blue-400 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'
    }`}
    aria-label={`Select ${label} mood`}
    aria-pressed={isSelected}
  >
    {emoji}
  </button>
));

MoodButton.displayName = 'MoodButton';

// Main TimerPage component with optimized rendering
const TimerPage: React.FC = () => {
  // Get current time of day
  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };
  
  const [timeOfDay] = useState(getTimeOfDay());
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodEmoji, setMoodEmoji] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{type: string; description: string} | null>(null);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<{
    mostCommonMood: string | null;
    averageSentiment: number;
    suggestion: string;
  } | null>(null);
  const { user } = useAuth();
  const { 
    timerSettings: { visualization: timerVisualization },
    showMoodAvatars,
    setTimerVisualization,
    toggleMoodAvatars,
    enableVisualEffects,
    toggleVisualEffects
  } = useSettings();
  
  const [currentVisualization, setCurrentVisualization] = useState<TimerVisualization>(
    timerVisualization as TimerVisualization
  );
  
  useEffect(() => {
    setCurrentVisualization(timerVisualization as TimerVisualization);
  }, [timerVisualization]);
  const { addXp, checkForAchievements, stats } = useGamification();
  const { 
    upcomingBreaks, 
    isBreakTime, 
    currentBreak, 
    completeWorkSession: completeSchedulerWorkSession,
    completeBreak: completeSchedulerBreak
  } = useSmartScheduler();
  // Default to 25 minutes if no user preferences are set
  const workDuration = (user?.preferences as any)?.workDuration || 25 * 60;
  
  const {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    setTime: setTimerTime
  } = useTimer({
    initialTime: workDuration * 1000, 
    tickIntervalMs: 200, 
    onTimeEnd: () => {
      // Play a sound or show a notification when the timer ends
      new Audio('/notification.mp3').play().catch(e => console.error('Error playing sound:', e));
      
      // Auto-start break if it's a work session
      if (!isBreakTime) {
        const breakDuration = (user?.preferences as any)?.breakDuration || 5 * 60; // 5 minutes default
        setTimerTime(breakDuration * 1000);
        setSessionType('break');
        startTimer();
      }
    },
    onTick: (msLeft) => {
    }
  });
  
  // Update work duration when preferences change
  useEffect(() => {
    if (user?.preferences?.workDuration) {
      const newDuration = user.preferences.workDuration * 1000; // Convert to milliseconds
      if (!isRunning) {
        resetTimer(newDuration);
      } else {
        // If timer is running, update the time without resetting the timer
        setTimerTime(newDuration);
      }
    }
  }, [user?.preferences?.workDuration, isRunning, resetTimer, setTimerTime]);
  
  // Convert milliseconds back to seconds for display
  // Convert milliseconds back to seconds for display
  const timeLeftInSeconds = Math.ceil(timeLeft / 1000);

  const handleStart = useCallback(() => {
    if (!isRunning) {
      startTimer();
      // Add XP for starting a session
      addXp(10, 'session_started');
      
      // Notify scheduler about work session start
      if (!isBreakTime) {
        completeSchedulerWorkSession();
      }
    }
  }, [startTimer, addXp, isRunning, isBreakTime, completeSchedulerWorkSession]);

  const handlePause = useCallback(() => {
    if (isRunning) {
      stopTimer();
      
      if (isBreakTime && currentBreak) {
        completeSchedulerBreak();
        setSessionType('focus');
        addXp(5, 'break_completed');
      } else {
        setSessionType('break');
        const elapsedMinutes = Math.ceil((workDuration - timeLeftInSeconds) / 60);
        const sessionXp = elapsedMinutes * 2; // 2 XP per minute
        addXp(sessionXp, 'session_completed');
        
        // Smart prediction reminder if session was long (>= 45 min)
        if (user?.id && workDuration >= 45) {
          scheduleSmartReminder(user.id).catch(console.error);
        }
        checkForAchievements('session');
      }
    }
  }, [stopTimer, isRunning, isBreakTime, currentBreak, completeSchedulerBreak, addXp, workDuration, timeLeftInSeconds, user?.id, checkForAchievements]);

  const handleReset = useCallback(() => {
    resetTimer(workDuration * 1000); // Convert to milliseconds
    setSelectedMood(null);
    setNotes('');
    setSessionType('focus');
  }, [resetTimer, workDuration]);

  // Load sessions on mount and when user changes
  useEffect(() => {
    const loadSessions = async () => {
      try {
        // Only attempt to load sessions if user is authenticated
        if (user) {
          const { sessions } = await fetchSessionHistory(10);
          setSessionHistory(sessions);
          if (sessions.length > 0) {
            const patternAnalysis = analyzePatterns(sessions);
            setAnalysis(patternAnalysis);
          }
        }
     } catch (error) {
      if (error instanceof Error && error.message !== 'User not authenticated') {
        console.error('Failed to load session history:', error);
      }
    }
        };

    loadSessions();
  }, [user]); 

  // Memoize the mood selection handler
  const handleMoodSelect = useCallback((mood: string, emoji: string) => {
    setSelectedMood(mood);
    setMoodEmoji(emoji);
  }, []);

  // Memoize the notes change handler
  const handleNotesChange = useCallback((notes: string) => {
    setNotes(notes);
  }, []);

  // Memoize the settings toggle
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  // Memoize the handleSaveNotes function
  const handleSaveNotes = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/session-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus_duration: workDuration - timeLeftInSeconds,
          break_duration: 0, // This would be updated when the break is taken
          mood_emoji: moodEmoji,
          notes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newSession = result.session;
        setSessionHistory(prev => [...prev, newSession]);
        
        // Update analysis with new data
        const updatedSessions = [...sessionHistory, newSession];
        const patternAnalysis = analyzePatterns(updatedSessions);
        setAnalysis(patternAnalysis);
        
        // Add XP for saving notes
        if (notes.trim().length > 0) {
          addXp(5, 'notes_saved');
        }
        
        // Check for achievements
        checkForAchievements('break');
        
        // Clear notes after saving
        setNotes('');
        setMoodEmoji('');
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [notes, moodEmoji, sessionHistory, workDuration, timeLeftInSeconds, addXp, checkForAchievements]);

  const progress = (workDuration - timeLeftInSeconds) / workDuration;
  const handleMoodChange = useCallback((mood: string, emoji: string) => {
    setSelectedMood(mood === selectedMood ? null : mood);
    setMoodEmoji(emoji);
    
    // Add XP for mood tracking
    addXp(5, 'mood_tracked');
    
    // Check for mood-related achievements
    checkForAchievements('mood');
  }, [selectedMood, addXp, checkForAchievements]);

  const handleSuggestion = useCallback((suggestion: {type: string; description: string}) => {
    setAiSuggestion(suggestion);
  }, []);

  const currentMood = useMemo(() => {
    return MOODS.find(mood => mood.emoji === selectedMood) || null;
  }, [selectedMood]);

  // Memoize the mood avatars rendering
  const renderMoodAvatars = useMemo(() => {
    if (!showMoodAvatars) return null;

    return (
      <div className="flex justify-center space-x-4 my-4">
        {MOODS.map(({ emoji, label, color }) => (
          <MoodButton
            key={label}
            emoji={emoji}
            label={label}
            color={color}
            isSelected={selectedMood === label}
            onClick={() => handleMoodSelect(label, emoji)}
          />
        ))}
      </div>
    );
  }, [showMoodAvatars, selectedMood, handleMoodSelect]);

  // Memoize the notes section
  const renderNotesSection = useMemo(() => {
    return (
      <div className="mt-6 w-full max-w-md">
        <label htmlFor="session-notes" className="block text-sm font-medium text-gray-700 mb-2">
          Session Notes (Optional)
        </label>
        <textarea
          id="session-notes"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="How was your session?"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleSaveNotes}
            disabled={!notes.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    );
  }, [notes, handleNotesChange, handleSaveNotes]);

  // Show break time UI if in break mode
  if (isBreakTime && currentBreak) {
    return (
      <div className="min-h-screen bg-blue-50 dark:bg-blue-900/20 p-4 relative">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center">
            <h1 className="text-2xl font-bold">Break Time!</h1>
            <p className="mt-2 opacity-90">{currentBreak.description}</p>
          </div>
          
          <div className="p-6 text-center">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 my-8">
              {Math.floor(currentBreak.duration / 60).toString().padStart(2, '0')}:
              {(currentBreak.duration % 60).toString().padStart(2, '0')}
            </div>
            
            <button
              onClick={handlePause}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
            >
              End Break
            </button>
            
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p>Take a moment to relax and recharge.</p>
              <p className="mt-1">You've earned this break!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add handleStop function
  const handleStop = useCallback(() => {
    stopTimer();
    completeSchedulerBreak();
    addXp(5, 'break_completed');
  }, [stopTimer, completeSchedulerBreak, addXp]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-20">
        <Visualizer 
          timeOfDay={timeOfDay} 
          sessionType={sessionType}
          className="w-full h-full"
          visualizationType={currentVisualization}
          progress={1 - (timeLeftInSeconds / workDuration)}
          timeLeftInSeconds={timeLeftInSeconds}
          isFocusSession={sessionType === 'focus'}
        />
      </div>
      
      {/* Visualization Type Selector */}
      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-20">
        <select
          value={currentVisualization}
          onChange={(e) => setCurrentVisualization(e.target.value as TimerVisualization)}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="battery">Battery</option>
          <option value="rocket">Rocket</option>
          <option value="coffee">Coffee</option>
          <option value="digital">Digital</option>
          <option value="circle">Circle</option>
          <option value="bar">Progress Bar</option>
        </select>
      </div>
      <div className="md:flex md:gap-8 md:max-w-5xl md:mx-auto">
        <div className="w-full md:w-2/3 lg:w-3/5 max-w-md mx-auto md:mx-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Mood Follows Actions</h1>
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
        
        <div className="p-6">
          <div className="text-center mb-8">
            <Timer
              timeLeft={timeLeftInSeconds}
              isRunning={isRunning}
              onStart={handleStart}
              onStop={handlePause}
              onReset={handleReset}
              totalTime={workDuration}
              animationType="both"
              notes={notes}
              onNotesChange={handleNotesChange}
            />
            
            <div className="mt-6 space-x-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Reset
              </button>
            </div>
            
            {/* Save Notes Button */}
            {notes.trim() && !isRunning && (
              <div className="mt-4">
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save Session Notes
                </button>
              </div>
            )}
          </div>
          
          {/* Gamification Stats */}
          <div className="mb-6">
            <GamificationStats />
          </div>
          <GamificationBanner />
          {/* Upcoming Breaks */}
          {upcomingBreaks.length > 0 && (
            <div className="hidden">
              <UpcomingBreaks />
            </div>
          )}
          
          {/* Mood Tracking Section */}
          <div className="hidden">
            <MoodTracker 
              selectedMood={selectedMood}
              onMoodChange={handleMoodChange}
              notes={notes}
              onNotesChange={setNotes}
              onSuggestion={handleSuggestion}
            />
            
            {/* AI Suggestion */}
            {aiSuggestion && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="text-md font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                  <span className="mr-2">💡 AI Suggestion</span>
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  {aiSuggestion.description}
                </p>
              </div>
            )}
            
            {/* Pattern Analysis */}
            {analysis && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-medium text-green-800 dark:text-green-200">
                    Your Pattern Analysis
                  </h3>
                  <button 
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="text-xs text-green-600 dark:text-green-400 hover:underline"
                  >
                    {showAnalysis ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showAnalysis && (
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    {analysis.mostCommonMood && (
                      <p className="mb-1">
                        <span className="font-medium">Common Mood:</span>{' '}
                        <span className="capitalize">{analysis.mostCommonMood}</span>
                      </p>
                    )}
                    <p className="mb-2">
                      <span className="font-medium">Sentiment:</span>{' '}
                      {analysis.averageSentiment > 0.1 ? '😊 Positive' : 
                       analysis.averageSentiment < -0.1 ? '😕 Challenging' : '😐 Neutral'}
                    </p>
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      {analysis.suggestion}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Notes Section */}
          <div className="hidden">
            {renderNotesSection}
          </div>
        </div>
      </div>
      
      {/* Mobile Secondary Tabs */}
      <div className="mt-6 md:hidden">
        <TimerPageTabs
          includeMoodTracker={true}
          selectedMood={selectedMood}
          onMoodChange={handleMoodChange}
          notes={notes}
          onNotesChange={setNotes}
          onSaveNotes={handleSaveNotes}
        />
      </div>

      {/* Sidebar (Desktop & Tablet) */}
      <div className="hidden md:block md:w-1/3 lg:w-2/5 space-y-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <MoodTracker
            selectedMood={selectedMood}
            onMoodChange={handleMoodChange}
            notes={notes}
            onNotesChange={setNotes}
            onSuggestion={handleSuggestion}
            showNotes={true}
          />
        </div>
      </div>
    </div>

    <SettingsPanel 
      isOpen={showSettings} 
      onClose={() => setShowSettings(false)} 
    />
  </div>
  );
}

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
