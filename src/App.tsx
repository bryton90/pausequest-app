import React, { useState, useCallback, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSound } from './hooks/useSound';
import { Timer } from './components/Timer/Timer';
import { SessionHistory } from './components/SessionHistory/SessionHistory';
import { MoodTracker } from './components/MoodTracker/MoodTracker';
import { Settings } from './components/Settings/Settings';
import { Stats } from './components/Stats/Stats';
import { createSession } from './api/breakService';
import { getDefaultSettings, saveSettings, applyTheme, timerPresets, UserSettings } from './utils/theme';
import { getInitialStats, saveStats, updateStatsAfterSession, UserStats } from './utils/gamification';

const App: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [breakDuration, setBreakDuration] = useState<number>(0);
  const [settings, setSettings] = useState<UserSettings>(getDefaultSettings());
  const [stats, setStats] = useState<UserStats>(getInitialStats());
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [isBreakTime, setIsBreakTime] = useState<boolean>(false);
  const [sessionRefresh, setSessionRefresh] = useState<number>(0);

  const workDuration = settings.timerPreset === 'custom' 
    ? settings.customWorkDuration 
    : timerPresets.find(p => p.id === settings.timerPreset)?.workDuration || 1500;

  const { playTick, playAlarm, enableTicking } = useSound({
    enabled: settings.soundEnabled,
    volume: settings.soundVolume,
  });

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const handleTimeEnd = useCallback(() => {
    setIsBreakTime(true);
    playAlarm();
    enableTicking(false);
    
    // Update stats after successful session
    const updatedStats = updateStatsAfterSession(stats, Math.floor(workDuration / 60));
    const previousAchievements = stats.achievements.filter(a => a.unlocked).map(a => a.id);
    const currentAchievements = updatedStats.achievements.filter(a => a.unlocked).map(a => a.id);
    const newlyUnlocked = currentAchievements.filter(id => !previousAchievements.includes(id));
    
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
      setTimeout(() => setNewAchievements([]), 5000);
    }
    
    setStats(updatedStats);
    saveStats(updatedStats);
  }, [playAlarm, enableTicking, stats, workDuration]);

  const {
    timeLeft,
    isRunning,
    startTimer: startTimerHook,
    stopTimer: stopTimerHook,
    resetTimer: resetTimerHook
  } = useTimer({
    initialTime: workDuration,
    onTimeEnd: handleTimeEnd
  });

  const startTimer = useCallback(() => {
    startTimerHook();
    if (settings.soundEnabled && timeLeft < 60) {
      enableTicking(true);
    }
  }, [startTimerHook, settings.soundEnabled, timeLeft, enableTicking]);

  const stopTimer = useCallback(() => {
    stopTimerHook();
    enableTicking(false);
  }, [stopTimerHook, enableTicking]);

  useEffect(() => {
    if (isRunning && settings.soundEnabled && timeLeft <= 60 && timeLeft > 0) {
      playTick();
    }
  }, [timeLeft, isRunning, settings.soundEnabled, playTick]);

  const resetTimer = useCallback(() => {
    resetTimerHook(workDuration);
    setIsBreakTime(false);
    setSelectedMood(null);
    setNotes('');
    enableTicking(false);
  }, [resetTimerHook, workDuration, enableTicking]);

  const handleSettingsChange = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setShowSettings(false);
    // Reset timer if preset changed
    if (!isRunning) {
      const newDuration = settings.timerPreset === 'custom' 
        ? settings.customWorkDuration 
        : timerPresets.find(p => p.id === settings.timerPreset)?.workDuration || 1500;
      resetTimerHook(newDuration);
    }
  }, [isRunning, resetTimerHook, settings]);

  const handleSaveSession = async () => {
    if (!selectedMood) {
      alert('Please select your mood before saving');
      return;
    }

    try {
      const focusDuration = workDuration;
      await createSession({
        focus_duration: focusDuration,
        break_duration: breakDuration,
        mood_emoji: selectedMood,
        notes: notes.trim() || undefined,
      });
      
      // Refresh session history
      setSessionRefresh(prev => prev + 1);
      
      // Reset everything after saving
      resetTimer();
      setIsBreakTime(false);
      setSelectedMood(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h1 className="text-2xl font-bold">PauseQuest</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStats(true)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title="View Stats"
          >
            📊
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Achievement Notifications */}
      {newAchievements.length > 0 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-card border border-border rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-bold mb-2">🎉 Achievement Unlocked!</h3>
          {newAchievements.map(id => {
            const achievement = stats.achievements.find(a => a.id === id);
            return achievement ? (
              <div key={id} className="flex items-center gap-2">
                <span>{achievement.icon}</span>
                <span>{achievement.title}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Stats Display */}
      <div className="flex justify-center gap-4 p-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <span className="text-xl">🔥</span>
          <span className="font-bold">{stats.currentStreak}</span>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <span className="text-xl">⭐</span>
          <span className="font-bold">{stats.focusPoints}</span>
        </div>
      </div>

      {/* Main Layout - Three Column Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Session History */}
          <div className="bg-card border border-border rounded-lg p-6">
            <SessionHistory refreshTrigger={sessionRefresh} />
          </div>

          {/* Center Column - Timer */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center">
            <Timer
              timeLeft={timeLeft}
              isRunning={isRunning}
              onStart={startTimer}
              onStop={stopTimer}
              onReset={resetTimer}
              totalTime={workDuration}
              animationType={settings.animationType}
            />
            
            {isBreakTime && (
              <button
                onClick={handleSaveSession}
                disabled={!selectedMood}
                className="mt-8 px-6 py-2 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Session
              </button>
            )}
          </div>

          {/* Right Column - Mood Tracking & Notes */}
          <div className="bg-card border border-border rounded-lg p-6">
            <MoodTracker
              selectedMood={selectedMood}
              onMoodChange={setSelectedMood}
              notes={notes}
              onNotesChange={setNotes}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <Settings
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onClose={handleSettingsClose}
        />
      )}
      {showStats && (
        <Stats
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
};

export default App;
