import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch user/session from a context or global state
    // For now, we'll simulate a logged-out state.
    setLoading(false);
  }, []);

  const signInWithGoogle = () => console.log('Google Sign-in called');
  const signInWithApple = () => console.log('Apple Sign-in called');
  const signOut = () => {
    setUser(null);
    setSession(null);
    console.log('Signed out');
  };

  return {
    user,
    session,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithApple,
    signOut,
    loading,
    error,
  };
};
