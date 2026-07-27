// Lands here after Google redirects back. supabase-js exchanges the ?code for a session
// automatically (detectSessionInUrl). We wait for that, then route onward.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let done = false;
    const finish = (session) => {
      if (done) return;
      done = true;
      navigate(session ? '/account' : '/login', { replace: true });
    };

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) finish(s);
    });
    const timeout = setTimeout(() => finish(null), 6000); // fallback if exchange never lands

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return <p style={{ padding: 24, fontFamily: 'sans-serif' }}>Finishing sign in...</p>;
}
