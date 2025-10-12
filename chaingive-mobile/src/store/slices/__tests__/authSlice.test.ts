import authReducer, { loginUser, logout, updateUser } from '../authSlice';
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

  it('should handle updateUser', () => {
    const initialUser = {
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
    // To update a user, we must have a user in state first
    store.dispatch(loginUser.fulfilled({ user: initialUser, token: 'mock-token' }, '', { email: '', password: '' }));

    const userUpdate = {
      firstName: 'Jane',
      tier: 'Gold',
    };

    store.dispatch(updateUser(userUpdate));
    const state = store.getState().auth;
    
    expect(state.user).toEqual({ ...initialUser, ...userUpdate });
    expect(state.user?.firstName).toBe('Jane');
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
    store.dispatch(loginUser.fulfilled({ user, token: 'mock-token' }, '', { email: '', password: '' }));
    
    // Then logout
    store.dispatch(logout.fulfilled({}, '', undefined));
    const state = store.getState().auth;
    
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  describe('loginUser', () => {
    it('should handle pending state', () => {
      store.dispatch(
        loginUser.pending('', { email: 'test@example.com', password: 'password' })
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
      };

      store.dispatch(
        loginUser.fulfilled(payload, '', { email: 'test@example.com', password: 'password' })
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
        loginUser.rejected(error, '', { email: 'test@example.com', password: 'wrong' })
      );
      const state = store.getState().auth;
      
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
