const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

async function seedRewards() {
  try {
    console.log('Seeding rewards...');
    
    // Get the first tenant
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      console.log('No tenant found. Please run the main seed script first.');
      return;
    }

    const rewards = [
      {
        name: "Free Coffee",
        description: "Redeem for any coffee beverage of your choice",
        pointsCost: 100,
        category: "Beverages",
        isActive: true,
        usageLimit: 100,
        usageCount: 15
      },
      {
        name: "Free Pastry",
        description: "Get any pastry or dessert item for free",
        pointsCost: 150,
        category: "Food",
        isActive: true,
        usageLimit: 50,
        usageCount: 8
      },
      {
        name: "50% Off Any Item",
        description: "Get 50% off any menu item",
        pointsCost: 200,
        category: "Discounts",
        isActive: true,
        usageLimit: 25,
        usageCount: 3
      },
      {
        name: "Free Appetizer",
        description: "Redeem for any appetizer or side dish",
        pointsCost: 120,
        category: "Food",
        isActive: true,
        usageLimit: 75,
        usageCount: 12
      },
      {
        name: "Birthday Special",
        description: "Free dessert on your birthday",
        pointsCost: 50,
        category: "Special",
        isActive: true,
        usageLimit: 1,
        usageCount: 0
      }
    ];

    for (const reward of rewards) {
      await prisma.reward.create({
        data: {
          ...reward,
          tenantId: tenant.id
        }
      });
    }

    console.log('Rewards seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding rewards:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRewards();