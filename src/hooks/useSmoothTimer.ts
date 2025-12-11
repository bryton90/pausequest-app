import { useState, useRef, useEffect, useCallback } from 'react';

interface UseSmoothTimerProps {
  initialTimeMs: number;
  onTimeEnd?: () => void;
  onTick?: (remainingMs: number) => void;
  tickIntervalMs?: number;
}

export const useSmoothTimer = ({
  initialTimeMs,
  onTimeEnd,
  onTick,
  tickIntervalMs = 200,
}: UseSmoothTimerProps) => {
  const [remainingMs, setRemainingMs] = useState(initialTimeMs);
  const [isRunning, setIsRunning] = useState(false);
  const animationRef = useRef<number>(0);
  const lastTickTime = useRef<number>(0);
  const tickTimeout = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    lastTickTime.current = Date.now();

    const tick = () => {
      if (!lastTickTime.current) return;

      const now = Date.now();
      const delta = now - lastTickTime.current;
      lastTickTime.current = now;

      setRemainingMs(prev => {
        const newRemaining = Math.max(0, prev - delta);
        
        if (newRemaining <= 0) {
          setIsRunning(false);
          onTimeEnd?.();
          return 0;
        }
        
        return newRemaining;
      });

      if (remainingMs > 0) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    // Start the animation frame loop
    animationRef.current = requestAnimationFrame(tick);

    // Setup the interval for logical updates (less frequent than animation frames)
    if (onTick) {
      tickTimeout.current = setInterval(() => {
        onTick(remainingMs);
      }, tickIntervalMs);
    }
  }, [isRunning, onTimeEnd, onTick, remainingMs, tickIntervalMs]);

  const stopTimer = useCallback(() => {
    if (!isRunning) return;
    
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    if (tickTimeout.current) {
      clearInterval(tickTimeout.current);
      tickTimeout.current = null;
    }
  }, [isRunning]);

  const resetTimer = useCallback((newTimeMs = initialTimeMs) => {
    stopTimer();
    setRemainingMs(newTimeMs);
  }, [initialTimeMs, stopTimer]);

  const setTime = useCallback((newTimeMs: number) => {
    setRemainingMs(newTimeMs);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      if (tickTimeout.current) {
        clearInterval(tickTimeout.current);
        tickTimeout.current = null;
      }
    };
  }, []);

  return {
    remainingMs,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    setTime,
  };
};
