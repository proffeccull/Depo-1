import { api } from './index';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AdminApi {
  // Dashboard
  async getDashboardStats(): Promise<ApiResponse> {
    return api.get('/admin/dashboard/stats');
  }

  // User Management
  async getUsers(filters?: any): Promise<ApiResponse> {
    return api.get('/admin/users', { params: filters });
  }

  async getUserDetails(userId: string): Promise<ApiResponse> {
    return api.get(`/admin/users/${userId}`);
  }

  async createUser(userData: any): Promise<ApiResponse> {
    return api.post('/admin/users', userData);
  }

  async updateUser(userId: string, userData: any): Promise<ApiResponse> {
    return api.patch(`/admin/users/${userId}`, userData);
  }

  async deleteUser(userId: string, reason: string): Promise<ApiResponse> {
    return api.delete(`/admin/users/${userId}`, { data: { reason } });
  }

  async banUser(userId: string, reason: string): Promise<ApiResponse> {
    return api.post(`/admin/users/${userId}/ban`, { reason });
  }

  async unbanUser(userId: string): Promise<ApiResponse> {
    return api.post(`/admin/users/${userId}/unban`);
  }

  async getUserPermissions(userId: string): Promise<ApiResponse> {
    return api.get(`/admin/users/${userId}/permissions`);
  }

  // Agent Management
  async promoteToAgent(userId: string): Promise<ApiResponse> {
    return api.post(`/admin/advanced/users/${userId}/promote-to-agent`);
  }

  async updateUserRole(userId: string, role: string): Promise<ApiResponse> {
    return api.patch(`/admin/advanced/users/${userId}/role`, { role });
  }

  // KYC Management
  async getPendingKYC(): Promise<ApiResponse> {
    return api.get('/admin/kyc/pending');
  }

  async approveKYC(kycId: string): Promise<ApiResponse> {
    return api.post(`/admin/kyc/${kycId}/approve`);
  }

  async rejectKYC(kycId: string, reason: string): Promise<ApiResponse> {
    return api.post(`/admin/kyc/${kycId}/reject`, { reason });
  }

  // Transaction Management
  async overrideDonation(transactionId: string, data: any): Promise<ApiResponse> {
    return api.patch(`/admin/transactions/${transactionId}`, data);
  }

  // Coin System Management
  async getCoinStats(): Promise<ApiResponse> {
    return api.get('/admin/coins/stats');
  }

  async getPendingPurchases(): Promise<ApiResponse> {
    return api.get('/admin/coins/purchases/pending');
  }

  async approveCoinPurchase(purchaseId: string, notes?: string): Promise<ApiResponse> {
    return api.post(`/admin/coins/purchases/${purchaseId}/approve`, { notes });
  }

  async rejectCoinPurchase(purchaseId: string, reason: string): Promise<ApiResponse> {
    return api.post(`/admin/coins/purchases/${purchaseId}/reject`, { rejectionReason: reason });
  }

  async mintCoinsToAgent(agentId: string, amount: number, reason: string): Promise<ApiResponse> {
    return api.post(`/admin/coins/agents/${agentId}/mint`, { amount, reason });
  }

  async burnCoinsFromAgent(agentId: string, amount: number, reason: string): Promise<ApiResponse> {
    return api.post(`/admin/coins/agents/${agentId}/burn`, { amount, reason });
  }

  async transferCoinsBetweenAgents(fromAgentId: string, toAgentId: string, amount: number, reason: string): Promise<ApiResponse> {
    return api.post('/admin/coins/agents/transfer', { fromAgentId, toAgentId, amount, reason });
  }

  // Feature Flags
  async getFeatureFlags(): Promise<ApiResponse> {
    return api.get('/admin/advanced/features');
  }

  async toggleFeatureFlag(featureName: string, isEnabled: boolean): Promise<ApiResponse> {
    return api.post('/admin/advanced/features/toggle', { featureName, isEnabled });
  }

  // Leaderboard Management
  async resetLeaderboard(reason: string): Promise<ApiResponse> {
    return api.post('/admin/advanced/leaderboard/reset', { reason });
  }

  async adjustLeaderboardScore(userId: string, scoreAdjustment: number, reason: string): Promise<ApiResponse> {
    return api.patch(`/admin/advanced/leaderboard/users/${userId}/score`, { scoreAdjustment, reason });
  }

  // Audit Logs
  async getAuditLogs(filters?: any): Promise<ApiResponse> {
    return api.get('/admin/advanced/logs', { params: filters });
  }

  // System Health & Monitoring
  async getSystemHealth(): Promise<ApiResponse> {
    return api.get('/v1/admin/system/health');
  }

  async getDetailedSystemHealth(): Promise<ApiResponse> {
    return api.get('/v1/admin/system/health/detailed');
  }

  async getDatabaseHealth(): Promise<ApiResponse> {
    return api.get('/v1/admin/system/health/database');
  }

  async getPerformanceMetrics(period?: string): Promise<ApiResponse> {
    return api.get('/v1/admin/system/metrics', { params: { period } });
  }

  async getPrometheusMetrics(): Promise<ApiResponse> {
    return api.get('/v1/admin/system/metrics/prometheus');
  }

  async getSystemLogs(filters?: any): Promise<ApiResponse> {
    return api.get('/v1/admin/system/logs', { params: filters });
  }

  async triggerMaintenance(action: string, reason: string): Promise<ApiResponse> {
    return api.post('/v1/admin/system/maintenance', { action, reason });
  }

  async getBackupStatus(): Promise<ApiResponse> {
    return api.get('/v1/admin/system/backup');
  }

  // Real-time monitoring (WebSocket-based)
  async subscribeToHealthUpdates(callback: (data: any) => void): Promise<() => void> {
    // This would integrate with WebSocket service for real-time updates
    // For now, return a mock unsubscribe function
    const interval = setInterval(async () => {
      try {
        const response = await this.getDetailedSystemHealth();
        if (response.success) {
          callback(response.data);
        }
      } catch (error) {
        console.error('Failed to get real-time health update:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }

  // Email & Communication
  async sendBulkEmail(data: any): Promise<ApiResponse> {
    return api.post('/admin/advanced/emails/bulk', data);
  }

  async sendSingleEmail(data: any): Promise<ApiResponse> {
    return api.post('/admin/advanced/emails/single', data);
  }

  // God Mode (Extreme Caution)
  async overrideTransactionStatus(transactionId: string, status: string, notes?: string): Promise<ApiResponse> {
    return api.patch(`/admin/godmode/transactions/${transactionId}/status`, { status, notes });
  }

  async forceReleaseEscrow(escrowId: string, reason: string): Promise<ApiResponse> {
    return api.post(`/admin/godmode/escrows/${escrowId}/release`, { reason });
  }

  async overrideUserBalance(userId: string, amount: number, reason: string, balanceType?: string): Promise<ApiResponse> {
    return api.patch(`/admin/godmode/users/${userId}/balance`, { amount, reason, balanceType });
  }

  async overrideUserVerification(userId: string, data: any): Promise<ApiResponse> {
    return api.patch(`/admin/godmode/users/${userId}/verification`, data);
  }

  async forceDeleteRecord(tableName: string, recordId: string, reason: string): Promise<ApiResponse> {
    return api.delete(`/admin/godmode/records/${tableName}/${recordId}`, { data: { reason } });
  }

  async executeRawQuery(query: string, params?: any[]): Promise<ApiResponse> {
    return api.post('/admin/godmode/database/query', { query, params });
  }
}

export const adminApi = new AdminApi();