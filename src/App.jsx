import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State variables
  const [timeLeft, setTimeLeft] = useState(1500); // 1500 seconds = 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [breakType, setBreakType] = useState('lunch');
  const [mood, setMood] = useState('');

  // useEffect Hook for the timer logic
  useEffect(() => {
    // Exit if the timer is not running or has reached zero
    if (!isRunning) {
      // If time is up, show the break prompt
      if (timeLeft === 0) {
        setShowPrompt(true);
      }
      return;
    }

    // Set up an interval to decrement the timer every second
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Clean up the interval when the component unmounts or dependencies change
    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  // Timer control functions
  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(1500); // Reset to 25 minutes
    setShowPrompt(false); // Hide the prompt
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Break Logged!');
    console.log('Break Type:', breakType);
    console.log('Mood:', mood);
    
    // Reset form fields and timer
    setBreakType('lunch');
    setMood('');
    resetTimer();
  };

  // Format the time into MM:SS format
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Calculate the progress percentage for the bar
  const progressPercentage = (timeLeft / 1500) * 100;

  // Conditional Rendering based on `showPrompt` state
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