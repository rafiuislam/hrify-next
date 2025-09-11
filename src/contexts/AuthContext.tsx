import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'employee';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers = [
  { id: '1', email: 'admin@hrms.com', password: 'admin123', name: 'Admin User', role: 'admin' as const },
  { id: '2', email: 'hr@hrms.com', password: 'hr123', name: 'HR Manager', role: 'hr' as const },
  { id: '3', email: 'employee@hrms.com', password: 'emp123', name: 'John Doe', role: 'employee' as const },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize default users in localStorage
    const existingUsers = localStorage.getItem('hrms_users');
    if (!existingUsers) {
      localStorage.setItem('hrms_users', JSON.stringify(defaultUsers));
    }

    // Check if user is logged in
    const storedUser = localStorage.getItem('hrms_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('hrms_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('hrms_current_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hrms_current_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}