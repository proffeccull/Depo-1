import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchCycles, confirmReceipt } from '../../store/slices/donationSlice';
import Badge from '../../components/common/Badge';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';

const CycleHistoryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cycles, isLoadingCycles } = useSelector((s: RootState) => s.donation);
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCycles({ page: 1, limit: 50, search: searchQuery, status: statusFilter }));
  }, [dispatch, searchQuery, statusFilter]);

  const statuses = ['all', 'pending', 'in_transit', 'received', 'obligated', 'fulfilled', 'defaulted'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cycle History</Text>
      </View>

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, amount, or recipient"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statuses.map(status => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
              onPress={() => setStatusFilter(status === 'all' ? null : status)}
            >
              <Text style={[styles.filterButtonText, statusFilter === status && styles.filterButtonTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={cycles as any}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('CycleDetail', { cycleId: item.id })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.id}</Text>
              <Text style={styles.itemMeta}>₦{Number(item.amount).toLocaleString()} • Due {item.dueDate}</Text>
              <View style={{ marginTop: spacing.xs }}>
                <Badge text={item.status} variant={item.status === 'completed' ? 'completed' : item.status === 'pending' ? 'pending' : 'active'} />
              </View>
            </V
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.secondary },
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  filterContainer: {
    padding: layout.screenPadding,
    backgroundColor: colors.white,
  },
  searchInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.bodyRegular,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  list: { padding: layout.screenPadding },
  item: { backgroundColor: colors.white, borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm },
  itemTitle: { ...typography.bodyRegular, color: colors.text.primary },
  itemMeta: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
  empty: { ...typography.bodyRegular, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg },
  confirmBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignSelf: 'center' },
  confirmBtnText: { ...typography.caption, color: colors.white, fontWeight: '600' },
});

export default CycleHistoryScreen;
