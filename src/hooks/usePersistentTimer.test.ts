import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePersistentTimer } from './usePersistentTimer';

describe('usePersistentTimer', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with default focus time', () => {
    const { result } = renderHook(() => usePersistentTimer());
    
    expect(result.current[0].timeLeft).toBe(25 * 60); // 25 minutes in seconds
    expect(result.current[0].isRunning).toBe(false);
    expect(result.current[0].sessionType).toBe('focus');
  });

  it('loads saved state from localStorage', () => {
    const savedState = {
      timeLeft: 1000,
      isRunning: false,
      totalTime: 1500,
      sessionType: 'break' as const,
    };
    
    localStorage.setItem('pausequest-timer', JSON.stringify(savedState));
    
    const { result } = renderHook(() => usePersistentTimer());
    
    expect(result.current[0].timeLeft).toBe(1500);
    expect(result.current[0].sessionType).toBe('focus');
  });

  it('starts timer correctly', () => {
    const { result } = renderHook(() => usePersistentTimer());
    
    act(() => {
      result.current[1].start();
    });
    
    expect(result.current[0].isRunning).toBe(true);
  });

  it('pauses timer correctly', () => {
    const { result } = renderHook(() => usePersistentTimer());
    
    act(() => {
      result.current[1].start();
    });
    
    act(() => {
      result.current[1].pause();
    });
    
    expect(result.current[0].isRunning).toBe(false);
  });

  it('resets timer with custom minutes', () => {
    const { result } = renderHook(() => usePersistentTimer());
    
    act(() => {
      result.current[1].reset(10);
    });
    
    expect(result.current[0].timeLeft).toBe(10 * 60);
    expect(result.current[0].totalTime).toBe(10 * 60);
    expect(result.current[0].isRunning).toBe(false);
  });

  it('switches session type correctly', () => {
    const { result } = renderHook(() => usePersistentTimer());
    
    act(() => {
      result.current[1].setSessionType('break');
    });
    
    expect(result.current[0].sessionType).toBe('break');
    expect(result.current[0].timeLeft).toBe(5 * 60); // Default break time
  });

  it('saves state to localStorage on changes', () => {
    const { result } = renderHook(() => usePersistentTimer());
    
    act(() => {
      result.current[1].start();
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pausequest-timer',
      expect.stringContaining('"isRunning":true')
    );
  });
});
