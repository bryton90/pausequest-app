export interface User {
  id: string;
  email: string;
  token?: string;
  preferences?: {
    workDuration?: number;
    breakDuration?: number;
  };
}

declare global {
  interface Window {
    __user?: User;
  }
}

/**
 * Get the current authenticated user
 */
const API_URL = 'http://127.0.0.1:5000/api';

export const getCurrentUser = (): User | null => {
  // In a real app, this would check localStorage, cookies, or a context
  // For now, we'll use a simple window property
  if (typeof window !== 'undefined' && window.__user) {
    return window.__user;
  }
  
  // Fallback to checking localStorage
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Failed to parse user from localStorage', error);
  }
  
  return null;
};

/**
 * Set the current authenticated user
 */
export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  
  if (user) {
    window.__user = user;
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to localStorage', error);
    }
  } else {
    delete window.__user;
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to remove user from localStorage', error);
    }
  }
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

/**
 * Log out the current user
 */
export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  const user: User = { id: data.user.id, email: data.user.email, token: data.token };
  setCurrentUser(user);
  return user;
};

export const register = async (email: string, password: string): Promise<void> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }
};

export const logout = (): void => {
  setCurrentUser(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};
