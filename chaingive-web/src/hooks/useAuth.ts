import { trpc } from '../utils/trpc';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { setUser, setToken, logout: logoutStore } = useAuthStore();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
    },
  });

  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const register = async (email: string, password: string, name: string) => {
    return registerMutation.mutateAsync({ email, password, name });
  };

  const logout = () => {
    logoutStore();
  };

  return {
    login,
    register,
    logout,
    isLoading: loginMutation.isLoading || registerMutation.isLoading,
  };
};