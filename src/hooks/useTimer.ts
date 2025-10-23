import { useState, useEffect } from 'react';

interface UseTimerProps {
  initialTime: number;
  onTimeEnd: () => void;
}

export const useTimer = ({ initialTime, onTimeEnd }: UseTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning || timeLeft === 0) {
      if (timeLeft === 0) {
        onTimeEnd();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft, onTimeEnd]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = (newTime: number = initialTime) => {
    setIsRunning(false);
    setTimeLeft(newTime);
  };

  return {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
