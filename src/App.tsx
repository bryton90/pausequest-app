import React, { useState, useEffect } from 'react';
import './App.css';

interface BreakLogData {
  breakType: string;
  mood: string;
}

function App() {
  const [timeLeft, setTimeLeft] = useState<number>(1500); // 1500 seconds = 25 minutes
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [breakType, setBreakType] = useState<string>('lunch');
  const [mood, setMood] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [sentimentMessage, setSentimentMessage] = useState<string>('');

  useEffect(() => {
    if (!isRunning || timeLeft === 0) {
      if (timeLeft === 0) {
        setShowPrompt(true);
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(1500);
    setShowPrompt(false);
    setSentiment(null); // Reset sentiment state
    setMood(''); // Reset mood state
    setBreakType('lunch'); // Reset break type
  };

  const getSentimentMessage = (score: number): string => {
    if (score >= 0.05) {
      return "You're feeling pretty positive! Keep up the good work.";
    } else if (score <= -0.05) {
      return "You seem a little negative. Remember to take a mindful break.";
    } else {
      return "You're feeling quite neutral. A little refresh might help!";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!mood) {
      setError('Please enter how you are feeling before continuing.');
      return;
    }

    const data: BreakLogData = {
      breakType,
      mood,
    };

    try {
      const response: Response = await fetch('http://127.0.0.1:5000/log-break', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        const sentimentScore: number = responseData.sentiment_score;

        setSentiment(sentimentScore);
        setSentimentMessage(getSentimentMessage(sentimentScore));
        
        console.log('Backend sentiment analysis score:', sentimentScore);

      } else {
        console.error('Failed to log break on the backend.');
        setError('Failed to log break. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting to the backend:', error);
      setError('Error: Cannot connect to the server.');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercentage = (timeLeft / 1500) * 100;

  if (showPrompt) {
    return (
      <div className="App">
        <h1>PauseQuest Break Time!</h1>
        <div className="prompt-container">
          {sentiment === null ? (
            <>
              <h2>It's time for a break.</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="breakType">What kind of break was it?</label>
                  <select
                    id="breakType"
                    value={breakType}
                    onChange={(e) => setBreakType(e.target.value)}
                  >
                    <option value="lunch">Lunch 🍽️</option>
                    <option value="snack">Snack 🍎</option>
                    <option value="water">Water 💧</option>
                    <option value="stretch">Stretch 🤸‍♂️</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="mood">How are you feeling?</label>
                  <textarea
                    id="mood"
                    rows={4}
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="I'm feeling... tired, energized, stressed, etc."
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">Log Break</button>
              </form>
            </>
          ) : (
            <div className="sentiment-results">
              <h2>Your break analysis:</h2>
              <p className="sentiment-message">{sentimentMessage}</p>
              <button onClick={resetTimer}>Done</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>PauseQuest Timer</h1>
      <div className="timer-container">
        <h2>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</h2>
        <div>
          <button onClick={startTimer}>Start</button>
          <button onClick={stopTimer}>Stop</button>
          <button onClick={resetTimer}>Reset</button>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default App;