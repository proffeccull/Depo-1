import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card, Button, EmptyState } from '../../components/common';
import { ListSkeleton } from '../../components/skeletons';

export const CommunityVotingScreen = () => {
  const [loading, setLoading] = useState(false);
  const [proposals, setProposals] = useState([
    { id: '1', title: 'Add Education Category', votes: 150, status: 'active', endDate: '2025-10-25' },
    { id: '2', title: 'Increase Matching Pool', votes: 89, status: 'active', endDate: '2025-10-30' },
  ]);

  const handleVote = (id: string, support: boolean) => {
    // API call
  };

  const renderProposal = ({ item }: any) => (
    <Card style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.votes}>{item.votes} votes</Text>
      <Text style={styles.endDate}>Ends: {item.endDate}</Text>
      
      <View style={styles.buttons}>
        <Button
          title="👍 Support"
          onPress={() => handleVote(item.id, true)}
          style={styles.voteBtn}
          accessibilityLabel={`Vote in support of ${item.title}`}
        />
        <Button
          title="👎 Oppose"
          onPress={() => handleVote(item.id, false)}
          variant="secondary"
          style={styles.voteBtn}
          accessibilityLabel={`Vote against ${item.title}`}
        />
      </View>
    </Card>
  );

  if (loading) return <ListSkeleton />;
  
  if (proposals.length === 0) {
    return (
      <EmptyState
        icon="ballot"
        title="No active proposals"
        message="Check back later for community voting opportunities"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={proposals}
        renderItem={renderProposal}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 16, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  votes: { fontSize: 14, color: '#4CAF50', marginBottom: 4 },
  endDate: { fontSize: 12, color: '#666', marginBottom: 16 },
  buttons: { flexDirection: 'row', gap: 12 },
  voteBtn: { flex: 1 },
});
