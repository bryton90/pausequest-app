import { Session, SessionData, SessionHistoryResponse } from '../../api/breakService';

const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Create a new session
 */
export const createSession = async (session: SessionData): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();
};

/**
 * Get session history with pagination
 */
export const getSessionHistory = async (limit: number = 10): Promise<SessionHistoryResponse> => {
  const response = await fetch(`${API_BASE_URL}/sessions?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch session history');
  }

  return response.json();
};

/**
 * Get a single session by ID
 */
export const getSessionById = async (id: number): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch session with ID ${id}`);
  }

  return response.json();
};

/**
 * Update an existing session
 */
export const updateSession = async (id: number, updates: Partial<SessionData>): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update session with ID ${id}`);
  }

  return response.json();
};

/**
 * Delete a session
 */
export const deleteSession = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete session with ID ${id}`);
  }
};

/**
 * Get session statistics
 */
export const getSessionStats = async (): Promise<{
  totalSessions: number;
  totalFocusTime: number;
  totalBreakTime: number;
  averageSessionLength: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/sessions/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch session statistics');
  }

  return response.json();
};

/**
 * Fetch a user's historical session data.
 * Returns the most recent `limit` sessions (default 100).
 */
export const getHistoricalSessionData = async (
  userId: string,
  limit: number = 100
): Promise<Session[]> => {
  const response = await fetch(`${API_BASE_URL}/sessions?userId=${userId}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch historical session data');
  }
  const data = await response.json();
  return Array.isArray(data.sessions) ? data.sessions : data;
};

/**
 * Analyze historical sessions to predict an optimal break reminder time.
 * Heuristic: average focus_duration (minutes) across sessions.
 * Returns a Date object relative to NOW (client side).
 */
export const analyzeUserSessionPatterns = (historicalData: Session[]): Date => {
  if (!historicalData || historicalData.length === 0) {
    // Default to 50 minutes from now if no data
    return new Date(Date.now() + 50 * 60 * 1000);
  }

  const totalFocus = historicalData.reduce((sum, s) => sum + (s.focus_duration || 0), 0);
  const avgMinutes = totalFocus / historicalData.length || 50;

  // Cap between 15 and 90 minutes for safety
  const clampedMinutes = Math.min(Math.max(avgMinutes, 15), 90);

  return new Date(Date.now() + clampedMinutes * 60 * 1000);
};
