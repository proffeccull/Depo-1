import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      login: async (email: string, password: string) => {
        // TODO: Implement actual login logic
        console.log('Login attempt:', email, password);
        // For now, just set a mock user
        const mockUser = {
          id: '1',
          name: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          email,
          phoneNumber: '1234567890',
          role: 'Donor',
          isVerified: true,
        };
        set({ user: mockUser, isAuthenticated: true });
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);