import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  email: string;
  stats?: {
    totalFocusTime?: number;
    sessionsCompleted?: number;
    currentStreak?: number;
  };
  preferences?: {
    workDuration?: number;
  };
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // TODO: Implement your actual authentication logic here
      // For example, call your authentication API
      // const response = await authApi.login(email, password);
      // setUser(response.data.user);
      
      // Mock implementation
      setUser({ id: '1', email });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // TODO: Implement your logout logic here
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
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
