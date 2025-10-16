import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email?: string;
  phoneNumber?: string;
  password: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  role: string;
  isVerified: boolean;
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return null;
      
      const response = await api.get('/auth/me');
      return response.data.user as User;
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;
      await AsyncStorage.setItem('auth_token', token);
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'user'], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem('auth_token');
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
  };
};