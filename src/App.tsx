import React, { useState, useCallback, useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { useSound } from './hooks/useSound';
import { BreakForm } from './components/BreakForm/BreakForm';
import { SentimentDisplay } from './components/SentimentDisplay/SentimentDisplay';
import { Timer } from './components/Timer/Timer';
import { Settings } from './components/Settings/Settings';
import { Stats } from './components/Stats/Stats';
import { logBreak } from './api/breakService';
import { getSentimentMessage } from './utils/sentiment';
import { getDefaultSettings, saveSettings, applyTheme, timerPresets, UserSettings } from './utils/theme';
import { getInitialStats, saveStats, updateStatsAfterSession, UserStats } from './utils/gamification';
import './App.css';

const App: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [breakType, setBreakType] = useState<string>('snack');
  const [mood, setMood] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [sentimentMessage, setSentimentMessage] = useState<string>('');
  const [settings, setSettings] = useState<UserSettings>(getDefaultSettings());
  const [stats, setStats] = useState<UserStats>(getInitialStats());
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

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
    setShowPrompt(true);
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
    setShowPrompt(false);
    setSentiment(null);
    setMood('');
    setBreakType('snack');
    setError('');
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

  const handleBreakTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setBreakType(e.target.value);
  }, []);

  const handleMoodChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMood(e.target.value);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!mood.trim()) {
      setError('Please enter how you are feeling before continuing.');
      return;
    }

    try {
      const response = await logBreak({ breakType, mood });
      const sentimentScore = response.sentiment_score;
      
      setSentiment(sentimentScore);
      setSentimentMessage(getSentimentMessage(sentimentScore));
      console.log('Backend sentiment analysis score:', sentimentScore);
    } catch (error) {
      console.error('Error logging break:', error);
      setError('Failed to log break. Please try again.');
    }
  };

  return (
    <div className="App">
      {/* Header with controls */}
      <div className="app-header">
        <button className="icon-btn" onClick={() => setShowStats(true)} title="View Stats">
          📊
        </button>
        <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
          ⚙️
        </button>
      </div>

      {/* Achievement Notifications */}
      {newAchievements.length > 0 && (
        <div className="achievement-notification">
          <h3>🎉 Achievement Unlocked!</h3>
          {newAchievements.map(id => {
            const achievement = stats.achievements.find(a => a.id === id);
            return achievement ? (
              <div key={id} className="achievement-item">
                <span>{achievement.icon}</span>
                <span>{achievement.title}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Stats Display */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{stats.currentStreak}</span>
        </div>
        <div className="quick-stat">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">{stats.focusPoints}</span>
        </div>
      </div>

      {!showPrompt ? (
        <>
          <h1>PauseQuest Timer</h1>
          <Timer
            timeLeft={timeLeft}
            isRunning={isRunning}
            onStart={startTimer}
            onStop={stopTimer}
            onReset={resetTimer}
            totalTime={workDuration}
            animationType={settings.animationType}
          />
        </>
      ) : (
        <div className="break-container">
          <h1>PauseQuest Break Time!</h1>
          {sentiment === null ? (
            <BreakForm
              breakType={breakType}
              mood={mood}
              error={error}
              onBreakTypeChange={handleBreakTypeChange}
              onMoodChange={handleMoodChange}
              onSubmit={handleSubmit}
            />
          ) : (
            <SentimentDisplay
              sentimentMessage={sentimentMessage}
              onReset={resetTimer}
            />
          )}
        </div>
      )}

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
