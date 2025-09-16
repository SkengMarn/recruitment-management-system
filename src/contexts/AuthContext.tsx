import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase/client';

interface AuthContextType {
  user: (User & { role?: string }) | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<(User & { role?: string }) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (authUser: User) => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.error('Profile fetch error:', error);
        // If profile doesn't exist, return user with default role
        return { ...authUser, role: 'user' };
      }
      
      console.log('Profile fetched:', profile);
      return { ...authUser, role: profile?.role || 'user' };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { ...authUser, role: 'user' };
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }
        
        setSession(session);
        
        if (session?.user) {
          console.log('User found, skipping profile fetch for now...');
          // Temporarily skip profile fetch to test if that's causing the hang
          setUser({ ...session.user, role: 'admin' });
        } else {
          console.log('No user session found');
          setUser(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Temporarily skip profile fetch to test if that's causing the hang
          setUser({ ...session.user, role: 'admin' });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
