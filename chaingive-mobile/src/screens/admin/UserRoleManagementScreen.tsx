import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';

import { RootState } from '../../store/store';
import {
  fetchUsers,
  fetchUserById,
  assignUserRole,
  updateRolePermissions,
  UserSearchFilters,
  UserRole,
  UserPermissions,
} from '../../store/slices/userManagementSlice';
import { User, DEFAULT_PERMISSIONS } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

interface UserRoleManagementScreenProps {
  route?: {
    params?: {
      userId?: string;
    };
  };
}

export const UserRoleManagementScreen: React.FC<UserRoleManagementScreenProps> = ({
  route,
}) => {
  const dispatch = useDispatch();
  const { users, selectedUser, permissions, loading } = useSelector(
    (state: RootState) => state.userManagement
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('regular');
  const [editingPermissions, setEditingPermissions] = useState<UserPermissions | null>(null);
  const [filters, setFilters] = useState<UserSearchFilters>({
    limit: 50,
    offset: 0,
  });

  // Load initial data
  useEffect(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch, filters]);

  // Load specific user if provided
  useEffect(() => {
    if (route?.params?.userId) {
      dispatch(fetchUserById(route.params.userId));
    }
  }, [dispatch, route?.params?.userId]);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle role assignment
  const handleAssignRole = async (user: User, newRole: UserRole) => {
    Alert.alert(
      'Assign Role',
      `Are you sure you want to assign the ${newRole} role to ${user.firstName} ${user.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async () => {
            try {
              await dispatch(assignUserRole({
                userId: user.id,
                role: newRole,
                assignedBy: 'admin', // Would come from current user
              }));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', `Role assigned successfully`);
            } catch (error) {
              Alert.alert('Error', 'Failed to assign role');
            }
          },
        },
      ]
    );
  };

  // Handle permission editing
  const handleEditPermissions = (role: UserRole) => {
    setEditingPermissions({ ...permissions[role] });
    setSelectedRole(role);
  };

  // Save permissions
  const handleSavePermissions = async () => {
    if (!editingPermissions) return;

    try {
      await dispatch(updateRolePermissions({
        role: selectedRole,
        permissions: editingPermissions,
        updatedBy: 'admin',
      }));
      setEditingPermissions(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Permissions updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update permissions');
    }
  };

  // Render role badge
  const renderRoleBadge = (role: UserRole) => {
    const colors = {
      regular: '#666',
      agent: '#007AFF',
      admin: '#FF3B30',
    };

    return (
      <View style={[styles.roleBadge, { backgroundColor: colors[role] }]}>
        <Text style={styles.roleBadgeText}>{role.toUpperCase()}</Text>
      </View>
    );
  };

  // Render permission toggle
  const renderPermissionToggle = (
    label: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.permissionRow}>
      <Text style={styles.permissionLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: colors.primary }}
        thumbColor={value ? colors.white : '#f4f3f4'}
      />
    </View>
  );

  // Render user card
  const renderUserCard = (user: User) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userCard}
      onPress={() => dispatch(fetchUserById(user.id))}
    >
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {user.firstName[0]}{user.lastName[0]}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userMeta}>
            {renderRoleBadge(user.role)}
            <Text style={styles.userTier}>{user.tier}</Text>
            {user.isVerified && (
              <Icon name="verified" size={16} color={colors.success} />
            )}
          </View>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.roleButton}
          onPress={() => {
            // Show role selection modal
            Alert.alert(
              'Select Role',
              'Choose a role to assign:',
              [
                { text: 'Regular', onPress: () => handleAssignRole(user, 'regular') },
                { text: 'Agent', onPress: () => handleAssignRole(user, 'agent') },
                { text: 'Admin', onPress: () => handleAssignRole(user, 'admin') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Icon name="edit" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (editingPermissions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setEditingPermissions(null)}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit {selectedRole} Permissions</Text>
          <TouchableOpacity onPress={handleSavePermissions}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.permissionsContainer}>
          <Text style={styles.permissionsSubtitle}>
            Configure permissions for the {selectedRole} role
          </Text>

          {/* Gamification Permissions */}
          <View style={styles.permissionSection}>
            <Text style={styles.sectionTitle}>Gamification</Text>
            {renderPermissionToggle(
              'Create Charity Categories',
              editingPermissions.canCreateCharityCategories,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canCreateCharityCategories: value } : null)
            )}
            {renderPermissionToggle(
              'Manage NFTs',
              editingPermissions.canManageNFTs,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canManageNFTs: value } : null)
            )}
            {renderPermissionToggle(
              'Moderate Reviews',
              editingPermissions.canModerateReviews,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canModerateReviews: value } : null)
            )}
          </View>

          {/* User Management Permissions */}
          <View style={styles.permissionSection}>
            <Text style={styles.sectionTitle}>User Management</Text>
            {renderPermissionToggle(
              'Manage Users',
              editingPermissions.canManageUsers,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canManageUsers: value } : null)
            )}
            {renderPermissionToggle(
              'View Analytics',
              editingPermissions.canViewAnalytics,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canViewAnalytics: value } : null)
            )}
            {renderPermissionToggle(
              'Manage System',
              editingPermissions.canManageSystem,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canManageSystem: value } : null)
            )}
          </View>

          {/* Agent Permissions */}
          <View style={styles.permissionSection}>
            <Text style={styles.sectionTitle}>Agent Permissions</Text>
            {renderPermissionToggle(
              'Verify Users',
              editingPermissions.canVerifyUsers,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canVerifyUsers: value } : null)
            )}
            {renderPermissionToggle(
              'Process Deposits',
              editingPermissions.canProcessDeposits,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canProcessDeposits: value } : null)
            )}
            {renderPermissionToggle(
              'Manage Coin Purchases',
              editingPermissions.canManageCoinPurchases,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canManageCoinPurchases: value } : null)
            )}
          </View>

          {/* Admin Permissions */}
          <View style={styles.permissionSection}>
            <Text style={styles.sectionTitle}>Admin Permissions</Text>
            {renderPermissionToggle(
              'Assign Roles',
              editingPermissions.canAssignRoles,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canAssignRoles: value } : null)
            )}
            {renderPermissionToggle(
              'Manage Admins',
              editingPermissions.canManageAdmins,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canManageAdmins: value } : null)
            )}
            {renderPermissionToggle(
              'Access System Settings',
              editingPermissions.canAccessSystemSettings,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canAccessSystemSettings: value } : null)
            )}
            {renderPermissionToggle(
              'View Audit Logs',
              editingPermissions.canViewAuditLogs,
              (value) => setEditingPermissions(prev => prev ? { ...prev, canViewAuditLogs: value } : null)
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Role Management</Text>
        <Text style={styles.subtitle}>Assign roles and manage permissions</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            // Show filter modal
            Alert.alert('Filters', 'Filter functionality coming soon');
          }}
        >
          <Icon name="filter-list" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Role Management Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPermissions('regular')}
        >
          <Text style={styles.actionButtonText}>Edit Regular Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPermissions('agent')}
        >
          <Text style={styles.actionButtonText}>Edit Agent Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditPermissions('admin')}
        >
          <Text style={styles.actionButtonText}>Edit Admin Permissions</Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <ScrollView style={styles.usersList}>
        {loading ? (
          <Text style={styles.loadingText}>Loading users...</Text>
        ) : filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>No users found</Text>
        ) : (
          filteredUsers.map(renderUserCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    flex: 1,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  saveButton: {
    ...typography.button,
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    ...typography.body,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  actionButtonText: {
    ...typography.button,
    color: colors.white,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.button,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  userEmail: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  roleBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
  },
  userTier: {
    ...typography.caption,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  userActions: {
    flexDirection: 'row',
  },
  roleButton: {
    padding: spacing.sm,
  },
  permissionsContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  permissionsSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  permissionSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  permissionLabel: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});