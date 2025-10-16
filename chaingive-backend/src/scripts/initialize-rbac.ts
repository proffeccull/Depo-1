import { initializeRolesAndPermissions } from '../utils/permissions';
import prisma from '../utils/prisma';

async function initializeRBAC() {
  try {
    console.log('Initializing RBAC system...');

    // Initialize roles and permissions
    await initializeRolesAndPermissions();

    // Assign roles to existing users based on their current role field
    const users = await prisma.user.findMany({
      select: {
        id: true,
        role: true,
      },
    });

    console.log(`Found ${users.length} users to assign roles to`);

    for (const user of users) {
      let roleName: string;

      // Map existing role strings to new role names
      switch (user.role) {
        case 'csc_council':
          roleName = 'csc_council';
          break;
        case 'agent':
          roleName = 'agent';
          break;
        case 'power_partner':
          roleName = 'agent'; // Map power_partner to agent for now
          break;
        default:
          roleName = 'user';
          break;
      }

      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId: role.id },
        });
        console.log(`Assigned role ${roleName} to user ${user.id}`);
      }
    }

    console.log('RBAC system initialized successfully');
  } catch (error) {
    console.error('Error initializing RBAC system:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeRBAC()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default initializeRBAC;