'use client';

import * as React from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { syncAuthenticatedUser, type BackendSyncedUser } from '@/lib/auth/backend-auth';
import { getBrowserSupabaseClient } from '@/lib/supabase/browser-client';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  syncedUser: BackendSyncedUser | null;
  isLoading: boolean;
  isSupabaseEnabled: boolean;
  refreshSyncedUser: (accessToken?: string) => Promise<BackendSyncedUser | null>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => getBrowserSupabaseClient(), []);
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [syncedUser, setSyncedUser] = React.useState<BackendSyncedUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshSyncedUser = React.useCallback(
    async (accessToken?: string) => {
      if (!supabase) {
        setSyncedUser(null);
        return null;
      }

      const resolvedToken = accessToken ?? session?.access_token;
      if (!resolvedToken) {
        setSyncedUser(null);
        return null;
      }

      const nextSyncedUser = await syncAuthenticatedUser(resolvedToken);
      setSyncedUser(nextSyncedUser);
      return nextSyncedUser;
    },
    [session?.access_token, supabase],
  );

  React.useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (error) {
        setSession(null);
        setUser(null);
        setSyncedUser(null);
        setIsLoading(false);
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);

      if (data.session?.access_token) {
        try {
          await refreshSyncedUser(data.session.access_token);
        } catch {
          setSyncedUser(null);
        }
      }

      setIsLoading(false);
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.access_token) {
        setSyncedUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      void refreshSyncedUser(nextSession.access_token)
        .catch(() => {
          setSyncedUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshSyncedUser, supabase]);

  const signOut = React.useCallback(async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setSyncedUser(null);
  }, [supabase]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      syncedUser,
      isLoading,
      isSupabaseEnabled: Boolean(supabase),
      refreshSyncedUser,
      signOut,
    }),
    [isLoading, refreshSyncedUser, session, signOut, supabase, syncedUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
