import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, data?: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase not initialized. Using Mock Auth mode.');
      // Check if we have a mock session in localStorage
      const mockSession = localStorage.getItem('mock_session');
      if (mockSession) {
        const parsed = JSON.parse(mockSession);
        setSession(parsed);
        setUser(parsed.user);
      }
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      // Mock Login
      // FIX: Generate a unique ID based on email to ensure data isolation in mock mode
      const mockUserId = `mock-user-${email.replace(/[^a-zA-Z0-9]/g, '')}`;

      const mockUser: User = {
        id: mockUserId,
        app_metadata: {},
        user_metadata: {
          full_name: 'Usuário Demo',
          farm_id: `farm-${mockUserId}` // Explicitly set farm_id for isolation
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: email,
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString()
      };

      const mockSession: Session = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser
      };

      localStorage.setItem('mock_session', JSON.stringify(mockSession));
      setSession(mockSession);
      setUser(mockUser);
      return { error: null };
    }

    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, data?: any) => {
    if (!supabase) {
      // Mock Signup - just log them in immediately
      return signIn(email, password);
    }

    return await supabase.auth.signUp({
      email,
      password,
      options: { data }
    });
  };

  const signOut = async () => {
    if (!supabase) {
      localStorage.removeItem('mock_session');
      setSession(null);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    signIn,
    signUp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
