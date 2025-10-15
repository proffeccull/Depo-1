import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, UserRole, UserPermissions, DEFAULT_PERMISSIONS } from '../../types';

// Types
export interface UserManagementState {
  users: User[];
  selectedUser: User | null;
  roles: UserRole[];
  permissions: Record<UserRole, UserPermissions>;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface UserUpdateData {
  userId: string;
  updates: Partial<User>;
}

export interface RoleAssignmentData {
  userId: string;
  role: UserRole;
  assignedBy: string;
}

export interface PermissionUpdateData {
  role: UserRole;
  permissions: Partial<UserPermissions>;
  updatedBy: string;
}

export interface UserSearchFilters {
  role?: UserRole;
  isVerified?: boolean;
  isAgent?: boolean;
  tier?: 'Tier 1' | 'Tier 2' | 'Tier 3';
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

// Initial state
const initialState: UserManagementState = {
  users: [],
  selectedUser: null,
  roles: ['regular', 'agent', 'admin'],
  permissions: DEFAULT_PERMISSIONS,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (filters?: UserSearchFilters) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(`/api/admin/users?${queryParams}`);
    return response.json();
  }
);

export const fetchUserById = createAsyncThunk(
  'userManagement/fetchUserById',
  async (userId: string) => {
    const response = await fetch(`/api/admin/users/${userId}`);
    return response.json();
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ userId, updates }: UserUpdateData) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  }
);

export const assignUserRole = createAsyncThunk(
  'userManagement/assignRole',
  async ({ userId, role, assignedBy }: RoleAssignmentData) => {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, assignedBy }),
    });
    return response.json();
  }
);

export const updateRolePermissions = createAsyncThunk(
  'userManagement/updatePermissions',
  async ({ role, permissions, updatedBy }: PermissionUpdateData) => {
    const response = await fetch(`/api/admin/roles/${role}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions, updatedBy }),
    });
    return response.json();
  }
);

export const suspendUser = createAsyncThunk(
  'userManagement/suspendUser',
  async ({ userId, reason, suspendedBy }: {
    userId: string;
    reason: string;
    suspendedBy: string;
  }) => {
    const response = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, suspendedBy }),
    });
    return response.json();
  }
);

export const reactivateUser = createAsyncThunk(
  'userManagement/reactivateUser',
  async ({ userId, reactivatedBy }: { userId: string; reactivatedBy: string }) => {
    const response = await fetch(`/api/admin/users/${userId}/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactivatedBy }),
    });
    return response.json();
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async ({ userId, deletedBy, reason }: {
    userId: string;
    deletedBy: string;
    reason: string;
  }) => {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletedBy, reason }),
    });
    return response.json();
  }
);

export const bulkUpdateUsers = createAsyncThunk(
  'userManagement/bulkUpdate',
  async ({ userIds, updates, updatedBy }: {
    userIds: string[];
    updates: Partial<User>;
    updatedBy: string;
  }) => {
    const response = await fetch('/api/admin/users/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds, updates, updatedBy }),
    });
    return response.json();
  }
);

export const exportUsers = createAsyncThunk(
  'userManagement/exportUsers',
  async (filters?: UserSearchFilters) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const response = await fetch(`/api/admin/users/export?${queryParams}`);
    return response.blob();
  }
);

// Slice
const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    updatePermissions: (state, action: PayloadAction<{ role: UserRole; permissions: UserPermissions }>) => {
      state.permissions[action.payload.role] = action.payload.permissions;
    },
    clearUserManagementError: (state) => {
      state.error = null;
    },
    resetUserManagementState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload.user;
      });

    // Update user
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      });

    // Assign role
    builder
      .addCase(assignUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.selectedUser?.id === updatedUser.id) {
          state.selectedUser = updatedUser;
        }
      });

    // Update permissions
    builder
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        state.permissions[action.payload.role] = action.payload.permissions;
      });

    // Suspend user
    builder
      .addCase(suspendUser.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      });

    // Reactivate user
    builder
      .addCase(reactivateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      });

    // Delete user
    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload.userId);
        if (state.selectedUser?.id === action.payload.userId) {
          state.selectedUser = null;
        }
      });

    // Bulk update
    builder
      .addCase(bulkUpdateUsers.fulfilled, (state, action) => {
        action.payload.users.forEach(updatedUser => {
          const index = state.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
        });
      });
  },
});

export const {
  setSelectedUser,
  updateUserInList,
  removeUserFromList,
  updatePermissions,
  clearUserManagementError,
  resetUserManagementState,
} = userManagementSlice.actions;

export default userManagementSlice.reducer;