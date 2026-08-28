import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (mounted) setSession(data.session);

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          if (mounted) setSession(nextSession);
        });

        if (mounted) setLoading(false);
        return () => subscription.subscription.unsubscribe();
      } catch (authError) {
        if (mounted) {
          setError(authError instanceof Error ? authError.message : 'Unable to connect to authentication.');
          setLoading(false);
        }
        return undefined;
      }
    };

    let cleanup: (() => void) | undefined;
    void start().then((unsubscribe) => {
      cleanup = unsubscribe;
    });

    return () => {
      mounted = false;
      cleanup?.();
    };
  }, []);

  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
