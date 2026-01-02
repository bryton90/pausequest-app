'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSettings } from './SettingsContext';
import { playSound } from '../utils/sounds';

type SessionType = 'focus' | 'break';

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  sessionType: SessionType;
  completedSessions: number;
}

type TimerAction =
  | { type: 'TOGGLE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'SET_SESSION_TYPE'; payload: SessionType }
  | { type: 'TICK' }
  | { type: 'SESSION_COMPLETE' }
  | { type: 'LOAD_STATE'; payload: TimerState };

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds

const initialState: TimerState = {
  timeLeft: FOCUS_TIME,
  isRunning: false,
  sessionType: 'focus',
  completedSessions: 0,
};

interface TimerContextType {
  state: TimerState;
  toggleTimer: () => void;
  resetTimer: () => void;
  setSessionType: (type: SessionType) => void;
  formatTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const { soundSettings, timerSettings, getCurrentTimerPreset } = useSettings();
  const [state, setState] = useState(() => {
    const preset = getCurrentTimerPreset();
    console.log('TimerContext init - preset:', preset);
    // For custom preset, use custom durations from settings
    const initialWorkDuration = preset.id === 'custom' 
      ? timerSettings.customWorkDuration 
      : preset.workDuration;
    
    return {
      ...initialState,
      timeLeft: initialWorkDuration,
    };
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update timer when preset changes - simplified
  useEffect(() => {
    console.log('Preset change effect triggered');
    if (!state.isRunning) {
      const currentPreset = getCurrentTimerPreset();
      console.log('Updating timer with preset:', currentPreset);
      // For custom preset, use custom durations from settings
      const workDuration = currentPreset.id === 'custom' 
        ? timerSettings.customWorkDuration 
        : currentPreset.workDuration;
      const breakDuration = currentPreset.id === 'custom' 
        ? timerSettings.customBreakDuration 
        : currentPreset.breakDuration;
      
      setState(prevState => ({
        ...prevState,
        timeLeft: prevState.sessionType === 'focus' ? workDuration : breakDuration,
      }));
    }
  }, [timerSettings.preset, timerSettings.customWorkDuration, timerSettings.customBreakDuration, getCurrentTimerPreset]);

  // Custom reducer logic with preset access
  const dispatch = (action: TimerAction) => {
    const currentPreset = getCurrentTimerPreset();
    // For custom preset, use the custom durations from settings
    const workDuration = currentPreset.id === 'custom' 
      ? timerSettings.customWorkDuration 
      : currentPreset.workDuration;
    const breakDuration = currentPreset.id === 'custom' 
      ? timerSettings.customBreakDuration 
      : currentPreset.breakDuration;
    
    setState((prevState: TimerState) => {
      switch (action.type) {
        case 'TOGGLE_TIMER':
          return { ...prevState, isRunning: !prevState.isRunning };
        
        case 'RESET_TIMER':
          return {
            ...prevState,
            timeLeft: prevState.sessionType === 'focus' ? workDuration : breakDuration,
            isRunning: false,
          };
        
        case 'SET_SESSION_TYPE':
          return {
            ...prevState,
            sessionType: action.payload,
            timeLeft: action.payload === 'focus' ? workDuration : breakDuration,
            isRunning: false,
          };
        
        case 'TICK':
          return {
            ...prevState,
            timeLeft: Math.max(0, prevState.timeLeft - 1),
          };
        
        case 'SESSION_COMPLETE':
          const newSessionType: SessionType = prevState.sessionType === 'focus' ? 'break' : 'focus';
          return {
            ...prevState,
            sessionType: newSessionType,
            timeLeft: newSessionType === 'focus' ? workDuration : breakDuration,
            isRunning: false,
            completedSessions: prevState.sessionType === 'focus' ? prevState.completedSessions + 1 : prevState.completedSessions,
          };
        
        case 'LOAD_STATE':
          return action.payload;
        
        default:
          return prevState;
      }
    });
  };

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('timerState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Error loading timer state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timerState', JSON.stringify(state));
  }, [state]);

  // Timer effect
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  // Handle session completion
  useEffect(() => {
    if (state.timeLeft === 0 && state.isRunning) {
      // Play sound with settings using the centralized sound utility
      playSound('complete', soundSettings.volume, soundSettings.enabled);
      
      dispatch({ type: 'SESSION_COMPLETE' });
    }
  }, [state.timeLeft, state.isRunning, soundSettings.enabled, soundSettings.volume]);

  const toggleTimer = () => {
    // Play start sound when timer starts (not when it's paused)
    if (!state.isRunning) {
      playSound('start', soundSettings.volume, soundSettings.enabled);
    }
    dispatch({ type: 'TOGGLE_TIMER' });
  };

  const resetTimer = () => {
    dispatch({ type: 'RESET_TIMER' });
  };

  const setSessionType = (type: SessionType) => {
    dispatch({ type: 'SET_SESSION_TYPE', payload: type });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const value: TimerContextType = {
    state,
    toggleTimer,
    resetTimer,
    setSessionType,
    formatTime,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};
