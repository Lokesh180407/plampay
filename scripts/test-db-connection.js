const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = require('../src/config/prisma');

async function main() {
    try {
        console.log('Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        const userCountBefore = await prisma.user.count();
        console.log(`User count before: ${userCountBefore}`);

        const email = 'test' + Date.now() + '@example.com';
        console.log(`👤 Creating test user: ${email}`);

        const hash = await bcrypt.hash('password123', 10);
        const user = await prisma.user.create({
            data: {
                email: email,
                phone: 'test_' + Date.now(),
                passwordHash: hash,
                wallet: {
                    create: {
                        balance: 0,
                        currency: 'INR'
                    }
                }
            },
            include: {
                wallet: true
            }
        });
        console.log(`✅ User created: ${user.id}`);

        console.log('💰 Adding 500 testing amount...');
        const updatedWallet = await prisma.wallet.update({
            where: { id: user.wallet.id },
            data: {
                balance: 500,
                transfers: {
                    create: {
                        amount: 500,
                        type: 'TOPUP',
                        status: 'SUCCESS',
                        description: 'Testing amount addition'
                    }
                }
            }
        });

        console.log(`✅ New balance: ${updatedWallet.balance} INR`);

        const userCountAfter = await prisma.user.count();
        console.log(`User count after: ${userCountAfter}`);

        console.log('✨ ALL SYSTEMS FUNCTIONAL');
    } catch (error) {
        console.error('❌ FAILED:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
