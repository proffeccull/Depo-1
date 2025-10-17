import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Card } from '../../components/common';
import { useNavigation } from '@react-navigation/native';

const gateways = [
  { id: 'btc', name: 'Bitcoin', icon: '₿', fee: '1%', time: '10-30 min' },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ', fee: '0.5%', time: '2-5 min' },
  { id: 'usdt', name: 'USDT', icon: '₮', fee: '0.3%', time: '1-3 min' },
  { id: 'bnb', name: 'BNB', icon: 'B', fee: '0.4%', time: '1-2 min' },
];

export const CryptoGatewaySelectionScreen = () => {
  const navigation = useNavigation();

  const renderGateway = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CryptoPayment', { gateway: item.id })}
      accessibilityLabel={`Select ${item.name} for payment`}
    >
      <Card style={styles.card}>
        <Text style={styles.icon}>{item.icon}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.detail}>Fee: {item.fee}</Text>
          <Text style={styles.detail}>Time: {item.time}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Crypto Gateway</Text>
      <Text style={styles.subtitle}>Choose your preferred cryptocurrency</Text>
      
      <FlatList
        data={gateways}
        renderItem={renderGateway}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12 },
  icon: { fontSize: 32, marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  detail: { fontSize: 12, color: '#666' },
  arrow: { fontSize: 24, color: '#4CAF50' },
});
