import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser as useClerkUser, useClerk } from '@clerk/clerk-react';

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();
  const { signOut } = useClerk();
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      setUserState({
        id: clerkUser.id,
        name: clerkUser.fullName || 'User',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        picture: clerkUser.imageUrl
      });
    } else if (isLoaded && !isSignedIn) {
      setUserState(null);
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  const setUser = (newUser: User | null) => {
    if (newUser === null) {
      signOut();
    } else {
      console.warn("Manual user setting is deprecated. Use Clerk for authentication.");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading: !isLoaded }}>
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