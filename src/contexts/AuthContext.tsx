import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  const [user, setUser] = useState<User | null>({
    id: '1',
    email: 'user@example.com',
    displayName: 'Demo User',
    metadata: {
      creationTime: new Date('2024-01-01').toISOString()
    }
  });
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, _password: string) => {
    setLoading(true);
    try {
      // TODO: Implement your actual authentication logic here
      // For example, call your authentication API
      // const response = await authApi.login(email, password);
      // setUser(response.data.user);
      
      // Mock implementation
      setUser({ 
        id: '1', 
        email,
        displayName: email.split('@')[0] || 'User',
        metadata: {
          creationTime: new Date().toISOString()
        }
      });
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
    // TODO: Implement your logout logic here
    setUser(null);
    // Clear any user data from localStorage/sessionStorage if needed
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
