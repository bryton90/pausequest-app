import { useState, useRef, useEffect, useCallback } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onTimeEnd?: () => void;
  onTick?: (timeLeft: number) => void;
  tickIntervalMs?: number;
  autoStart?: boolean;
}

export const useTimer = ({ 
  initialTime, 
  onTimeEnd, 
  onTick,
  tickIntervalMs = 200,
  autoStart = false
}: UseTimerOptions) => {
  const [displayTime, setDisplayTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  
  // Refs to store values that don't need to trigger re-renders
  const timeLeftRef = useRef(initialTime);
  const lastTickTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update the display at a controlled frequency
  const updateDisplay = useCallback(() => {
    setDisplayTime(timeLeftRef.current);
    onTick?.(timeLeftRef.current);
  }, [onTick]);

  // Main animation loop using requestAnimationFrame for smooth updates
  const loop = useCallback((timestamp: number) => {
    if (!isRunning) return;

    // Calculate elapsed time since last frame
    const now = timestamp;
    const delta = now - (lastTickTimeRef.current || now);
    lastTickTimeRef.current = now;

    // Update the internal timer
    if (timeLeftRef.current > 0) {
      timeLeftRef.current = Math.max(0, timeLeftRef.current - delta);
      rafIdRef.current = requestAnimationFrame(loop);
      
      // Only update display at the specified interval
      if (!tickIntervalRef.current) {
        updateDisplay();
        tickIntervalRef.current = setTimeout(() => {
          tickIntervalRef.current = null;
        }, tickIntervalMs);
      }
    } else {
      // Timer completed
      timeLeftRef.current = 0;
      updateDisplay();
      setIsRunning(false);
      onTimeEnd?.();
    }
  }, [isRunning, tickIntervalMs, onTimeEnd, updateDisplay]);

  // Start/stop the timer when isRunning changes
  useEffect(() => {
    if (isRunning) {
      lastTickTimeRef.current = performance.now();
      rafIdRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (tickIntervalRef.current) {
        clearTimeout(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [isRunning, loop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
    }
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback((newTime: number = initialTime) => {
    setIsRunning(false);
    timeLeftRef.current = newTime;
    setDisplayTime(newTime);
  }, [initialTime]);

  return {
    timeLeft: displayTime,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    // Additional control to set time without resetting the timer
    setTime: (newTime: number) => {
      timeLeftRef.current = newTime;
      setDisplayTime(newTime);
    }
  };
};
