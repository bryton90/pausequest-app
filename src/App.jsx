import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  
  const [timeLeft, setTimeLeft] = useState(1500); // 1500 seconds = 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [breakType, setBreakType] = useState('lunch');
  const [mood, setMood] = useState('');

  useEffect(() => {

    if (!isRunning) {
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
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
        breakType,
        mood,
    };

    try {
        // Send a POST request to our Flask backend
        const response = await fetch('http://127.0.0.1:5000/log-break', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log('Break logged successfully on the backend!');
            
            resetTimer();
        } else {
            console.error('Failed to log break on the backend.');
        }

    } catch (error) {
        console.error('Error connecting to the backend:', error);
    }
};

  // Format the time into MM:SS format
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progressPercentage = (timeLeft / 1500) * 100;

  
  if (showPrompt) {
    return (
      <div className="App">
        <h1>PauseQuest Break Time!</h1>
        <div className="prompt-container">
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
                rows="4"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="I'm feeling... tired, energized, stressed, etc."
              />
            </div>
            <button type="submit">Log Break</button>
          </form>
        </div>
      </div>
    );
  }

  // Timer view
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