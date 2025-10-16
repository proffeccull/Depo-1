import prisma from './prisma';

// Permission definitions
export const PERMISSIONS = {
  // User management
  USERS: {
    READ: 'users:read',
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    MANAGE: 'users:manage',
  },
  // Agent management
  AGENTS: {
    READ: 'agents:read',
    CREATE: 'agents:create',
    UPDATE: 'agents:update',
    DELETE: 'agents:delete',
    MANAGE: 'agents:manage',
    SUSPEND: 'agents:suspend',
  },
  // Transaction management
  TRANSACTIONS: {
    READ: 'transactions:read',
    UPDATE: 'transactions:update',
    REFUND: 'transactions:refund',
    MANAGE: 'transactions:manage',
  },
  // System administration
  SYSTEM: {
    CONFIG: 'system:config',
    LOGS: 'system:logs',
    METRICS: 'system:metrics',
    BACKUP: 'system:backup',
  },
  // Dispute management
  DISPUTES: {
    READ: 'disputes:read',
    MEDIATE: 'disputes:mediate',
    RESOLVE: 'disputes:resolve',
  },
  // KYC management
  KYC: {
    READ: 'kyc:read',
    APPROVE: 'kyc:approve',
    REJECT: 'kyc:reject',
  },
  // Coin management
  COINS: {
    DISTRIBUTE: 'coins:distribute',
    MANAGE_INVENTORY: 'coins:manage_inventory',
  },
} as const;

// Role definitions with their permissions
export const ROLE_PERMISSIONS = {
  user: [
    // Basic user permissions (none for now)
  ],
  agent: [
    PERMISSIONS.AGENTS.READ,
    PERMISSIONS.TRANSACTIONS.READ,
    PERMISSIONS.COINS.MANAGE_INVENTORY,
  ],
  csc_council: [
    // All permissions for CSC Council
    ...Object.values(PERMISSIONS.USERS),
    ...Object.values(PERMISSIONS.AGENTS),
    ...Object.values(PERMISSIONS.TRANSACTIONS),
    ...Object.values(PERMISSIONS.SYSTEM),
    ...Object.values(PERMISSIONS.DISPUTES),
    ...Object.values(PERMISSIONS.KYC),
    ...Object.values(PERMISSIONS.COINS),
  ],
} as const;

// Permission hierarchy levels
export const PERMISSION_LEVELS = {
  user: 1,
  agent: 2,
  csc_council: 3,
} as const;

export type Permission = typeof PERMISSIONS;
export type RoleName = keyof typeof ROLE_PERMISSIONS;
export type PermissionString = string;

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: PermissionString): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userRole: {
          select: {
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user?.userRole?.rolePermissions) {
      return false;
    }

    return user.userRole.rolePermissions.some(rp => rp.permission.name === permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(userId: string, permissions: PermissionString[]): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(userId: string, permissions: PermissionString[]): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<PermissionString[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userRole: {
          select: {
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user?.userRole?.rolePermissions) {
      return [];
    }

    return user.userRole.rolePermissions.map(rp => rp.permission.name);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Check if a role has a minimum level
 */
export async function hasMinimumRoleLevel(userId: string, minLevel: number): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userRole: {
          select: {
            level: true,
          },
        },
      },
    });

    return (user?.userRole?.level ?? 0) >= minLevel;
  } catch (error) {
    console.error('Error checking role level:', error);
    return false;
  }
}

/**
 * Initialize default roles and permissions
 */
