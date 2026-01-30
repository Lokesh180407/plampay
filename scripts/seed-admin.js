/**
 * Seed Admin User Script
 * Creates an admin user for testing
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../src/config/prisma');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@plampay.com';
  const phone = process.env.ADMIN_PHONE || '+1234567890';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  try {
    console.log('🌱 Seeding admin user...\n');

    // Check if admin exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { role: 'ADMIN' }],
      },
    });

    if (existing) {
      console.log('⚠️  Admin user already exists');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role: 'ADMIN',
        kycStatus: 'APPROVED',
        wallet: {
          create: {
            balance: 0,
            currency: 'INR',
          },
        },
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📧 Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phone}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${admin.id}\n`);
  } catch (error) {
    console.error('❌ Failed to seed admin:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
