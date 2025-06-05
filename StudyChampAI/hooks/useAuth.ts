import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../utils/api';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: new Date(session.user.created_at),
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: new Date(session.user.created_at),
          });
        } else {
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, logout]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      logout();
    }
    return { error };
  };

  return {
    user,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };
};
