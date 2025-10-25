'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ImpactMetrics {
  totalDonated: number;
  peopleHelped: number;
  rankingsPosition: number;
  coinsEarned: number;
  averageDonation: number;
  donationFrequency: number;
  impactScore: number;
  communityRank: number;
}

interface ChartData {
  labels: string[];
  data: number[];
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

interface MonthlyGoal {
  current: number;
  target: number;
  percentage: number;
  daysLeft: number;
}

interface ImpactStory {
  id: string;
  recipientName: string;
  message: string;
  category: string;
  amount: number;
  timeAgo: string;
  location: string;
}

interface UserImpactAnalytics {
  userId: string;
  timeframe: 'week' | 'month' | 'year';
  metrics: ImpactMetrics;
  charts: {
    donationTrend: ChartData;
    categoryBreakdown: CategoryBreakdown[];
    monthlyGoal: MonthlyGoal;
  };
  impactStories: ImpactStory[];
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
    progress?: number;
  }>;
  recommendations: string[];
  lastUpdated: string;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<UserImpactAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [selectedTimeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/v1/analytics/impact?timeframe=${selectedTimeframe}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Donation Analytics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const renderImpactMetrics = () => {
    if (!analytics) return null;

    const metrics = analytics.metrics;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">💝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Donated
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₦{metrics.totalDonated.toLocaleString()}
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
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    People Helped
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metrics.peopleHelped}
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
                  <span className="text-white font-bold">🏆</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Community Rank
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Top {metrics.rankingsPosition}%
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
                  <span className="text-white font-bold">🪙</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Coins Earned
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {metrics.coinsEarned.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDonationTrendChart = () => {
    if (!analytics?.charts.donationTrend) return null;

    const data = {
      labels: analytics.charts.donationTrend.labels,
      datasets: [
        {
          label: 'Donations',
          data: analytics.charts.donationTrend.data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
      ],
    };

    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Donation Trend</h3>
        <div className="h-64">
          <Line options={chartOptions} data={data} />
        </div>
      </div>
    );
  };

  const renderCategoryBreakdownChart = () => {
    if (!analytics?.charts.categoryBreakdown) return null;

    const data = {
      labels: analytics.charts.categoryBreakdown.map(item => item.category),
      datasets: [
        {
          label: 'Amount by Category',
          data: analytics.charts.categoryBreakdown.map(item => item.amount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        title: {
          display: true,
          text: 'Donations by Category',
        },
      },
    };

    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <Doughnut data={data} options={options} />
          </div>
          <div className="space-y-2">
            {analytics.charts.categoryBreakdown.map((item, index) => (
              <div key={item.category} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-2"
                    style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ₦{item.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}% ({item.count} donations)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthlyGoalProgress = () => {
    if (!analytics?.charts.monthlyGoal) return null;

    const goal = analytics.charts.monthlyGoal;

    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Goal Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Current: ₦{goal.current.toLocaleString()}</span>
            <span className="text-sm font-medium text-gray-700">Target: ₦{goal.target.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(goal.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">{goal.percentage.toFixed(1)}% Complete</span>
            <span className="text-gray-600">{goal.daysLeft} days left</span>
          </div>
        </div>
      </div>
    );
  };

  const renderImpactStories = () => {
    if (!analytics?.impactStories) return null;

    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Impact Stories
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Stories of lives you've helped change
          </p>
        </div>
        <div className="border-t border-gray-200">
          {analytics.impactStories.length === 0 ? (
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center text-gray-500">
                <span className="text-4xl">📖</span>
                <p className="mt-2">No impact stories yet</p>
                <p className="text-sm">Your first donation will create the first story!</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {analytics.impactStories.slice(0, 3).map((story) => (
                <li key={story.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {story.recipientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {story.recipientName}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {story.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            ₦{story.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{story.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{story.location}</span>
                        <span className="text-xs text-gray-500">{story.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Impact Analytics</h2>
          <div className="flex space-x-2">
            {(['week', 'month', 'year'] as const).map((timeframe) => (
              <button
                key={timeframe}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
                disabled
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-5">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="ml-5 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white shadow rounded-lg p-6 h-64">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Impact Analytics</h2>
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((timeframe) => (
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

      {/* Impact Metrics */}
      {renderImpactMetrics()}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDonationTrendChart()}
        {renderCategoryBreakdownChart()}
      </div>

      {/* Monthly Goal Progress */}
      {renderMonthlyGoalProgress()}

      {/* Impact Stories */}
      {renderImpactStories()}

      {/* Export Button */}
      <div className="flex justify-center">
        <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          📊 Export Full Report
        </button>
      </div>
    </div>
  );
};