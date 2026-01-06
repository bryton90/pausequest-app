import { supabase, getCurrentUser as getSupabaseUser, isAuthenticated as checkSupabaseAuth } from '../supabase';
import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  preferences?: {
    workDuration?: number;
    breakDuration?: number;
  };
}

export interface AuthResponse {
  user: User | null;
  session: any | null;
  profile: any | null;
  error?: string;
}

declare global {
  interface Window {
    __user?: User;
  }
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Get the current authenticated user from Supabase
 */
export const getCurrentUserAuth = async (): Promise<User | null> => {
  try {
    // First check window property for immediate access
    if (typeof window !== 'undefined' && window.__user) {
      return window.__user;
    }
    
    // Check Supabase auth
    const user = await getSupabaseUser();
    if (!user) {
      return null;
    }

    const userObj: User = {
      id: user.id,
      email: user.email || '',
      email_verified: user.user_metadata?.['email_confirmed_at'] ? true : false,
    };

    // Cache in window property
    if (typeof window !== 'undefined') {
      window.__user = userObj;
    }

    return userObj;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

/**
 * Set the current authenticated user in window property
 */
export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  
  if (user) {
    window.__user = user;
  } else {
    delete window.__user;
  }
};

/**
 * Check if the user is authenticated
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    return await checkSupabaseAuth();
  } catch (error) {
    console.error('Failed to check authentication:', error);
    return false;
  }
};

/**
 * Log in user with email and password
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Validate input
    const validatedData = loginSchema.parse({ email, password });

    // Call login API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        user: null,
        session: null,
        profile: null,
        error: data.error || 'Login failed',
      };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      email_verified: data.user.email_verified,
    };

    // Set user in window property
    setCurrentUser(user);

    return {
      user,
      session: data.session,
      profile: data.profile,
    };
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        user: null,
        session: null,
        profile: null,
        error: error.issues[0]?.message || 'Validation error',
      };
    }

    return {
      user: null,
      session: null,
      profile: null,
      error: 'An unexpected error occurred during login',
    };
  }
};

/**
 * Register a new user
 */
export const register = async (email: string, password: string, confirmPassword: string): Promise<AuthResponse> => {
  try {
    // Validate input
    const validatedData = registerSchema.parse({ email, password, confirmPassword });

    // Call register API
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        user: null,
        session: null,
        profile: null,
        error: data.error || 'Registration failed',
      };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      email_verified: data.user.email_verified,
    };

    // Set user in window property if session exists
    if (data.session) {
      setCurrentUser(user);
    }

    return {
      user,
      session: data.session,
      profile: data.profile,
    };
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        user: null,
        session: null,
        profile: null,
        error: error.issues[0]?.message || 'Validation error',
      };
    }

    return {
      user: null,
      session: null,
      profile: null,
      error: 'An unexpected error occurred during registration',
    };
  }
};

/**
 * Log out the current user
 */
export const logout = async (): Promise<{ error?: string }> => {
  try {
    // Get current session for token
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
      },
      body: JSON.stringify({ 
        refreshToken: session?.refresh_token 
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.error || 'Logout failed' };
    }

    // Sign out from Supabase client
    await supabase.auth.signOut();

    // Clear window property
    setCurrentUser(null);

    return {};
  } catch (error) {
    console.error('Logout error:', error);
    return { error: 'An unexpected error occurred during logout' };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        email_verified: session.user.user_metadata?.['email_confirmed_at'] ? true : false,
      };
      setCurrentUser(user);
      callback(user);
    } else {
      setCurrentUser(null);
      callback(null);
    }
  });
};

/**
 * Password reset request
 */
export const resetPassword = async (email: string): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    console.error('Password update error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

// Legacy exports for backward compatibility
export const getCurrentUser = getCurrentUserAuth;
export const isAuthenticated = isUserAuthenticated;
