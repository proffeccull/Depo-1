import authReducer, { login, logout, setUser } from '../authSlice';
import { configureStore } from '@reduxjs/toolkit';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should return the initial state', () => {
    const state = store.getState().auth;
    
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
  });

  it('should handle setUser', () => {
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+234801234567',
      tier: 'Bronze',
      trustScore: 85,
      isVerified: true,
      isAgent: false,
    };

    store.dispatch(setUser(user));
    const state = store.getState().auth;
    
    expect(state.user).toEqual(user);
    expect(state.user?.firstName).toBe('John');
  });

  it('should handle logout', () => {
    // First login
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+234801234567',
      tier: 'Bronze',
      trustScore: 85,
      isVerified: true,
      isAgent: false,
    };
    store.dispatch(setUser(user));
    
    // Then logout
    store.dispatch(logout());
    const state = store.getState().auth;
    
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  describe('login', () => {
    it('should handle pending state', () => {
      store.dispatch(
        login.pending('', { email: 'test@example.com', password: 'password' })
      );
      const state = store.getState().auth;
      
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle fulfilled state', () => {
      const payload = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+234801234567',
          tier: 'Bronze',
          trustScore: 85,
          isVerified: true,
          isAgent: false,
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      store.dispatch(
        login.fulfilled(payload, '', { email: 'test@example.com', password: 'password' })
      );
      const state = store.getState().auth;
      
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(payload.user);
      expect(state.token).toBe('mock-jwt-token');
    });

    it('should handle rejected state', () => {
      const error = new Error('Invalid credentials');
      store.dispatch(
        login.rejected(error, '', { email: 'test@example.com', password: 'wrong' })
      );
      const state = store.getState().auth;
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
