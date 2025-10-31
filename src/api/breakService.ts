import { BreakLogData, ApiResponse } from '../utils/sentiment';

const API_BASE_URL = 'http://127.0.0.1:5000';

export const logBreak = async (data: BreakLogData): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/log-break`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to log break');
  }

  return response.json();
};

export interface SessionData {
  focus_duration: number;
  break_duration: number;
  mood_emoji?: string;
  notes?: string;
}

export interface Session {
  id: number;
  date: string;
  focus_duration: number;
  break_duration: number;
  mood_emoji?: string;
  notes?: string;
  timestamp: string;
}

export interface SessionHistoryResponse {
  sessions: Session[];
  totals: {
    focus_duration: number;
    break_duration: number;
  };
}

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

  const data = await response.json();
  return data.session;
};

export const getSessionHistory = async (limit: number = 10): Promise<SessionHistoryResponse> => {
  const response = await fetch(`${API_BASE_URL}/session-history?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch session history');
  }

  return response.json();
};
