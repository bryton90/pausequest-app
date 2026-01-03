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
  soundPlayed: boolean;
  escalationSoundPlayed: boolean;
}

type TimerAction =
  | { type: 'TOGGLE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'SET_SESSION_TYPE'; payload: SessionType }
  | { type: 'TICK' }
  | { type: 'SESSION_COMPLETE' }
  | { type: 'MARK_SOUND_PLAYED' }
  | { type: 'MARK_ESCALATION_SOUND_PLAYED' }
  | { type: 'RESET_ESCALATION_SOUND' }
  | { type: 'LOAD_STATE'; payload: TimerState };

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds

const initialState: TimerState = {
  timeLeft: FOCUS_TIME,
  isRunning: false,
  sessionType: 'focus',
  completedSessions: 0,
  soundPlayed: false,
  escalationSoundPlayed: false,
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
          return { 
            ...prevState, 
            isRunning: !prevState.isRunning,
            soundPlayed: prevState.timeLeft === 0 ? false : prevState.soundPlayed, // Reset sound flag if starting from zero
          };
        
        case 'RESET_TIMER':
          return {
            ...prevState,
            timeLeft: prevState.sessionType === 'focus' ? workDuration : breakDuration,
            isRunning: false,
            soundPlayed: false, // Reset sound flag when timer is reset
            escalationSoundPlayed: false, // Reset escalation sound flag when timer is reset
          };
        
        case 'SET_SESSION_TYPE':
          return {
            ...prevState,
            sessionType: action.payload,
            timeLeft: action.payload === 'focus' ? workDuration : breakDuration,
            isRunning: false,
            soundPlayed: false, // Reset sound flag when changing session type
            escalationSoundPlayed: false, // Reset escalation sound flag when changing session type
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
            soundPlayed: true, // Mark that sound was played for this completion
            escalationSoundPlayed: false, // Reset escalation sound flag for new session
          };
        
        case 'MARK_SOUND_PLAYED':
          return {
            ...prevState,
            soundPlayed: true,
          };
        
        case 'MARK_ESCALATION_SOUND_PLAYED':
          return {
            ...prevState,
            escalationSoundPlayed: true,
          };
        
        case 'RESET_ESCALATION_SOUND':
          return {
            ...prevState,
            escalationSoundPlayed: false,
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
      // Play sound immediately before stopping the timer
      console.log('=== PLAYING COMPLETION SOUND ===');
      console.log('Sound enabled:', soundSettings.enabled);
      console.log('Sound volume:', soundSettings.volume);
      
      playSound('complete', soundSettings.volume, soundSettings.enabled);
      
      // If this was a focus session, emit event for stats tracking
      if (state.sessionType === 'focus') {
        console.log('=== EMITTING SESSION COMPLETE EVENT ===');
        console.log('Session type:', state.sessionType);
        console.log('Completed sessions:', state.completedSessions);
        
        const event = new CustomEvent('sessionComplete', {
          detail: { sessionType: 'focus', completedSessions: state.completedSessions + 1 }
        });
        
        console.log('Dispatching event:', event);
        window.dispatchEvent(event);
        console.log('Event dispatched successfully');
      }
      
      // Stop the timer after playing sound
      dispatch({ type: 'SESSION_COMPLETE' });
    }
  }, [state.timeLeft, state.isRunning, soundSettings.enabled, soundSettings.volume, state.sessionType, state.completedSessions]);

  // Backup sound trigger - play sound when timer stops at zero
  useEffect(() => {
    if (state.timeLeft === 0 && !state.isRunning && !state.soundPlayed) {
      console.log('=== BACKUP SOUND TRIGGER ===');
      playSound('complete', soundSettings.volume, soundSettings.enabled);
      dispatch({ type: 'MARK_SOUND_PLAYED' });
    }
  }, [state.timeLeft, state.isRunning, state.soundPlayed, soundSettings.enabled, soundSettings.volume]);

  // Escalation sound trigger - play warning when time is running low
  useEffect(() => {
    // Play escalation sound when there are 10 seconds left and it hasn't been played yet
    if (state.timeLeft === 10 && state.isRunning && !state.escalationSoundPlayed && soundSettings.enabled) {
      console.log('=== PLAYING ESCALATION SOUND ===');
      playSound('escalation', soundSettings.volume, soundSettings.enabled);
      dispatch({ type: 'MARK_ESCALATION_SOUND_PLAYED' });
    }
    
    // Reset escalation sound flag if timer is reset or time increases (like when switching sessions)
    if (state.timeLeft > 10 && state.escalationSoundPlayed) {
      dispatch({ type: 'RESET_ESCALATION_SOUND' });
    }
  }, [state.timeLeft, state.isRunning, state.escalationSoundPlayed, soundSettings.enabled, soundSettings.volume]);

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
