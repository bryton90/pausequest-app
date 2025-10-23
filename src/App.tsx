import React, { useState, useCallback } from 'react';
import { useTimer } from './hooks/useTimer';
import { BreakForm } from './components/BreakForm/BreakForm';
import { SentimentDisplay } from './components/SentimentDisplay/SentimentDisplay';
import { Timer } from './components/Timer/Timer';
import { logBreak } from './api/breakService';
import { getSentimentMessage } from './utils/sentiment';
import './App.css';

const WORK_SESSION_DURATION = 1500; // 25 minutes in seconds

const App: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [breakType, setBreakType] = useState<string>('snack');
  const [mood, setMood] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [sentimentMessage, setSentimentMessage] = useState<string>('');

  const handleTimeEnd = useCallback(() => {
    setShowPrompt(true);
  }, []);

  const {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer: resetTimerHook
  } = useTimer({
    initialTime: WORK_SESSION_DURATION,
    onTimeEnd: handleTimeEnd
  });

  const resetTimer = useCallback(() => {
    resetTimerHook(WORK_SESSION_DURATION);
    setShowPrompt(false);
    setSentiment(null);
    setMood('');
    setBreakType('snack');
    setError('');
  }, [resetTimerHook]);

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
      {!showPrompt ? (
        <>
          <h1>PauseQuest Timer</h1>
          <Timer
            timeLeft={timeLeft}
            isRunning={isRunning}
            onStart={startTimer}
            onStop={stopTimer}
            onReset={resetTimer}
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
    </div>
  );
};

export default App;