export async function initializeRolesAndPermissions(): Promise<void> {
  try {
    // Create roles
    for (const [roleName, level] of Object.entries(PERMISSION_LEVELS)) {
      await prisma.role.upsert({
        where: { name: roleName },
        update: { level },
        create: {
          name: roleName,
          displayName: roleName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          level,
          description: `Default ${roleName} role`,
        },
      });
    }

    // Create permissions
    const allPermissions = [
      ...Object.values(PERMISSIONS.USERS),
      ...Object.values(PERMISSIONS.AGENTS),
      ...Object.values(PERMISSIONS.TRANSACTIONS),
      ...Object.values(PERMISSIONS.SYSTEM),
      ...Object.values(PERMISSIONS.DISPUTES),
      ...Object.values(PERMISSIONS.KYC),
      ...Object.values(PERMISSIONS.COINS),
    ];

    for (const permissionName of allPermissions) {
      const [resource, action] = permissionName.split(':');
      const level = PERMISSION_LEVELS[resource as keyof typeof PERMISSION_LEVELS] || 1;

      await prisma.permission.upsert({
        where: { name: permissionName },
        update: {},
        create: {
          name: permissionName,
          displayName: `${action} ${resource}`.replace(/\b\w/g, l => l.toUpperCase()),
          resource,
          action,
          level,
          description: `Allows ${action} operations on ${resource}`,
        },
      });
    }

    // Assign permissions to roles
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (!role) continue;

      for (const permissionName of permissions) {
        const permission = await prisma.permission.findUnique({
          where: { name: permissionName },
        });

        if (!permission) continue;

        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    console.log('Roles and permissions initialized successfully');
  } catch (error) {
    console.error('Error initializing roles and permissions:', error);
    throw error;
  }
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(userId: string, roleName: RoleName): Promise<void> {
  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { roleId: role.id },
    });
  } catch (error) {
    console.error('Error assigning role to user:', error);
    throw error;
  }
}

/**
 * Get role hierarchy (higher level roles inherit lower level permissions)
 */
export function getInheritedPermissions(roleName: RoleName): PermissionString[] {
  const roleLevel = PERMISSION_LEVELS[roleName];
  const inheritedPermissions: PermissionString[] = [];

  // Add permissions from current role and all lower levels
  for (const [name, level] of Object.entries(PERMISSION_LEVELS)) {
    if (level <= roleLevel) {
      inheritedPermissions.push(...(ROLE_PERMISSIONS[name as RoleName] || []));
    }
  }

  return [...new Set(inheritedPermissions)]; // Remove duplicates
}

/**
 * Permission hierarchy documentation
 *
 * Permission Structure:
 * - user (level 1): Basic platform access
 *   - No admin permissions
 *
 * - agent (level 2): Agent operations
 *   - Can read users, transactions, disputes
 *   - Can manage coin inventory
 *   - Can sell coins to users
 *
 * - csc_council (level 3): Full administrative access
 *   - All permissions across all resources
 *   - Can manage users, agents, transactions, system settings
 *   - Can approve/reject KYC, mediate disputes
 *   - Can distribute coins, manage inventory
 *
 * Permission Inheritance:
 * Higher level roles automatically inherit all permissions from lower level roles.
 * For example, csc_council has all agent permissions plus additional admin permissions.
 *
 * Permission Format: resource:action
 * Examples:
 * - users:read - Can view user information
 * - users:create - Can create new users
 * - users:update - Can modify user details
 * - users:delete - Can delete/deactivate users
 * - users:manage - Can ban/unban users
 *
 * - agents:read - Can view agent information
 * - agents:create - Can create new agents
 * - agents:update - Can modify agent details
 * - agents:delete - Can delete agents
 * - agents:manage - Can suspend/activate agents
 * - agents:suspend - Can suspend agents
 *
 * - transactions:read - Can view transaction details
 * - transactions:update - Can modify transaction status
 * - transactions:refund - Can process refunds
 * - transactions:manage - Can override transactions
 *
 * - system:config - Can modify system configuration
 * - system:logs - Can view system logs
 * - system:metrics - Can view system metrics
 * - system:backup - Can perform system backups
 *
 * - disputes:read - Can view dispute details
 * - disputes:mediate - Can mediate disputes
 * - disputes:resolve - Can resolve disputes
 *
 * - kyc:read - Can view KYC submissions
 * - kyc:approve - Can approve KYC verifications
 * - kyc:reject - Can reject KYC verifications
 *
 * - coins:distribute - Can distribute coins to users
 * - coins:manage_inventory - Can manage coin inventory
 */