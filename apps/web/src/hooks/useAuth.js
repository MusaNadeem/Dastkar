// Central auth hook (CLAUDE.md §7 - one place for role logic). Sprint 1.
// Exposes the current user + role; a RequireRole wrapper guards protected routes.
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: 'google' });
  const signOut = () => supabase.auth.signOut();

  return { session, user: session?.user ?? null, loading, signInWithGoogle, signOut };
}
