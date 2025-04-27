import React, { createContext, useState, useContext, useEffect } from 'react';
import { signInWithRegistration } from '../lib/supabase';

type UserRole = 'student' | 'staff' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  serialId?: string; // Only for students
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, serialId?: string) => Promise<void>;
  logout: () => void;
  checkRole: (roles: UserRole[]) => boolean;
}

// Sample users for demonstration
const sampleUsers: User[] = [
  { id: '1', name: 'Vedant', email: 'student@college.edu', role: 'student', serialId: 'STU001' },
  { id: '2', name: 'Jane Staff', email: 'staff@college.edu', role: 'staff' },
  { id: '3', name: 'Admin User', email: 'admin@college.edu', role: 'admin' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (emailOrReg: string, password: string) => {
    setIsLoading(true);
    try {
      // Try student login with registration number
      const user = await signInWithRegistration(emailOrReg, password);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
      return;
    } catch (studentErr) {
      // fallback to staff/admin login (if needed, not implemented here)
      setIsLoading(false);
      throw studentErr;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole, serialId?: string) => {
    setIsLoading(true);
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const existingUser = sampleUsers.find(u => u.email === email);
        if (existingUser) {
          reject(new Error('User already exists'));
        } else {
          const newUser: User = {
            id: (sampleUsers.length + 1).toString(),
            name,
            email,
            role,
            ...(role === 'student' && { serialId }),
          };
          
          // In a real app, we would save to a database here
          sampleUsers.push(newUser);
          
          setUser(newUser);
          localStorage.setItem('user', JSON.stringify(newUser));
          resolve();
        }
        setIsLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const checkRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};