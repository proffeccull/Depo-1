import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Card, ProgressBar } from '../../components/common';
import { complianceAPI, ComplianceStatus } from '../../api/compliance';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export const ComplianceDashboardScreen = () => {
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchComplianceStatus = async () => {
      if (!user?.corporateAccountId) {
        Alert.alert('Error', 'No corporate account associated with this user.');
        setLoading(false);
        return;
      }

      try {
        const response = await complianceAPI.getComplianceStatus(user.corporateAccountId);
        setCompliance(response.data);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to fetch compliance status.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceStatus();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!compliance) {
    return (
      <View style={styles.container}>
        <Text>No compliance data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Compliance Dashboard</Text>
      
      <Card style={styles.summary}>
        <Text style={styles.summaryTitle}>Overall Compliance</Text>
        <Text style={styles.percentage}>{compliance.overallCompliance}%</Text>
        <ProgressBar progress={compliance.overallCompliance / 100} />
      </Card>

      {compliance.items.map((item) => (
        <Card key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={[styles.badge, styles[item.status]]}>{item.status}</Text>
          </View>
          <ProgressBar progress={item.progress / 100} />
          <Text style={styles.progress}>{item.progress}% Complete</Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  summary: { padding: 20, marginBottom: 16, alignItems: 'center' },
  summaryTitle: { fontSize: 16, color: '#666', marginBottom: 8 },
  percentage: { fontSize: 48, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  card: { padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 12 },
  complete: { backgroundColor: '#4CAF50', color: '#fff' },
  pending: { backgroundColor: '#FFC107', color: '#000' },
  'in-progress': { backgroundColor: '#2196F3', color: '#fff' },
  progress: { fontSize: 12, color: '#666', marginTop: 8 },
});
