import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Button, Card, EmptyState } from '../../components/common';
import { ListSkeleton } from '../../components/skeletons';
import { MerchantApi } from '../../api/merchant';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const PaymentProcessingScreen = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.merchantId) {
        Alert.alert('Error', 'No merchant account associated with this user.');
        setLoading(false);
        return;
      }

      try {
        const response = await MerchantApi.getMerchantPayments(user.merchantId);
        setPayments(response);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to fetch payments.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const handleProcessPayment = async (paymentId: string) => {
    try {
      // You might need more data for the processPayment call
      // For now, I'm assuming it just needs the paymentId
      await MerchantApi.processPayment(user.merchantId, { paymentId });
      // Refresh the list after processing
      const response = await MerchantApi.getMerchantPayments(user.merchantId);
      setPayments(response);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process payment.');
    }
  };

  const renderPayment = ({ item }: any) => (
    <Card style={styles.card}>
      <Text style={styles.customer}>{item.customerName || 'N/A'}</Text>
      <Text style={styles.amount}>₦{item.amount.toLocaleString()}</Text>
      <Text style={styles.status}>{item.status}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      {item.status === 'pending' && (
        <Button title="Process" onPress={() => handleProcessPayment(item.id)} size="small" />
      )}
    </Card>
  );

  if (loading) return <ListSkeleton />;
  
  if (payments.length === 0) {
    return (
      <EmptyState
        icon="credit-card"
        title="No payments yet"
        message="Payments will appear here once customers make purchases"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        renderItem={renderPayment}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 16, padding: 16 },
  customer: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  amount: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4 },
  status: { fontSize: 14, color: '#666', marginBottom: 4 },
  date: { fontSize: 12, color: '#999', marginBottom: 12 },
});
