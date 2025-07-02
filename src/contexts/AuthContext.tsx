import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo purposes
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@company.com',
    name: 'John Doe',
    role: 'employee',
    department: 'Infrastructure',
    position: 'Senior DevOps Engineer',
    managerId: '3',
    createdAt: new Date('2023-01-15'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    email: 'jane.smith@company.com',
    name: 'Jane Smith',
    role: 'employee',
    department: 'Cloud Operations',
    position: 'Cloud Architect',
    managerId: '3',
    createdAt: new Date('2023-02-20'),
    lastLogin: new Date(),
  },
  {
    id: '3',
    email: 'manager@company.com',
    name: 'Sarah Johnson',
    role: 'manager',
    department: 'Infrastructure',
    position: 'Infrastructure Manager',
    createdAt: new Date('2022-06-10'),
    lastLogin: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt),
          lastLogin: parsedUser.lastLogin ? new Date(parsedUser.lastLogin) : undefined,
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would be an API call
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'password123') {
      const userWithLastLogin = {
        ...foundUser,
        lastLogin: new Date(),
      };
      setUser(userWithLastLogin);
      localStorage.setItem('currentUser', JSON.stringify(userWithLastLogin));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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