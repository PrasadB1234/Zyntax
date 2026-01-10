import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// Clerk import removed

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Mock User
  const mockUser: User = {
    id: 'local-user-1',
    name: 'Local User',
    email: 'user@local.app',
    picture: ''
  };

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('mrilo-user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Failed to parse user from local storage:', error);
        localStorage.removeItem('mrilo-user');
        return null;
      }
    }
    return null;
  });

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('mrilo-user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('mrilo-user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 