const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = require('../src/config/prisma');
const authService = require('../src/services/auth.service');
const walletService = require('../src/services/wallet.service');

async function main() {
    const testEmail = 'testuser@plampay.com';
    const testPhone = '1234567890';
    const testPassword = 'Password123!';
    const topupAmount = 500;

    try {
        console.log(`🔍 Checking if test user exists: ${testEmail}`);
        let user = await prisma.user.findUnique({
            where: { email: testEmail },
            include: { wallet: true }
        });

        if (!user) {
            console.log('👤 Creating new test user...');
            const result = await authService.signup({
                email: testEmail,
                phone: testPhone,
                password: testPassword
            });
            user = await prisma.user.findUnique({
                where: { id: result.user.id },
                include: { wallet: true }
            });
            console.log('✅ Test user created.');
        } else {
            console.log('✅ Test user already exists.');
        }

        console.log(`💰 Current balance: ${user.wallet.balance} ${user.wallet.currency}`);

        console.log(`➕ Adding test amount: ${topupAmount} ${user.wallet.currency}...`);

        // Create a pending transaction
        const transaction = await walletService.createTopupOrder(user.id, topupAmount);
        console.log(`📝 Transaction created: ${transaction.id} (Status: ${transaction.status})`);

        // Simulate successful payment completion
        const completion = await walletService.completeTopup(
            transaction.id,
            'T_TEST_' + Date.now(),
            'TEST_GATEWAY'
        );

        console.log(`✅ Money added successfully!`);
        console.log(`📊 New balance: ${completion.newBalance} ${user.wallet.currency}`);

    } catch (error) {
        console.error('❌ Error in testing money addition:', error.message);
        if (error.stack) console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

main();
