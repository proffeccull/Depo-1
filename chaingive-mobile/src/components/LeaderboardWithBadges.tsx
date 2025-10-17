import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

interface Badge {
  name: string;
  icon: string;
  tier: string;
}

interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  totalDonated: number;
  donationCount: number;
  badges: Badge[];
}

interface LeaderboardProps {
  data: LeaderboardEntry[];
}

export const LeaderboardWithBadges: React.FC<LeaderboardProps> = ({ data }) => {
  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const rankColor = item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : item.rank === 3 ? '#CD7F32' : '#666';
    
    return (
      <View style={styles.item}>
        <View style={[styles.rank, { backgroundColor: rankColor }]}>
          <Text style={styles.rankText}>{item.rank}</Text>
        </View>
        
        <Image
          source={{ uri: item.user.profilePicture || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        
        <View style={styles.info}>
          <Text style={styles.name}>{item.user.firstName} {item.user.lastName}</Text>
          <View style={styles.badges}>
            {item.badges.map((badge, idx) => (
              <Text key={idx} style={styles.badge}>{badge.icon}</Text>
            ))}
          </View>
        </View>
        
        <View style={styles.stats}>
          <Text style={styles.amount}>${item.totalDonated.toLocaleString()}</Text>
          <Text style={styles.count}>{item.donationCount} donations</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.user.id}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    fontSize: 16,
  },
  stats: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  count: {
    fontSize: 12,
    color: '#666',
  },
});
