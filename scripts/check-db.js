const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check tenants
    const tenants = await prisma.tenant.findMany();
    console.log('Tenants in database:', tenants.length);
    tenants.forEach(tenant => {
      console.log(`- ${tenant.name} (${tenant.slug})`);
    });
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        createdAt: true
      }
    });
    console.log('Users in database:', users.length);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });
    
    // Check if we can create a test user
    console.log('\nTesting user creation...');
    const testUser = await prisma.user.create({
      data: {
        email: 'test-verification@example.com',
        name: 'Test Verification User',
        role: 'customer',
        passwordHash: 'test-hash',
        tenantId: tenants[0]?.id || 'test-tenant'
      }
    });
    console.log('Test user created:', testUser.email);
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('Test user cleaned up');
    
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();