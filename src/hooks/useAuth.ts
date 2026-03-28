import { useState, useEffect, useCallback } from 'react';
import { User, getMe, loginWithGoogle, loadGame, saveGame } from '@/lib/api';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('roma_token'),
    loading: true,
    error: null,
  });

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('roma_token');
    if (!token) { setState(s => ({ ...s, loading: false })); return; }
    getMe()
      .then(user => setState({ user, token, loading: false, error: null }))
      .catch(() => {
        localStorage.removeItem('roma_token');
        setState({ user: null, token: null, loading: false, error: null });
      });
  }, []);

  const handleGoogleLogin = useCallback(async (idToken: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { token, user } = await loginWithGoogle(idToken);
      localStorage.setItem('roma_token', token);
      setState({ user, token, loading: false, error: null });
      return user;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка входа';
      setState(s => ({ ...s, loading: false, error: msg }));
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('roma_token');
    setState({ user: null, token: null, loading: false, error: null });
  }, []);

  return { ...state, handleGoogleLogin, logout, loadGame, saveGame };
}
