import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { normalizeUsername, usernameToEmail } from '../lib/authEmail';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (usernameRaw: string, password: string) => {
    setAuthError('');
    const username = normalizeUsername(usernameRaw);
    if (!username) {
      setAuthError('Username: 2–32 chars, letters, numbers, . _ - only.');
      return false;
    }
    if (!password) {
      setAuthError('Enter your password.');
      return false;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    if (error) {
      setAuthError(error.message);
      return false;
    }
    return true;
  }, []);

  const signUp = useCallback(async (usernameRaw: string, password: string) => {
    setAuthError('');
    const username = normalizeUsername(usernameRaw);
    if (!username) {
      setAuthError('Username: 2–32 chars, letters, numbers, . _ - only.');
      return false;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return false;
    }

    const { error } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
    });
    if (error) {
      setAuthError(error.message);
      return false;
    }
    return true;
  }, []);

  const signOut = useCallback(async () => {
    setAuthError('');
    await supabase.auth.signOut();
  }, []);

  const user: User | null = session?.user ?? null;

  return {
    session,
    user,
    userId: user?.id ?? null,
    loading,
    authError,
    setAuthError,
    signIn,
    signUp,
    signOut,
  };
}
