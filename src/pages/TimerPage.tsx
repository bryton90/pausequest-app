import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

type TimerVisualization = 'battery' | 'rocket' | 'coffee' | 'circle' | 'bar' | 'digital';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'text-yellow-400' },
  { emoji: '😐', label: 'Neutral', color: 'text-gray-400' },
  { emoji: '😕', label: 'Unsure', color: 'text-blue-400' },
  { emoji: '😫', label: 'Tired', color: 'text-red-400' },
];

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
  const { user } = useAuth();
  const { 
    timerVisualization, 
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
  const [isRunning, setIsRunning] = useState(false);
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
  
  // Default to 25 minutes if no user preferences are set
  const workDuration = (user?.preferences as any)?.workDuration || 25 * 60;
  
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
    
    // Add XP for starting a session
    addXp(10, 'session_started');
    
    // Notify scheduler about work session start
    if (!isBreakTime) {
      completeSchedulerWorkSession();
    }
  }, [startTimer, addXp, isBreakTime, completeSchedulerWorkSession]);

  const handlePause = useCallback(() => {
    stopTimer();
    setIsRunning(false);
    if (isBreakTime && currentBreak) {
      completeSchedulerBreak();
      setSessionType('focus');
      addXp(5, 'break_completed');
    } else {
      setSessionType('break');
      const sessionXp = Math.floor((workDuration - timeLeft) / 60) * 2; // 2 XP per minute
      addXp(sessionXp, 'session_completed');
      // Smart prediction reminder if session was long (>= 45 min)
      if (user?.id && workDuration / 60 >= 45) {
        scheduleSmartReminder(user.id).catch(console.error);
      }
      checkForAchievements('session');
    }
  }, [stopTimer, isBreakTime, currentBreak, completeSchedulerBreak, addXp, workDuration, timeLeft, checkForAchievements]);

  const handleReset = useCallback(() => {
    resetTimer(workDuration);
    setIsRunning(false);
    setSelectedMood(null);
    setNotes('');
  }, [resetTimer, workDuration]);

  const getSessionHistory = useCallback(async (limit: number) => {
    try {
      const response = await fetch(`/api/sessions?limit=${limit}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }

      // Guard against non-JSON (e.g. an HTML fallback page)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.warn(
          'getSessionHistory: expected JSON but received',
          contentType
        );
        return [];
      }

      const data = await response.json();
      return Array.isArray(data.sessions) ? data.sessions : [];
    } catch (error) {
      console.error('Error fetching session history:', error);
      return [];
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessions = await getSessionHistory(10);
        setSessionHistory(sessions);
        if (sessions.length > 0) {
          const patternAnalysis = analyzePatterns(sessions);
          setAnalysis(patternAnalysis);
        }
      } catch (error) {
        console.error('Failed to load session history:', error);
      }
    };

    loadSessions();
  }, []);

  const handleSaveNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          mood_emoji: moodEmoji,
          notes,
          focus_duration: workDuration - timeLeft,
          break_duration: 0, // This would be updated when the break is taken
        }),
      });

      if (response.ok) {
        const newSession = await response.json();
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
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [notes, selectedMood, moodEmoji, sessionHistory, workDuration, timeLeft, addXp, checkForAchievements]);

  const progress = 1 - timeLeft / workDuration;
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
    setIsRunning(false);
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
        />
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
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </div>
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
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-medium text-purple-800 dark:text-purple-200">
                    Your Pattern Analysis
                  </h3>
                  <button 
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {showAnalysis ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showAnalysis && (
                  <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
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
                    <p className="text-purple-800 dark:text-purple-200 font-medium">
                      {analysis.suggestion}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Notes Section */}
          <div className="hidden">
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
            showNotes={false}
          />
        </div>
        <TimerPageTabs
          includeMoodTracker={false}
          selectedMood={selectedMood}
          onMoodChange={handleMoodChange}
          notes={notes}
          onNotesChange={setNotes}
          onSaveNotes={handleSaveNotes}
        />
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
