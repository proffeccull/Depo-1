import { useState, useCallback } from 'react';
import { adminApi } from '../api/admin';

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalVolume: number;
    pendingEscrows: number;
    completedCycles: number;
    totalAgents: number;
    totalCoinsInCirculation: number;
  };
  today: {
    newUsers: number;
    transactions: number;
    volume: number;
  };
  pending: {
    kycVerifications: number;
    purchaseRequests: number;
    disputes: number;
  };
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: {
      status: string;
      responseTime: string;
    };
    redis: {
      status: string;
    };
    email: {
      status: string;
    };
    sms: {
      status: string;
    };
  };
  system: {
    memory: {
      usagePercent: number;
    };
  };
}

export const useAdmin = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [detailedSystemHealth, setDetailedSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeSubscription, setRealtimeSubscription] = useState<(() => void) | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResponse, healthResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getSystemHealth(),
      ]);

      if (statsResponse.success) {
        setDashboardStats(statsResponse.data);
      }

      if (healthResponse.success) {
        setSystemHealth(healthResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsers = useCallback(async (filters?: any) => {
    try {
      const response = await adminApi.getUsers(filters);
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      return null;
    }
  }, []);

  const getUserDetails = useCallback(async (userId: string) => {
    try {
      const response = await adminApi.getUserDetails(userId);
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user details');
      return null;
    }
  }, []);

  const banUser = useCallback(async (userId: string, reason: string) => {
    try {
      const response = await adminApi.banUser(userId, reason);
      if (response.success) {
        await refreshData(); // Refresh dashboard stats
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban user');
      throw err;
    }
  }, [refreshData]);

  const unbanUser = useCallback(async (userId: string) => {
    try {
      const response = await adminApi.unbanUser(userId);
      if (response.success) {
        await refreshData(); // Refresh dashboard stats
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unban user');
      throw err;
    }
  }, [refreshData]);

  const promoteToAgent = useCallback(async (userId: string) => {
    try {
      const response = await adminApi.promoteToAgent(userId);
      if (response.success) {
        await refreshData(); // Refresh dashboard stats
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote user');
      throw err;
    }
  }, [refreshData]);

  const getFeatureFlags = useCallback(async () => {
    try {
      const response = await adminApi.getFeatureFlags();
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags');
      return null;
    }
  }, []);

  const toggleFeatureFlag = useCallback(async (featureName: string, enabled: boolean) => {
    try {
      const response = await adminApi.toggleFeatureFlag(featureName, enabled);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle feature flag');
      throw err;
    }
  }, []);

  const getAuditLogs = useCallback(async (filters?: any) => {
    try {
      const response = await adminApi.getAuditLogs(filters);
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
      return null;
    }
  }, []);

  const getPendingKYC = useCallback(async () => {
    try {
      const response = await adminApi.getPendingKYC();
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending KYC');
      return null;
    }
  }, []);

  const approveKYC = useCallback(async (kycId: string) => {
    try {
      const response = await adminApi.approveKYC(kycId);
      if (response.success) {
        await refreshData(); // Refresh dashboard stats
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve KYC');
      throw err;
    }
  }, [refreshData]);

  const rejectKYC = useCallback(async (kycId: string, reason: string) => {
    try {
      const response = await adminApi.rejectKYC(kycId, reason);
      if (response.success) {
        await refreshData(); // Refresh dashboard stats
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject KYC');
      throw err;
    }
  }, [refreshData]);

  const getCoinStats = useCallback(async () => {
    try {
      const response = await adminApi.getCoinStats();
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coin stats');
      return null;
    }
  }, []);

  const approveCoinPurchase = useCallback(async (purchaseId: string, notes?: string) => {
    try {
      const response = await adminApi.approveCoinPurchase(purchaseId, notes);
      if (response.success) {
        await refreshData(); // Refresh dashboard stats
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve coin purchase');
      throw err;
    }
  }, [refreshData]);

  const rejectCoinPurchase = useCallback(async (purchaseId: string, reason: string) => {
    try {
      const response = await adminApi.rejectCoinPurchase(purchaseId, reason);
      if (response.success) {
        await refreshData(); // Refresh dashboard stats
      }
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject coin purchase');
      throw err;
    }
  }, [refreshData]);

  const getSystemLogs = useCallback(async (filters?: any) => {
    try {
      const response = await adminApi.getSystemLogs(filters);
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system logs');
      return null;
    }
  }, []);

  const getPerformanceMetrics = useCallback(async (period?: string) => {
    try {
      const response = await adminApi.getPerformanceMetrics(period);
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance metrics');
      return null;
    }
  }, []);

  const getDetailedSystemHealth = useCallback(async () => {
    try {
      const response = await adminApi.getDetailedSystemHealth();
      if (response.success) {
        setDetailedSystemHealth(response.data);
      }
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load detailed system health');
      return null;
    }
  }, []);

  const getPrometheusMetrics = useCallback(async () => {
    try {
      const response = await adminApi.getPrometheusMetrics();
      return response.success ? response.data : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Prometheus metrics');
      return null;
    }
  }, []);

  const subscribeToRealtimeHealth = useCallback(async (callback: (data: any) => void) => {
    try {
      // Clean up existing subscription
      if (realtimeSubscription) {
        realtimeSubscription();
      }

      const unsubscribe = await adminApi.subscribeToHealthUpdates((data) => {
        setDetailedSystemHealth(data);
        callback(data);
      });

      setRealtimeSubscription(() => unsubscribe);
      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to real-time health updates');
      return null;
    }
  }, [realtimeSubscription]);

  const unsubscribeFromRealtimeHealth = useCallback(() => {
    if (realtimeSubscription) {
      realtimeSubscription();
      setRealtimeSubscription(null);
    }
  }, [realtimeSubscription]);

  const triggerMaintenance = useCallback(async (action: string, reason: string) => {
    try {
      const response = await adminApi.triggerMaintenance(action, reason);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger maintenance');
      throw err;
    }
  }, []);

  return {
    // State
    dashboardStats,
    systemHealth,
    detailedSystemHealth,
    loading,
    error,

    // Actions
    refreshData,
    getUsers,
    getUserDetails,
    banUser,
    unbanUser,
    promoteToAgent,
    getFeatureFlags,
    toggleFeatureFlag,
    getAuditLogs,
    getPendingKYC,
    approveKYC,
    rejectKYC,
    getCoinStats,
    approveCoinPurchase,
    rejectCoinPurchase,
    getSystemLogs,
    getPerformanceMetrics,
    getDetailedSystemHealth,
    getPrometheusMetrics,
    triggerMaintenance,
    subscribeToRealtimeHealth,
    unsubscribeFromRealtimeHealth,
  };
};