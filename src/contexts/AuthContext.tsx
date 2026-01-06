import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, setCurrentUser as setAuthUser } from '../lib/services/authService';

export type User = {
  metadata: any;
  id: string;
  email: string;
  displayName?: string | undefined;
  photoURL?: string;
  bio?: string;
  stats?: {
    totalFocusTime?: number;
    sessionsCompleted?: number;
    currentStreak?: number;
  };
  preferences?: {
    workDuration?: number;
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email?: boolean;
      push?: boolean;
      breakReminders?: boolean;
    };
  };
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      // Convert authService User to AuthContext User format
      const adaptedUser: User = {
        id: storedUser.id,
        email: storedUser.email,
        displayName: storedUser.email.split('@')[0] || 'User',
        metadata: { creationTime: new Date().toISOString() }
      };
      
      // Only add preferences if workDuration is defined
      if (storedUser.preferences?.workDuration) {
        adaptedUser.preferences = {
          workDuration: storedUser.preferences.workDuration,
          theme: 'system',
          notifications: {
            email: false,
            push: false,
            breakReminders: true
          }
        };
      }
      setUser(adaptedUser);
    } else {
      // For development: Create a mock user automatically
      const mockUser: User = {
        id: 'dev-user-1',
        email: 'dev@pausequest.app',
        displayName: 'Developer User',
        metadata: {
          creationTime: new Date().toISOString()
        },
        preferences: {
          workDuration: 25 * 60, // 25 minutes in seconds
          theme: 'system',
          notifications: {
            email: false,
            push: false,
            breakReminders: true
          }
        }
      };
      
      setUser(mockUser);
      
      // Save to localStorage in authService format
      const authServiceUser: any = {
        id: mockUser.id,
        email: mockUser.email,
        preferences: {
          workDuration: mockUser.preferences?.workDuration
        }
      };
      setAuthUser(authServiceUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    setLoading(true);
    try {
      // TODO: Implement your actual authentication logic here
      // For example, call your authentication API
      // const response = await authApi.login(email, password);
      // setUser(response.data.user);
      
      // Mock implementation - create user and save to localStorage
      const mockUser: User = { 
        id: '1', 
        email,
        displayName: email.split('@')[0] || 'User',
        metadata: {
          creationTime: new Date().toISOString()
        }
      };
      
      setUser(mockUser);
      // Save to localStorage in authService format
      const authServiceUser: any = {
        id: mockUser.id,
        email: mockUser.email
      };
      if (mockUser.preferences?.workDuration) {
        authServiceUser.preferences = {
          workDuration: mockUser.preferences.workDuration
        };
      }
      setAuthUser(authServiceUser);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // TODO: Implement your profile update API call
      // await userApi.updateProfile(user.id, updates);
      
      // Update local state
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthUser(null);
    // Clear any user data from localStorage/sessionStorage
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateProfile,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
