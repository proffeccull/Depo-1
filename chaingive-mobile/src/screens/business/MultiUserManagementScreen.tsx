import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  permissions: string[];
}

interface RolePermissions {
  role: User['role'];
  permissions: string[];
  description: string;
}

const MultiUserManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  const rolePermissions: RolePermissions[] = [
    {
      role: 'admin',
      permissions: ['manage_users', 'manage_settings', 'view_reports', 'process_transactions', 'manage_products'],
      description: 'Full access to all features and settings',
    },
    {
      role: 'manager',
      permissions: ['manage_users', 'view_reports', 'process_transactions', 'manage_products'],
      description: 'Can manage operations and view all reports',
    },
    {
      role: 'user',
      permissions: ['process_transactions', 'manage_products', 'view_reports'],
      description: 'Can process transactions and manage assigned products',
    },
    {
      role: 'viewer',
      permissions: ['view_reports'],
      description: 'Read-only access to reports and analytics',
    },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Mock data - replace with actual API call
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'John Admin',
          email: 'john@company.com',
          role: 'admin',
          status: 'active',
          lastActive: '2024-01-15 14:30',
          permissions: ['manage_users', 'manage_settings', 'view_reports', 'process_transactions', 'manage_products'],
        },
        {
          id: '2',
          name: 'Sarah Manager',
          email: 'sarah@company.com',
          role: 'manager',
          status: 'active',
          lastActive: '2024-01-15 13:45',
          permissions: ['manage_users', 'view_reports', 'process_transactions', 'manage_products'],
        },
        {
          id: '3',
          name: 'Mike User',
          email: 'mike@company.com',
          role: 'user',
          status: 'active',
          lastActive: '2024-01-15 12:20',
          permissions: ['process_transactions', 'manage_products', 'view_reports'],
        },
        {
          id: '4',
          name: 'Lisa Viewer',
          email: 'lisa@company.com',
          role: 'viewer',
          status: 'inactive',
          lastActive: '2024-01-10 09:15',
          permissions: ['view_reports'],
        },
        {
          id: '5',
          name: 'Tom Pending',
          email: 'tom@company.com',
          role: 'user',
          status: 'pending',
          lastActive: 'Never',
          permissions: ['process_transactions', 'manage_products', 'view_reports'],
        },
      ];
      setUsers(mockUsers);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to add user screen
    Alert.alert('Add User', 'Navigate to user invitation form');
  };

  const handleEditUser = (user: User) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to edit user screen
    Alert.alert('Edit User', `Edit permissions for ${user.name}`);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      // TODO: API call to update user status
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleRemoveUser = (user: User) => {
    Alert.alert(
      'Remove User',
      `Are you sure you want to remove ${user.name} from the organization?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: API call to remove user
              setUsers(prev => prev.filter(u => u.id !== user.id));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove user');
            }
          }
        }
      ]
    );
  };

  const handleResendInvite = (user: User) => {
    if (user.status !== 'pending') return;

    // TODO: API call to resend invitation
    Alert.alert('Resend Invitation', `Invitation resent to ${user.email}`);
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.status === filter;
  });

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.gray[400];
      case 'pending': return colors.warning;
      default: return colors.gray[400];
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return colors.error;
      case 'manager': return colors.primary;
      case 'user': return colors.warning;
      case 'viewer': return colors.gray[500];
      default: return colors.gray[400];
    }
  };

  const renderUser = ({ item: user }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditUser(user)}
          >
            <Icon name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleStatus(user)}
          >
            <Icon
              name={user.status === 'active' ? 'person-off' : 'person'}
              size={20}
              color={getStatusColor(user.status)}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRemoveUser(user)}
          >
            <Icon name="delete" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Role:</Text>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
            <Text style={styles.statusText}>{user.status.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Last Active:</Text>
          <Text style={styles.detailValue}>{user.lastActive}</Text>
        </View>
      </View>

      {user.status === 'pending' && (
        <TouchableOpacity
          style={styles.resendButton}
          onPress={() => handleResendInvite(user)}
        >
          <Icon name="send" size={16} color={colors.primary} />
          <Text style={styles.resendButtonText}>Resend Invitation</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === filterType && styles.filterButtonActive]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[styles.filterButtonText, filter === filterType && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderRoleInfo = () => (
    <View style={styles.roleInfoSection}>
      <Text style={styles.sectionTitle}>Role Permissions</Text>
      {rolePermissions.map((roleInfo) => (
        <View key={roleInfo.role} style={styles.roleCard}>
          <View style={styles.roleHeader}>
            <Text style={styles.roleName}>{roleInfo.role.charAt(0).toUpperCase() + roleInfo.role.slice(1)}</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(roleInfo.role) }]}>
              <Text style={styles.roleBadgeText}>{roleInfo.permissions.length} permissions</Text>
            </View>
          </View>
          <Text style={styles.roleDescription}>{roleInfo.description}</Text>
          <View style={styles.permissionsList}>
            {roleInfo.permissions.map((permission) => (
              <View key={permission} style={styles.permissionChip}>
                <Text style={styles.permissionText}>{permission.replace('_', ' ')}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={handleAddUser}>
          <Icon name="person-add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('active', 'Active')}
        {renderFilterButton('inactive', 'Inactive')}
        {renderFilterButton('pending', 'Pending')}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.usersList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="people" size={48} color={colors.gray[300]} />
                <Text style={styles.emptyStateText}>No users found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {filter === 'all' ? 'Add team members to get started' : `No ${filter} users`}
                </Text>
              </View>
            }
            ListFooterComponent={renderRoleInfo}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.gray[100],
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
  content: {
    flex: 1,
  },
  loader: {
    marginTop: spacing.xl,
  },
  usersList: {
    padding: spacing.md,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  userEmail: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  userDetails: {
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    padding: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  roleText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  resendButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  roleInfoSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  roleName: {
    ...typography.h4,
    color: colors.text.primary,
    fontWeight: 'bold',
  },
  roleBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
  },
  roleDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionChip: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  permissionText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.h4,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    ...typography.bodyRegular,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default MultiUserManagementScreen;