import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useAdmin } from '../../hooks/useAdmin';
import { Card, Button, Badge, LoadingSpinner, Input } from '../../components/common';
import { colors, spacing, typography } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

type AdminAuditLogsNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
  metadata?: Record<string, any>;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AuditLogsScreen() {
  const navigation = useNavigation<AdminAuditLogsNavigationProp>();
  const { getAuditLogs } = useAdmin();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Filter options
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [userNames, setUserNames] = useState<string[]>([]);

  const pageSize = 20;

  useEffect(() => {
    loadAuditLogs();
  }, [currentPage]);

  const loadAuditLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const filters: any = {
        page: currentPage,
        limit: pageSize,
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      if (selectedAction) {
        filters.action = selectedAction;
      }

      if (selectedUser) {
        filters.userId = selectedUser;
      }

      if (selectedStatus) {
        filters.status = selectedStatus;
      }

      if (startDate) {
        filters.startDate = startDate.toISOString();
      }

      if (endDate) {
        filters.endDate = endDate.toISOString();
      }

      // Real API call to get audit logs
      const response = await fetch('/v1/admin/audit/logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
        },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setLogs(data.data.logs || []);
          setTotalLogs(data.data.total || 0);
          setTotalPages(data.data.totalPages || 1);

          // Extract unique values for filters
          if (data.data.logs) {
            const actions = [...new Set(data.data.logs.map((log: any) => log.action))];
            const users = [...new Set(data.data.logs.map((log: any) => log.userName))];
            setActionTypes(actions);
            setUserNames(users);
          }
        }
      } else {
        throw new Error('Failed to fetch audit logs');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, searchQuery, selectedAction, selectedUser, selectedStatus, startDate, endDate, getAuditLogs]);

  const handleRefresh = () => {
    setCurrentPage(1);
    loadAuditLogs(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadAuditLogs();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedAction('');
    setSelectedUser('');
    setSelectedStatus('');
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
    loadAuditLogs();
  };

  const exportLogs = async (format: 'csv' | 'pdf') => {
    try {
      const filters: any = {
        format,
        page: 1,
        limit: 10000, // Export all logs
      };

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      if (selectedAction) {
        filters.action = selectedAction;
      }

      if (selectedUser) {
        filters.userId = selectedUser;
      }

      if (selectedStatus) {
        filters.status = selectedStatus;
      }

      if (startDate) {
        filters.startDate = startDate.toISOString();
      }

      if (endDate) {
        filters.endDate = endDate.toISOString();
      }

      // Real API call for export
      const response = await fetch('/v1/admin/audit/logs/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers
        },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const blob = await response.blob();
        // Handle file download on mobile
        Alert.alert('Success', `Logs exported as ${format.toUpperCase()}`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Error', 'Failed to export logs');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return colors.success;
      case 'failure':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.text.secondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderLogItem = ({ item }: { item: AuditLog }) => (
    <Card style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.logMain}>
          <Text style={styles.logAction}>{item.action}</Text>
          <Text style={styles.logResource}>{item.resource}</Text>
        </View>
        <Badge
          text={item.status}
          color={getStatusColor(item.status)}
        />
      </View>

      <View style={styles.logDetails}>
        <View style={styles.logRow}>
          <Icon name="person" size={16} color={colors.text.secondary} />
          <Text style={styles.logText}>{item.userName}</Text>
        </View>

        <View style={styles.logRow}>
          <Icon name="access-time" size={16} color={colors.text.secondary} />
          <Text style={styles.logText}>{formatTimestamp(item.timestamp)}</Text>
        </View>

        <View style={styles.logRow}>
          <Icon name="wifi" size={16} color={colors.text.secondary} />
          <Text style={styles.logText}>{item.ipAddress}</Text>
        </View>
      </View>

      {item.details && (
        <View style={styles.logDescription}>
          <Text style={styles.logDescriptionText}>{item.details}</Text>
        </View>
      )}
    </Card>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      <Button
        title="Previous"
        onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1 || loading}
        size="small"
        variant="outline"
      />

      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages} ({totalLogs} total)
      </Text>

      <Button
        title="Next"
        onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages || loading}
        size="small"
        variant="outline"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Audit Logs</Text>
        <View style={styles.headerActions}>
          <Button
            title="Export CSV"
            onPress={() => exportLogs('csv')}
            size="small"
            variant="outline"
            icon="download"
          />
          <Button
            title="Export PDF"
            onPress={() => exportLogs('pdf')}
            size="small"
            variant="outline"
            icon="picture-as-pdf"
          />
        </View>
      </View>

      {/* Filters */}
      <Card style={styles.filtersCard}>
        <Text style={styles.filtersTitle}>Filters</Text>

        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              icon="search"
              onSubmitEditing={handleSearch}
            />
          </View>
          <Button
            title="Search"
            onPress={handleSearch}
            size="small"
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterSelect}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Icon name="date-range" size={20} color={colors.text.secondary} />
            <Text style={styles.filterSelectText}>
              {startDate ? startDate.toLocaleDateString() : 'Start Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterSelect}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Icon name="date-range" size={20} color={colors.text.secondary} />
            <Text style={styles.filterSelectText}>
              {endDate ? endDate.toLocaleDateString() : 'End Date'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterSelect}
            onPress={() => {
              // Show action type picker
              Alert.alert('Select Action Type', '', [
                { text: 'Cancel', style: 'cancel' },
                ...actionTypes.map(action => ({
                  text: action,
                  onPress: () => setSelectedAction(action),
                })),
              ]);
            }}
          >
            <Text style={styles.filterSelectText}>
              {selectedAction || 'Action Type'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterSelect}
            onPress={() => {
              // Show user picker
              Alert.alert('Select User', '', [
                { text: 'Cancel', style: 'cancel' },
                ...userNames.map(user => ({
                  text: user,
                  onPress: () => setSelectedUser(user),
                })),
              ]);
            }}
          >
            <Text style={styles.filterSelectText}>
              {selectedUser || 'User'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterSelect}
            onPress={() => {
              Alert.alert('Select Status', '', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Success', onPress: () => setSelectedStatus('success') },
                { text: 'Failure', onPress: () => setSelectedStatus('failure') },
                { text: 'Warning', onPress: () => setSelectedStatus('warning') },
              ]);
            }}
          >
            <Text style={styles.filterSelectText}>
              {selectedStatus || 'Status'}
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Clear Filters"
          onPress={clearFilters}
          variant="text"
          size="small"
        />
      </Card>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartDatePicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndDatePicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {/* Logs List */}
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <>
          <FlatList
            data={logs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No audit logs found</Text>
              </Card>
            }
            contentContainerStyle={styles.listContainer}
          />

          {logs.length > 0 && renderPagination()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filtersCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  filtersTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  filterField: {
    flex: 1,
  },
  filterSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  filterSelectText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  listContainer: {
    padding: spacing.md,
    paddingTop: 0,
  },
  logCard: {
    marginBottom: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  logMain: {
    flex: 1,
  },
  logAction: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: '600',
  },
  logResource: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  logDetails: {
    gap: spacing.xs,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  logDescription: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  logDescriptionText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  pageInfo: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
  },
});