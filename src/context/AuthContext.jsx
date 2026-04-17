import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';
import { normalizeSessionUser } from '../utils/apiData';

const resolveSessionToken = (data = {}) => data.accessToken ?? data.token ?? data.jwt ?? data.authToken ?? '';

const resolveSessionUser = (data = {}) => normalizeSessionUser(
  data.user
  ?? data.userDetails
  ?? data.account
  ?? data.profile
  ?? data
);

const getStoredUser = () => {
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('user');

  if (!token || !userData) return null;

  try {
    return normalizeSessionUser(JSON.parse(userData));
  } catch {
    localStorage.clear();
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const loginUser = useCallback((data) => {
    const nextToken = resolveSessionToken(data || {});
    const nextUser = resolveSessionUser(data || {});

    if (nextToken) {
      localStorage.setItem('accessToken', nextToken);
    }
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((currentUser) => {
      const nextUser = normalizeSessionUser(
        currentUser ? { ...currentUser, ...updates } : updates
      );
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading: false,
    loginUser,
    updateUser,
    logout,
  }), [user, loginUser, updateUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
