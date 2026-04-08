import { useCallback, useState } from 'react';
import { AuthContext } from './auth-context';
import { normalizeSessionUser } from '../utils/apiData';

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
    localStorage.setItem('accessToken', data.accessToken);
    const nextUser = normalizeSessionUser(data);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((currentUser) => {
      const nextUser = normalizeSessionUser({
        ...(currentUser || {}),
        ...(updates || {}),
      });
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: false, loginUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
