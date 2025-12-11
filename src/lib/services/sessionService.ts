import { Session, SessionData, SessionHistoryResponse } from '../../api/breakService';
import { validateSessionData, validateSessionUpdate, validateSessionId } from '../validations/session.validations';
import { getCurrentUser } from './authService';

const API_BASE_URL = 'http://127.0.0.1:5000';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'An error occurred';
  let errorCode = 'UNKNOWN_ERROR';
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorMessage;
    errorCode = errorData.code || errorCode;
  } catch (e) {
    errorMessage = response.statusText || errorMessage;
  }
  
  const error: ApiError = new Error(errorMessage);
  error.status = response.status;
  error.code = errorCode;
  throw error;
};

/**
 * Create a new session with validation and authorization
 */
export const createSession = async (sessionData: unknown): Promise<Session> => {
  // Validate the session data
  const validatedData = validateSessionData(sessionData);
  
  // Get current user for authorization
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  // Ensure the user is only creating a session for themselves
  if (validatedData.userId !== currentUser.id) {
    throw new Error('Unauthorized to create session for this user');
  }
  
  const response = await fetch(`${API_BASE_URL}/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentUser.token}`,
    },
    body: JSON.stringify(validatedData),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  return response.json();
};

/**
 * Get session history with pagination and authorization
 */
export const getSessionHistory = async (limit: number = 10): Promise<SessionHistoryResponse> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}/sessions?userId=${currentUser.id}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${currentUser.token}`,
    },
  });
  
  if (!response.ok) {
    return handleApiError(response);
  }

  return response.json();
};

/**
 * Get a single session by ID with authorization
 */
export const getSessionById = async (id: unknown): Promise<Session> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  // Validate the ID
  const { id: sessionId } = validateSessionId({ id });
  
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${currentUser.token}`,
    },
  });
  
  if (!response.ok) {
    return handleApiError(response);
  }
  
  const session = await response.json();
  
  // Ensure the user can only access their own sessions
  if (session.userId !== currentUser.id) {
    throw new Error('Unauthorized to access this session');
  }

  return session;
};

/**
 * Update an existing session with validation and authorization
 */
export const updateSession = async (id: unknown, updates: unknown): Promise<Session> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  // Validate the ID and updates
  const { id: sessionId } = validateSessionId({ id });
  const validatedUpdates = validateSessionUpdate({ id: sessionId, ...(updates as object) });
  
  // First, get the session to verify ownership
  const existingSession = await getSessionById(sessionId);
  
  // Ensure the user can only update their own sessions
  if (existingSession.userId !== currentUser.id) {
    throw new Error('Unauthorized to update this session');
  }
  
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentUser.token}`,
    },
    body: JSON.stringify(validatedUpdates),
  });

  if (!response.ok) {
    return handleApiError(response);
  }

  return response.json();
};

/**
 * Delete a session with authorization
 */
export const deleteSession = async (id: unknown): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  // Validate the ID
  const { id: sessionId } = validateSessionId({ id });
  
  // First, get the session to verify ownership
  const existingSession = await getSessionById(sessionId);
  
  // Ensure the user can only delete their own sessions
  if (existingSession.userId !== currentUser.id) {
    throw new Error('Unauthorized to delete this session');
  }
  
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${currentUser.token}`,
    },
  });

  if (!response.ok) {
    return handleApiError(response);
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
