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
