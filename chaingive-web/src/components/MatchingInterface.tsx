'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

interface Match {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientLocation: string;
  amount: number;
  category: string;
  message: string;
  trustScore: number;
  matchScore: number;
  urgency: 'low' | 'medium' | 'high';
  timeWaiting: number; // days
  aiRecommendation: string;
}

interface MatchingStats {
  totalMatches: number;
  successfulMatches: number;
  averageMatchScore: number;
  matchesByCategory: Record<string, number>;
  recentActivity: Array<{
    type: 'match' | 'donation' | 'completion';
    description: string;
    timestamp: string;
  }>;
}

export const MatchingInterface = () => {
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [stats, setStats] = useState<MatchingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    location: '',
    category: '',
    maxAmount: '',
    minTrustScore: '0.5',
  });

  useEffect(() => {
    loadMatchingStats();
    loadNextMatch();
  }, []);

  const loadMatchingStats = async () => {
    try {
      const response = await apiClient.get('/api/v1/matching/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load matching stats:', error);
    }
  };

  const loadNextMatch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (preferences.location) params.append('location', preferences.location);
      if (preferences.category) params.append('category', preferences.category);
      if (preferences.maxAmount) params.append('maxAmount', preferences.maxAmount);
      if (preferences.minTrustScore) params.append('minTrustScore', preferences.minTrustScore);

      const response = await apiClient.get(`/api/v1/matching/recommend?${params}`);
      setCurrentMatch(response.data.match || null);
    } catch (error) {
      console.error('Failed to load match:', error);
      setCurrentMatch(null);
    } finally {
      setLoading(false);
    }
  };

  const acceptMatch = async () => {
    if (!currentMatch) return;

    setActionLoading(true);
    try {
      await apiClient.post(`/api/v1/matching/${currentMatch.id}/accept`);
      // Refresh data
      await loadMatchingStats();
      await loadNextMatch();
    } catch (error) {
      console.error('Failed to accept match:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectMatch = async (reason?: string) => {
    if (!currentMatch) return;

    setActionLoading(true);
    try {
      await apiClient.post(`/api/v1/matching/${currentMatch.id}/reject`, { reason });
      await loadNextMatch();
    } catch (error) {
      console.error('Failed to reject match:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">AI Matching Dashboard</h2>
        <button
          onClick={loadNextMatch}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Find Next Match'}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🎯</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Matches
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalMatches.toLocaleString()}
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
                      Success Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalMatches > 0
                        ? ((stats.successfulMatches / stats.totalMatches) * 100).toFixed(1)
                        : 0}%
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
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🤖</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg AI Score
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(stats.averageMatchScore * 100).toFixed(1)}%
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
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Matches
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalMatches - stats.successfulMatches}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Matching Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={preferences.location}
              onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Lagos"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={preferences.category}
              onChange={(e) => setPreferences(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Categories</option>
              <option value="medical">Medical</option>
              <option value="education">Education</option>
              <option value="business">Business</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Amount (₦)</label>
            <input
              type="number"
              value={preferences.maxAmount}
              onChange={(e) => setPreferences(prev => ({ ...prev, maxAmount: e.target.value }))}
              placeholder="50000"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Min Trust Score</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={preferences.minTrustScore}
              onChange={(e) => setPreferences(prev => ({ ...prev, minTrustScore: e.target.value }))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={loadNextMatch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Current Match */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            AI Recommended Match
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Our AI has found the best recipient match based on your preferences and community needs
          </p>
        </div>

        {loading ? (
          <div className="px-4 py-5 sm:p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ) : currentMatch ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {currentMatch.recipientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {currentMatch.recipientName}
                    </h4>
                    <p className="text-sm text-gray-500">{currentMatch.recipientLocation}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Amount Needed:</span>
                    <span className="ml-2 text-lg font-semibold text-gray-900">
                      ₦{currentMatch.amount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {currentMatch.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Trust Score:</span>
                    <span className={`ml-2 text-lg font-semibold ${getTrustScoreColor(currentMatch.trustScore)}`}>
                      {(currentMatch.trustScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">AI Match Score:</span>
                    <span className="ml-2 text-lg font-semibold text-purple-600">
                      {(currentMatch.matchScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-500">Urgency:</span>
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(currentMatch.urgency)}`}>
                    {currentMatch.urgency.toUpperCase()}
                  </span>
                  <span className="ml-4 text-sm text-gray-500">
                    Waiting: {currentMatch.timeWaiting} days
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Their Story:</h5>
                  <p className="text-sm text-gray-700">{currentMatch.message}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">🤖 AI Recommendation:</h5>
                  <p className="text-sm text-blue-700">{currentMatch.aiRecommendation}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={acceptMatch}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Accept & Donate'}
              </button>
              <button
                onClick={() => rejectMatch()}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Skip This Match
              </button>
              <button
                onClick={() => rejectMatch('Not interested in this category')}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Not Interested
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center text-gray-500">
              <span className="text-4xl">🎯</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No matches available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your preferences or check back later for new opportunities.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Matching Activity
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {activity.type === 'match' ? '🎯' :
                           activity.type === 'donation' ? '💝' : '✅'}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};