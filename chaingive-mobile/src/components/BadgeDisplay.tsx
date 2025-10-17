import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Badge {
  name: string;
  icon: string;
  tier: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges }) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return '#B9F2FF';
      case 'platinum': return '#E5E4E2';
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return '#9C27B0';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Badges</Text>
      <View style={styles.grid}>
        {badges.map((badge, index) => (
          <View key={index} style={[styles.badge, { backgroundColor: getTierColor(badge.tier) }]}>
            <Text style={styles.icon}>{badge.icon}</Text>
            <Text style={styles.name}>{badge.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  icon: {
    fontSize: 32,
    marginBottom: 4,
  },
  name: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
