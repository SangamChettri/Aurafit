const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin users...');
    
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Active: ${user.is_active}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('---');
    });

    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found! You need to create an admin user.');
    }

  } catch (error) {
    console.error('❌ Error checking admin users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
