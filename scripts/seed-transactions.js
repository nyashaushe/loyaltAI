const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function seedTransactions() {
  try {
    console.log('Seeding transactions...');
    
    // Get the first tenant and users
    const tenant = await prisma.tenant.findFirst();
    const users = await prisma.user.findMany({
      where: { role: 'customer' }
    });
    
    if (!tenant || users.length === 0) {
      console.log('No tenant or users found. Please run the main seed script first.');
      return;
    }

    const transactions = [
      // User 1 transactions
      {
        userId: users[0].id,
        tenantId: tenant.id,
        amount: 25.50,
        pointsEarned: 51,
        pointsRedeemed: 0,
        location: "Downtown Store",
        paymentMethod: "Credit Card",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        userId: users[0].id,
        tenantId: tenant.id,
        amount: 18.75,
        pointsEarned: 37,
        pointsRedeemed: 0,
        location: "Mall Location",
        paymentMethod: "Mobile Payment",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        userId: users[0].id,
        tenantId: tenant.id,
        amount: 32.00,
        pointsEarned: 64,
        pointsRedeemed: 100, // Redeemed free coffee
        location: "Downtown Store",
        paymentMethod: "Cash",
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
      },
      
      // User 2 transactions
      {
        userId: users[1].id,
        tenantId: tenant.id,
        amount: 45.25,
        pointsEarned: 90,
        pointsRedeemed: 0,
        location: "Airport Location",
        paymentMethod: "Credit Card",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        userId: users[1].id,
        tenantId: tenant.id,
        amount: 15.50,
        pointsEarned: 31,
        pointsRedeemed: 0,
        location: "Downtown Store",
        paymentMethod: "Mobile Payment",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        userId: users[1].id,
        tenantId: tenant.id,
        amount: 28.75,
        pointsEarned: 57,
        pointsRedeemed: 150, // Redeemed free pastry
        location: "Mall Location",
        paymentMethod: "Credit Card",
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
      },
      
      // Historical transactions for analytics
      {
        userId: users[0].id,
        tenantId: tenant.id,
        amount: 22.00,
        pointsEarned: 44,
        pointsRedeemed: 0,
        location: "Downtown Store",
        paymentMethod: "Credit Card",
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
      },
      {
        userId: users[1].id,
        tenantId: tenant.id,
        amount: 35.50,
        pointsEarned: 71,
        pointsRedeemed: 0,
        location: "Airport Location",
        paymentMethod: "Credit Card",
        timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // 12 days ago
      },
      {
        userId: users[0].id,
        tenantId: tenant.id,
        amount: 19.25,
        pointsEarned: 38,
        pointsRedeemed: 0,
        location: "Mall Location",
        paymentMethod: "Mobile Payment",
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
      },
      {
        userId: users[1].id,
        tenantId: tenant.id,
        amount: 42.75,
        pointsEarned: 85,
        pointsRedeemed: 0,
        location: "Downtown Store",
        paymentMethod: "Credit Card",
        timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
      }
    ];

    for (const transaction of transactions) {
      await prisma.transaction.create({
        data: transaction
      });
    }

    console.log('Transactions seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTransactions();