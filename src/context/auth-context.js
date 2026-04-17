import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  loading: false,
  loginUser: () => { },
  updateUser: () => { },
  logout: () => { },
});
