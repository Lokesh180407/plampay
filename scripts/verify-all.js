const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const testEmail = 'testuser' + Date.now() + '@plampay.com';
    const testPhone = '1' + Math.floor(Math.random() * 1000000000);
    const testPassword = 'Password123!';
    const topupAmount = 1000;

    try {
        console.log('Testing database connection and functionality...');
        await prisma.$connect();
        console.log('✅ Database connected');

        console.log(`👤 Creating test user: ${testEmail}`);
        const passwordHash = await bcrypt.hash(testPassword, 10);

        const user = await prisma.user.create({
            data: {
                email: testEmail,
                phone: testPhone,
                passwordHash,
                wallet: {
                    create: {
                        balance: 0,
                        currency: 'INR',
                    },
                },
            },
            include: {
                wallet: true,
            },
        });
        console.log(`✅ User created with ID: ${user.id}`);
        console.log(`💰 Initial balance: ${user.wallet.balance} ${user.wallet.currency}`);

        console.log(`➕ Adding test money: ${topupAmount}...`);

        // Create transaction and update balance in one go for testing
        const newBalance = Number(user.wallet.balance) + topupAmount;

        const result = await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    walletId: user.wallet.id,
                    amount: topupAmount,
                    type: 'TOPUP',
                    status: 'SUCCESS',
                    description: 'Testing amount addition',
                    gatewayProvider: 'TEST_SYSTEM',
                    gatewayOrderId: 'TEST_' + Date.now()
                }
            }),
            prisma.wallet.update({
                where: { id: user.wallet.id },
                data: { balance: newBalance }
            })
        ]);

        console.log(`✅ Transaction successful: ${result[0].id}`);
        console.log(`📊 Final balance: ${result[1].balance} ${result[1].currency}`);
        console.log('\n✨ Database is fully functional and money addition works!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.stack) console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
