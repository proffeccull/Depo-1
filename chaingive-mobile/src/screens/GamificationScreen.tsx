import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { FundraisingThermometer } from '../components/FundraisingThermometer';
import { LeaderboardWithBadges } from '../components/LeaderboardWithBadges';
import { BadgeDisplay } from '../components/BadgeDisplay';
import { fundraisingApi } from '../api/fundraising.api';

export const GamificationScreen = () => {
  const [loading, setLoading] = useState(true);
  const [thermometer, setThermometer] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [thermometerData, leaderboardData, badgesData] = await Promise.all([
        fundraisingApi.getThermometer('default-category-id'),
        fundraisingApi.getLeaderboard('donations', 'week'),
        fundraisingApi.getUserBadges('user-token'),
      ]);

      setThermometer(thermometerData);
      setLeaderboard(leaderboardData.leaderboard);
      setBadges(badgesData.badges);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {thermometer && (
        <FundraisingThermometer
          raised={thermometer.raised}
          goal={thermometer.goal}
          percentage={thermometer.percentage}
          donorCount={thermometer.donorCount}
          title={thermometer.title}
        />
      )}

      <View style={styles.section}>
        <BadgeDisplay badges={badges} />
      </View>

      <View style={styles.section}>
        <LeaderboardWithBadges data={leaderboard} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
  },
});
