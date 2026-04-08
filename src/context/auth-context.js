import { createContext } from 'react';

export const AuthContext = createContext({
  user: {
    id: 'test-user',
    userId: 'test-user',
    fullName: 'Test User',
    universityEmailAddress: 'test@example.edu',
    role: 'USER',
  },
  loading: false,
  loginUser: () => {},
  updateUser: () => {},
  logout: () => {},
});
