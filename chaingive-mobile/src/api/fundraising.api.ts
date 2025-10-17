import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const fundraisingApi = {
  getThermometer: async (categoryId: string) => {
    const response = await axios.get(`${API_URL}/v1/fundraising/thermometer/${categoryId}`);
    return response.data;
  },

  getLeaderboard: async (type = 'donations', period = 'all') => {
    const response = await axios.get(`${API_URL}/v1/fundraising/leaderboard`, {
      params: { type, period },
    });
    return response.data;
  },

  getUserBadges: async (token: string) => {
    const response = await axios.get(`${API_URL}/v1/fundraising/badges`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
