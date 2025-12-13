import { useCallback, useEffect, useRef, useState } from 'react';

export type SessionType = 'focus' | 'break';

export interface TimerState {
  timeLeft: number; // seconds
  isRunning: boolean;
  totalTime: number; // seconds
  sessionType: SessionType;
}

const DEFAULT_FOCUS_MIN = 25;
const DEFAULT_BREAK_MIN = 5;

export const usePersistentTimer = (
  storageKey = 'pausequest-timer',
): [TimerState, {
  start: () => void;
  pause: () => void;
  reset: (minutes?: number) => void;
  setSessionType: (t: SessionType) => void;
}] => {
  const loadInitial = (): TimerState => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as TimerState;
        return parsed;
      }
    } catch (_) {}
    // Fallback default state
    return {
      timeLeft: DEFAULT_FOCUS_MIN * 60,
      isRunning: false,
      totalTime: DEFAULT_FOCUS_MIN * 60,
      sessionType: 'focus',
    };
  };

  const [{ timeLeft, isRunning, totalTime, sessionType }, setState] =
    useState<TimerState>(loadInitial);

  // persistence
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ timeLeft, isRunning, totalTime, sessionType }),
      );
    } catch (_) {}
  }, [timeLeft, isRunning, totalTime, sessionType, storageKey]);

  // visibility change => auto pause when hidden
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isRunning) {
        pause();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning]);

  // timer using requestAnimationFrame for accuracy
  const rafRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);

  const step = useCallback(
    (now: number) => {
      if (prevTimeRef.current != null) {
        const delta = (now - prevTimeRef.current) / 1000;
        setState((prev) => {
          const nextLeft = Math.max(prev.timeLeft - delta, 0);
          if (nextLeft === 0 && prev.isRunning) {
            // Auto pause when finished
            return { ...prev, timeLeft: nextLeft, isRunning: false };
          }
          return { ...prev, timeLeft: nextLeft };
        });
      }
      prevTimeRef.current = now;
      rafRef.current = requestAnimationFrame(step);
    },
    [],
  );

  const start = useCallback(() => {
    if (isRunning) return;
    setState((s) => ({ ...s, isRunning: true }));
    prevTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(step);
  }, [isRunning, step]);

  const pause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    prevTimeRef.current = null;
    setState((s) => ({ ...s, isRunning: false }));
  }, []);

  const reset = useCallback((minutes?: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    prevTimeRef.current = null;
    const newTotal = (minutes ?? (sessionType === 'focus' ? DEFAULT_FOCUS_MIN : DEFAULT_BREAK_MIN)) * 60;
    setState({ timeLeft: newTotal, totalTime: newTotal, isRunning: false, sessionType });
  }, [sessionType]);

  const setSessionType = useCallback((t: SessionType) => {
    const mins = t === 'focus' ? DEFAULT_FOCUS_MIN : DEFAULT_BREAK_MIN;
    setState({ timeLeft: mins * 60, totalTime: mins * 60, isRunning: false, sessionType: t });
  }, []);

  return [
    { timeLeft, isRunning, totalTime, sessionType },
    { start, pause, reset, setSessionType },
  ];
};
