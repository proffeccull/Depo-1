import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useAdmin } from '../../hooks/useAdmin';
import { Card, Button, Badge, LoadingSpinner } from '../../components/common';
import { colors, spacing, typography, borderRadius } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Table, Row, Rows } from 'react-native-table-component';

type AdminDashboardNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: string;
  tier: number;
  trustScore: number;
  isActive: boolean;
  isBanned: boolean;
  locationCity: string;
  createdAt: string;
}

export default function UserManagementScreen() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  const { getUsers, banUser, unbanUser, promoteToAgent } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    tier: '',
    isActive: '',
    isBanned: '',
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    agents: 0,
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        ...filters,
        search: searchQuery,
        limit: 50,
      });

      if (response && response.success) {
        setUsers(response.data || []);
        // Update user statistics
        updateUserStats(response.data || []);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStats = (userList: User[]) => {
    const totalUsers = userList.length;
    const activeUsers = userList.filter(u => u.isActive && !u.isBanned).length;
    const bannedUsers = userList.filter(u => u.isBanned).length;
    const agentUsers = userList.filter(u => u.role === 'agent').length;

    setUserStats({
      total: totalUsers,
      active: activeUsers,
      banned: bannedUsers,
      agents: agentUsers,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleBanUser = async (userId: string) => {
    Alert.alert(
      'Ban User',
      'Are you sure you want to ban this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban',
          style: 'destructive',
          onPress: async () => {
            try {
              const reason = 'Violation of platform policies';
              await banUser(userId, reason);
              await loadUsers();
              Alert.alert('Success', 'User has been banned');
            } catch (error) {
              Alert.alert('Error', 'Failed to ban user');
            }
          },
        },
      ]
    );
  };

  const handleUnbanUser = async (userId: string) => {
    Alert.alert(
      'Unban User',
      'Are you sure you want to unban this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unban',
          onPress: async () => {
            try {
              await unbanUser(userId);
              await loadUsers();
              Alert.alert('Success', 'User has been unbanned');
            } catch (error) {
              Alert.alert('Error', 'Failed to unban user');
            }
          },
        },
      ]
    );
  };

  const handlePromoteToAgent = async (userId: string) => {
    Alert.alert(
      'Promote to Agent',
      'Are you sure you want to promote this user to agent?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Promote',
          onPress: async () => {
            try {
              await promoteToAgent(userId);
              await loadUsers();
              Alert.alert('Success', 'User has been promoted to agent');
            } catch (error) {
              Alert.alert('Error', 'Failed to promote user');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'beginner':
        return colors.primary;
      case 'power_partner':
        return colors.success;
      case 'agent':
        return colors.warning;
      default:
        return colors.text.secondary;
    }
  };

  const tableHead = ['Name', 'Phone', 'Role', 'Tier', 'Status', 'Actions'];
  const tableData = users.map((user) => [
    `${user.firstName} ${user.lastName}`,
    user.phoneNumber,
    user.role,
    `Tier ${user.tier}`,
    user.isBanned ? 'Banned' : user.isActive ? 'Active' : 'Inactive',
    user.id, // For actions
  ]);

  const renderActions = (userId: string, user: User) => (
    <View style={styles.actionsContainer}>
      {!user.isBanned && user.role !== 'agent' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.promoteButton]}
          onPress={() => handlePromoteToAgent(userId)}
        >
          <Icon name="person-add" size={16} color={colors.white} />
        </TouchableOpacity>
      )}
      {user.isBanned ? (
        <TouchableOpacity
          style={[styles.actionButton, styles.unbanButton]}
          onPress={() => handleUnbanUser(userId)}
        >
          <Icon name="undo" size={16} color={colors.white} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, styles.banButton]}
          onPress={() => handleBanUser(userId)}
        >
          <Icon name="block" size={16} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !users.length) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Filters */}
      <Card style={styles.filtersCard}>
        <Text style={styles.sectionTitle}>Filters</Text>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadUsers}
          />
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Role</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilters({ ...filters, role: filters.role ? '' : 'agent' })}
            >
              <Text style={styles.filterButtonText}>
                {filters.role || 'All Roles'}
              </Text>
              <Icon name="arrow-drop-down" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Status</Text>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilters({ ...filters, isBanned: filters.isBanned ? '' : 'false' })}
            >
              <Text style={styles.filterButtonText}>
                {filters.isBanned === 'false' ? 'Active Only' : 'All Status'}
              </Text>
              <Icon name="arrow-drop-down" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* User Statistics */}
      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>User Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.total}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.banned}</Text>
            <Text style={styles.statLabel}>Banned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.agents}</Text>
            <Text style={styles.statLabel}>Agents</Text>
          </View>
        </View>
      </Card>

      {/* Users Table */}
      <Card style={styles.tableCard}>
        <Text style={styles.sectionTitle}>Users ({users.length})</Text>

        <ScrollView horizontal>
          <View style={styles.tableContainer}>
            <Table borderStyle={{ borderWidth: 1, borderColor: colors.border }}>
              <Row
                data={tableHead}
                style={styles.tableHead}
                textStyle={styles.tableHeadText}
                widthArr={[120, 120, 80, 60, 80, 120]}
              />
              {tableData.map((rowData, index) => (
                <Row
                  key={index}
                  data={[
                    rowData[0],
                    rowData[1],
                    <Badge
                      key="role"
                      text={rowData[2]}
                      color={getRoleColor(rowData[2])}
                      size="small"
                    />,
                    rowData[3],
                    <Badge
                      key="status"
                      text={rowData[4]}
                      color={rowData[4] === 'Banned' ? colors.error : colors.success}
                      size="small"
                    />,
                    renderActions(rowData[5], users[index]),
                  ]}
                  style={styles.tableRow}
                  textStyle={styles.tableText}
                  widthArr={[120, 120, 80, 60, 80, 120]}
                />
              ))}
            </Table>
          </View>
        </ScrollView>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  filtersCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  filterLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  filterButtonText: {
    ...typography.body,
    color: colors.text.primary,
  },
  tableCard: {
    marginBottom: spacing.lg,
  },
  tableContainer: {
    flex: 1,
  },
  tableHead: {
    height: 40,
    backgroundColor: colors.primary,
  },
  tableHeadText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  tableRow: {
    height: 50,
    backgroundColor: colors.surface,
  },
  tableText: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
    padding: spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  promoteButton: {
    backgroundColor: colors.success,
  },
  banButton: {
    backgroundColor: colors.error,
  },
  unbanButton: {
    backgroundColor: colors.warning,
  },
  statsCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
    marginVertical: spacing.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
