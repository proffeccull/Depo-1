'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

interface FraudAlert {
  id: string;
  transactionId?: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  details: any;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

interface FraudStatistics {
  totalChecks: number;
  fraudulentTransactions: number;
  blockedTransactions: number;
  falsePositives: number;
  detectionAccuracy: number;
  averageResponseTime: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  recentAlerts: FraudAlert[];
}

export const FraudDashboard = () => {
  const [statistics, setStatistics] = useState<FraudStatistics | null>(null);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadFraudData();
  }, [selectedTimeframe]);

  const loadFraudData = async () => {
    try {
      setLoading(true);

      // Load statistics
      const statsResponse = await apiClient.get(`/api/v1/fraud/statistics?timeframe=${selectedTimeframe}`);
      setStatistics(statsResponse.data);

      // Load alerts
      const alertsResponse = await apiClient.get('/api/v1/fraud/alerts?acknowledged=false&limit=20');
      setAlerts(alertsResponse.data.alerts || []);
    } catch (error) {
      console.error('Failed to load fraud data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await apiClient.put(`/api/v1/fraud/alerts/${alertId}/acknowledge`);
      // Refresh alerts
      const alertsResponse = await apiClient.get('/api/v1/fraud/alerts?acknowledged=false&limit=20');
      setAlerts(alertsResponse.data.alerts || []);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600';
      case 'acknowledged': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Fraud Detection Dashboard</h2>
        <div className="flex space-x-2">
          {(['day', 'week', 'month'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Checks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statistics.totalChecks.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🚨</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Fraudulent
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statistics.fraudulentTransactions.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Accuracy
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(statistics.detectionAccuracy * 100).toFixed(1)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">⚠️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      False Positives
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statistics.falsePositives.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Distribution */}
      {statistics && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Distribution</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.riskDistribution.low}</div>
              <div className="text-sm text-gray-500">Low Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statistics.riskDistribution.medium}</div>
              <div className="text-sm text-gray-500">Medium Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.riskDistribution.high}</div>
              <div className="text-sm text-gray-500">High Risk</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Fraud Alerts
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Latest fraud detection alerts requiring attention
          </p>
        </div>
        <div className="border-t border-gray-200">
          {alerts.length === 0 ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center text-gray-500">
                <span className="text-4xl">🛡️</span>
                <p className="mt-2">No active fraud alerts</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <li key={alert.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          alert.riskLevel === 'high' ? 'bg-red-100' :
                          alert.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <span className="text-sm font-medium">
                            {alert.riskLevel === 'high' ? '🚨' :
                             alert.riskLevel === 'medium' ? '⚠️' : 'ℹ️'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {alert.reason}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(alert.createdAt).toLocaleString()}
                          {alert.transactionId && ` • Transaction: ${alert.transactionId}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(alert.riskLevel)}`}>
                        {alert.riskLevel.toUpperCase()}
                      </span>
                      <span className={`text-sm ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                      {alert.status === 'active' && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};