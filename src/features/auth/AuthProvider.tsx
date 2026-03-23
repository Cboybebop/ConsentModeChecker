import React, { createContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseEnabled } from '../../lib/supabaseClient';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInWithMagicLink: (email: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !supabaseEnabled) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? error.message : null;
    } catch {
      return 'An unexpected error occurred. Please try again.';
    }
  }, []);

  const signInWithMagicLink = useCallback(async (email: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      return error ? error.message : null;
    } catch {
      return 'An unexpected error occurred. Please try again.';
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return error ? error.message : null;
    } catch {
      return 'An unexpected error occurred. Please try again.';
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // Silently fail — user will see they're still logged in
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<string | null> => {
    if (!supabase) return 'Supabase is not configured.';
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return error ? error.message : null;
    } catch {
      return 'An unexpected error occurred. Please try again.';
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signInWithMagicLink, signUp, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}
